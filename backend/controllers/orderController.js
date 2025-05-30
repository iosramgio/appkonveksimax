const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Payment = require("../models/Payment");
const Cart = require("../models/Cart");
const ActivityLog = require("../models/ActivityLog");
const whatsappNotifier = require("../utils/whatsappNotifier");
const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

// Fungsi untuk generate order number
async function generateOrderNumber() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  // Cari order terakhir hari ini untuk mendapatkan sequence berikutnya
  const latestOrder = await mongoose
    .model("Order") // Menggunakan mongoose.model("Order") karena kita di luar model
    .findOne({
      orderNumber: new RegExp(`^KVK-${year}${month}${day}`),
    })
    .sort({ orderNumber: -1 });

  let sequence = "001";
  if (latestOrder && latestOrder.orderNumber) {
    const latestSequence = latestOrder.orderNumber.slice(-3);
    sequence = (parseInt(latestSequence) + 1).toString().padStart(3, "0");
  }
  return `KVK-${year}${month}${day}-${sequence}`;
}

/**
 * Create a new order (for customers)
 */
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentDetails, notes } = req.body;

    // Validate required fields
    if (!items || !items.length || !shippingAddress) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Group items by product, color, and material
    const groupedItems = items.reduce((acc, item) => {
      const key = `${item.product}-${item.color}-${item.material}`;
      if (!acc[key]) {
        acc[key] = {
          product: item.product,
          color: item.color,
          material: item.material,
          sizes: {},
          customDesign: item.customDesign,
          notes: item.notes || ""
        };
      }
      
      // Add size and quantity to the group
      if (!acc[key].sizes[item.size]) {
        acc[key].sizes[item.size] = 0;
      }
      acc[key].sizes[item.size] += item.quantity;
      
      return acc;
    }, {});

    // Convert grouped items to order items
    const orderItems = [];
    let subtotal = 0;

    for (const key in groupedItems) {
      const group = groupedItems[key];
      const product = await Product.findById(group.product);

      if (!product) {
        return res
          .status(400)
          .json({ message: `Product not found: ${group.product}` });
      }

      if (!product.availability) {
        return res
          .status(400)
          .json({ message: `Product is not available: ${product.name}` });
      }

      // Calculate total quantity for this group
      const totalQuantity = Object.values(group.sizes).reduce((sum, qty) => sum + qty, 0);

      // Find the matching SKU (using the first size as reference)
      const firstSize = Object.keys(group.sizes)[0];
      
      // Find the color and material objects
      let colorObj, materialObj;
      
      // Handle color object or ID
      if (typeof group.color === 'object' && group.color !== null) {
        colorObj = group.color;
      } else {
        colorObj = product.colors.find(c => 
          c._id.toString() === group.color || c.name === group.color
        );
        if (!colorObj) {
          return res.status(400).json({ message: `Invalid color for product: ${product.name}` });
        }
      }
      
      // Handle material object or ID
      if (typeof group.material === 'object' && group.material !== null) {
        materialObj = group.material;
      } else {
        materialObj = product.materials.find(m => 
          m._id.toString() === group.material || m.name === group.material
        );
        if (!materialObj) {
          return res.status(400).json({ message: `Invalid material for product: ${product.name}` });
        }
      }
      
      const sku = product.skus.find(
        (s) =>
          s.size === firstSize &&
          s.color === (colorObj.name || colorObj) &&
          s.material === (materialObj.name || materialObj)
      );

      if (!sku) {
        return res
          .status(400)
          .json({
            message: `Invalid combination for product: ${product.name}`,
          });
      }

      // Ambil harga dari produk utama (product.basePrice dan product.dozenPrice)
      const basePriceFromProduct = Number(product.basePrice);
      const dozenPriceFromProduct = Number(product.dozenPrice); // Ini adalah total harga untuk 1 lusin

      if (isNaN(basePriceFromProduct)) {
        // Jika product.basePrice tidak ada atau bukan angka, ini adalah masalah data produk utama
        console.error(`FATAL (Customer Order): Product ${product.name} (ID: ${product._id}) is MISSING a valid 'basePrice'. Please add 'basePrice' to this product in the database.`);
        // Untuk pelanggan, kita mungkin tidak ingin langsung mengembalikan 500, tapi ini critical.
        // Bisa jadi fallback ke harga 0 atau error yang lebih informatif ke pelanggan.
        // Untuk sekarang, kita akan mengembalikan error agar masalah data terlihat.
        return res.status(400).json({ message: `Product ${product.name} is currently unavailable for order due to missing price information.`});
      }
      
      if (product.dozenPrice !== undefined && (isNaN(dozenPriceFromProduct) || dozenPriceFromProduct < 0)) {
         console.warn(`WARNING (Customer Order): Product ${product.name} (ID: ${product._id}) has an INVALID 'dozenPrice'. Using basePrice only for now.`);
      }

      let calculatedUnitPrice;
      // Cek jika ada harga lusinan yang valid dan kuantitas memungkinkan untuk harga lusinan
      if (totalQuantity >= 12 && !isNaN(dozenPriceFromProduct) && dozenPriceFromProduct > 0) {
        calculatedUnitPrice = dozenPriceFromProduct / 12; // Harga satuan jika beli lusinan
      } else {
        calculatedUnitPrice = basePriceFromProduct; // Harga satuan normal dari produk
      }
      
      const unitPrice = calculatedUnitPrice; // unitPrice final yang akan digunakan

      // Calculate item total
      const itemTotal = unitPrice * totalQuantity;
      subtotal += itemTotal;

      // Add custom design fee if applicable
      let designFee = 0;
      if (group.customDesign && group.customDesign.isCustom) {
        designFee = product.customizationFee;
        subtotal += designFee;
      }

      // Create sizeBreakdown array
      const sizeBreakdown = Object.entries(group.sizes).map(([size, quantity]) => {
        const sizeObj = product.sizes.find(s => s.size === size) || {};
        return {
          size,
          quantity,
          additionalPrice: sizeObj.additionalPrice || 0
        };
      });

      // Extract product images (limited to first 2 for efficiency)
      const productImages = product.images && product.images.length > 0 
        ? product.images.slice(0, 2).map(img => ({
            url: img.url,
            public_id: img.public_id
          }))
        : [];

      // Add to order items
      orderItems.push({
        product: product._id,
        sku: sku.sku,
        color: {
          name: colorObj.name,
          code: colorObj.code,
          available: colorObj.available !== undefined ? colorObj.available : true,
          _id: colorObj._id ? colorObj._id.toString() : undefined
        },
        material: {
          name: materialObj.name,
          additionalPrice: materialObj.additionalPrice || 0,
          available: materialObj.available !== undefined ? materialObj.available : true,
          _id: materialObj._id ? materialObj._id.toString() : undefined
        },
        quantity: totalQuantity,
        sizeBreakdown: sizeBreakdown,
        unitPrice,
        dozenPrice: (!isNaN(dozenPriceFromProduct) && dozenPriceFromProduct > 0) ? dozenPriceFromProduct : 0,
        customDesign: {
          isCustom: group.customDesign?.isCustom || false,
          designUrl: group.customDesign?.designUrl || "",
          designFee: designFee,
          notes: group.customDesign?.notes || ""
        },
        notes: group.notes || "",
        productDetails: {
          name: product.name,
          description: product.description,
          category: product.category,
          images: productImages
        },
        priceDetails: group.priceDetails && typeof group.priceDetails === 'object' ? group.priceDetails : {
          subtotal: itemTotal,
          total: itemTotal,
          discountAmount: 0,
          discountPercentage: 0,
        },
      });
    }

    // Create order object
    const order = new Order({
      customer: req.user._id,
      items: orderItems,
      status: "Pesanan Diterima",
      statusHistory: [
        {
          status: "Pesanan Diterima",
          changedBy: req.user._id,
          notes: "Order placed by customer",
        },
      ],
      shippingAddress,
      paymentDetails: {
        subtotal,
        discount: paymentDetails?.discount || 0,
        customFees: orderItems.reduce(
          (total, item) => total + (item.customDesign?.designFee || 0),
          0
        ),
        total: subtotal - (paymentDetails?.discount || 0),
        downPayment: {
          required: paymentDetails?.downPayment?.required || true,
          percentage: paymentDetails?.downPayment?.percentage || 30,
          amount: Math.round((subtotal - (paymentDetails?.discount || 0)) * (paymentDetails?.downPayment?.percentage || 30) / 100),
        },
        remainingPayment: {
          amount: Math.round((subtotal - (paymentDetails?.discount || 0)) * (100 - (paymentDetails?.downPayment?.percentage || 30)) / 100),
        },
      },
      isOfflineOrder: false,
      createdBy: req.user._id,
      notes: notes || "",
    });

    // Calculate estimated completion date based on production time
    const maxProductionTime = await Product.findOne({
      _id: { $in: items.map((i) => i.product) },
    })
      .sort({ productionTime: -1 })
      .select("productionTime")
      .then((p) => p.productionTime);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (maxProductionTime || 7));
    order.estimatedCompletionDate = completionDate;

    // Save order
    await order.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "create",
      module: "order",
      description: `Created new order: ${order.orderNumber}`,
      details: { orderId: order._id },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    // Send WhatsApp notification
    try {
      await whatsappNotifier.sendOrderConfirmation(order, req.user);
    } catch (notifyError) {
      console.error("WhatsApp notification error:", notifyError);
      // Continue even if notification fails
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res
      .status(500)
      .json({ message: "Failed to create order", error: error.message });
  }
};

/**
 * Create manual order (for cashier)
 */
const createManualOrder = async (req, res) => {
  try {
    const { customer, items, shippingAddress, paymentDetails, notes } =
      req.body;

    // Validate required fields
    if (!customer || !items || !items.length || !shippingAddress) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find or create customer
    let customerUser;

    if (typeof customer === "string" && customer.match(/^[0-9a-fA-F]{24}$/)) {
      // If customer is an ID, find the user
      customerUser = await User.findById(customer);
      if (!customerUser) {
        return res.status(400).json({ message: "Customer not found" });
      }
    } else {
      // Create a new customer
      const { name, email, phone, address } = customer;

      if (!name || !phone) {
        return res
          .status(400)
          .json({ message: "Customer name and phone are required" });
      }

      // Check if customer with same email or phone exists
      if (email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          customerUser = existingUser;
        }
      }

      if (!customerUser && phone) {
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
          customerUser = existingUser;
        }
      }

      // If no existing user, create new one
      if (!customerUser) {
        customerUser = new User({
          name,
          email: email || `${phone}@offline.customer`,
          password: Math.random().toString(36).slice(-10), // Random password
          phone,
          role: "customer",
          address,
          createdBy: req.user._id,
        });

        await customerUser.save();
      }
    }

    // Validate and calculate prices for each item
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res
          .status(400)
          .json({ message: `Product not found: ${item.product}` });
      }

      // Find the color and material objects
      let colorObj, materialObj;
      
      // Handle color object or ID
      if (typeof item.color === 'object' && item.color !== null) {
        colorObj = item.color;
      } else {
        colorObj = product.colors.find(c => 
          c._id.toString() === item.color || c.name === item.color
        );
        if (!colorObj) {
          return res.status(400).json({ message: `Invalid color for product: ${product.name}` });
        }
      }
      
      // Handle material object or ID
      if (typeof item.material === 'object' && item.material !== null) {
        materialObj = item.material;
      } else {
        materialObj = product.materials.find(m => 
          m._id.toString() === item.material || m.name === item.material
        );
        if (!materialObj) {
          return res.status(400).json({ message: `Invalid material for product: ${product.name}` });
        }
      }

      // Mengambil ukuran dari item.sizeBreakdown jika ada, jika tidak, coba item.size (fallback)
      const itemSize = item.sizeBreakdown && item.sizeBreakdown.length > 0 
        ? item.sizeBreakdown[0].size 
        : item.size; 

      if (!itemSize) {
        return res.status(400).json({ message: `Missing size information for product: ${product.name}` });
      }

      // Find the matching SKU
      const sku = product.skus.find(
        (s) =>
          s.size === itemSize && // Menggunakan itemSize yang sudah ditentukan
          s.color === (colorObj.name || colorObj) &&
          s.material === (materialObj.name || materialObj)
      );

      if (!sku) {
        return res
          .status(400)
          .json({
            message: `Invalid combination for product: ${product.name}`,
          });
      }

      // Pastikan quantity adalah angka
      const quantity = Number(item.quantity);
      if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: `Invalid quantity for product: ${product.name}` });
      }

      // Ambil harga dari produk utama (product.basePrice dan product.dozenPrice)
      const basePriceFromProduct = Number(product.basePrice);
      const dozenPriceFromProduct = Number(product.dozenPrice); // Ini adalah total harga untuk 1 lusin

      if (isNaN(basePriceFromProduct)) {
        // Jika product.basePrice tidak ada atau bukan angka, ini adalah masalah data produk utama
        console.error(`FATAL: Product ${product.name} (ID: ${product._id}) is MISSING a valid 'basePrice'. Please add 'basePrice' to this product in the database.`);
        return res.status(500).json({ message: `Internal error: Product ${product.name} is missing base price information.`});
      }
      
      // dozenPriceFromProduct bisa jadi 0 atau NaN jika tidak ada harga lusinan, ini akan ditangani di bawah
      if (product.dozenPrice !== undefined && (isNaN(dozenPriceFromProduct) || dozenPriceFromProduct < 0)) {
         console.warn(`WARNING: Product ${product.name} (ID: ${product._id}) has an INVALID 'dozenPrice'. Please check this product in the database. Using basePrice only for now.`);
      }

      let calculatedUnitPrice;
      // Cek jika ada harga lusinan yang valid dan kuantitas memungkinkan untuk harga lusinan
      if (quantity >= 12 && !isNaN(dozenPriceFromProduct) && dozenPriceFromProduct > 0) {
        calculatedUnitPrice = dozenPriceFromProduct / 12; // Harga satuan jika beli lusinan
      } else {
        calculatedUnitPrice = basePriceFromProduct; // Harga satuan normal dari produk
      }
      
      // Seharusnya calculatedUnitPrice sudah pasti angka sekarang jika basePriceFromProduct valid.
      // Tidak perlu fallback ke 0 kecuali basePriceFromProduct sendiri tidak valid (sudah ditangani di atas).
      
      const unitPrice = calculatedUnitPrice; // unitPrice final yang akan digunakan

      // Calculate item total - INI AKAN DIGANTI
      // const itemTotal = unitPrice * quantity;
      // if (isNaN(itemTotal)) {
      //     // Kondisi ini seharusnya tidak terjadi jika unitPrice sudah divalidasi
      //     console.error(`itemTotal became NaN for product ${product.name}. unitPrice: ${unitPrice}, quantity: ${quantity}`);
      //     return res.status(500).json({ message: `Internal error calculating total for item: ${product.name}`});
      // }
      // subtotal += itemTotal; // Akumulasi subtotal dipindahkan setelah loop

      // Add custom design fee if applicable - INI MUNGKIN JUGA TIDAK PERLU JIKA SUDAH DI PRICE DETAILS
      let designFee = 0;
      if (item.customDesign && item.customDesign.isCustom) {
        designFee = product.customizationFee; // Ini adalah default fee dari produk
        // Jika frontend mengirim item.priceDetails.customDesignFee, itu mungkin lebih akurat
        // Atau, jika item.priceDetails.total sudah termasuk design fee, maka baris ini & penambahan ke subtotal tidak perlu
      }

      // Get size details with additional price
      const sizeObj = product.sizes.find(s => s.size === itemSize) || {};
      
      // Extract product images (limited to first 2 for efficiency)
      const productImages = product.images && product.images.length > 0 
        ? product.images.slice(0, 2).map(img => ({
            url: img.url,
            public_id: img.public_id
          }))
        : [];

      // Add to order items
      orderItems.push({
        product: product._id,
        sku: sku.sku,
        color: {
          name: colorObj.name,
          code: colorObj.code,
          available: colorObj.available !== undefined ? colorObj.available : true,
          _id: colorObj._id ? colorObj._id.toString() : undefined
        },
        material: {
          name: materialObj.name,
          additionalPrice: materialObj.additionalPrice || 0,
          available: materialObj.available !== undefined ? materialObj.available : true,
          _id: materialObj._id ? materialObj._id.toString() : undefined
        },
        quantity: quantity,
        sizeBreakdown: item.sizeBreakdown || [{ size: itemSize, quantity: quantity, additionalPrice: (sizeObj.additionalPrice || 0) }],
        unitPrice: unitPrice, // Tetap simpan unitPrice dasar untuk referensi jika perlu
        dozenPrice: (!isNaN(dozenPriceFromProduct) && dozenPriceFromProduct > 0) ? dozenPriceFromProduct : 0, // Menyimpan dozenPrice produk (total 1 lusin)
        priceDetails: item.priceDetails, // Gunakan priceDetails dari frontend SEPENUHNYA tanpa validasi atau perhitungan ulang
        customDesign: {
          isCustom: item.customDesign?.isCustom || false,
          designUrl: item.customDesign?.designUrl || "",
          designFee: item.priceDetails?.customDesignFee || (item.customDesign?.isCustom ? product.customizationFee : 0), // Ambil dari priceDetails jika ada
          notes: item.customDesign?.notes || ""
        },
        notes: item.notes || "",
        productDetails: {
          name: product.name,
          description: product.description,
          category: product.category,
          images: productImages
        }
      });
    }

    // Hitung subtotal dari total semua item.priceDetails.total
    subtotal = orderItems.reduce((acc, currItem) => acc + (currItem.priceDetails?.total || 0), 0);

    const newOrderNumber = await generateOrderNumber(); // Generate order number

    // paymentDetails.discount adalah untuk diskon level pesanan, bukan diskon produk
    const orderLevelDiscount = paymentDetails?.discount || 0; 
    const finalTotal = subtotal - orderLevelDiscount;

    // Create order object
    const order = new Order({
      orderNumber: newOrderNumber, // Gunakan order number yang di-generate
      customer: customerUser._id,
      items: orderItems,
      status: "Diproses", // Langsung Diproses, bukan Pesanan Diterima
      verificationStatus: "Diverifikasi", // Otomatis terverifikasi untuk pesanan manual
      statusHistory: [
        {
          status: "Diproses", // Sesuaikan dengan status Diproses
          changedBy: req.user._id,
          notes: "Manual order created by cashier and set to processing",
        },
      ],
      shippingAddress,
      paymentDetails: {
        subtotal, // Subtotal dari total semua item.priceDetails.total
        discount: orderLevelDiscount, // Diskon level pesanan (jika ada, dari req.body)
        // customFees di sini bisa jadi adalah biaya kustom tambahan di level order,
        // atau agregasi dari item.priceDetails.customDesignFee jika belum termasuk di subtotal.
        // Untuk sekarang, asumsikan subtotal sudah mencakup semua biaya item.
        // Jika ada customFees spesifik dari frontend untuk keseluruhan order, bisa dipakai:
        customFees: paymentDetails?.customFees || 0, // Default ke 0 jika tidak ada
        total: finalTotal, // Total setelah diskon level pesanan (jika ada)
        downPayment: {
          required: paymentDetails?.downPayment?.required !== undefined ? paymentDetails.downPayment.required : true,
          percentage: paymentDetails?.downPayment?.percentage || 30,
          // Hitung DP dari finalTotal
          amount: Math.round(finalTotal * (paymentDetails?.downPayment?.percentage || 30) / 100),
        },
        // Hitung sisa pembayaran dari finalTotal dan DP amount
        remainingPayment: {
            status: 'pending',
            amount: finalTotal - Math.round(finalTotal * (paymentDetails?.downPayment?.percentage || 30) / 100),
        },
        //Tambahkan informasi pembayaran tunai jika ada dari frontend
        method: paymentDetails?.method,
        status: paymentDetails?.status,
        cashReceived: paymentDetails?.cashReceived,
        changeAmount: paymentDetails?.changeAmount,
        receiptNumber: paymentDetails?.receiptNumber,
        isPaid: finalTotal === 0 ? true : (paymentDetails?.isPaid || false), // Jika total 0 anggap lunas
      },
      isOfflineOrder: true,
      createdBy: req.user._id,
      notes: notes || "",
    });

    // Pastikan paymentDetails.downPayment.status dan remainingPayment.status di set dengan benar jika lunas atau DP
    if (order.paymentDetails.status === 'Lunas' || order.paymentDetails.isPaid === true) {
        order.paymentDetails.isPaid = true;
        if (order.paymentDetails.downPayment) {
            order.paymentDetails.downPayment.status = 'paid';
            order.paymentDetails.downPayment.paidAt = new Date();
            if (paymentDetails?.method) {
                order.paymentDetails.downPayment.paymentMethod = paymentDetails.method;
            }
        }
        if (order.paymentDetails.remainingPayment) {
            order.paymentDetails.remainingPayment.status = 'paid';
            order.paymentDetails.remainingPayment.paidAt = new Date();
            if (paymentDetails?.method) {
                order.paymentDetails.remainingPayment.paymentMethod = paymentDetails.method;
            }
        }
    } else if (order.paymentDetails.status === 'DP' && order.paymentDetails.downPayment) {
        // DP amount sudah dihitung di atas
        // remainingPayment amount juga sudah dihitung
        order.paymentDetails.downPayment.status = 'paid';
        order.paymentDetails.downPayment.paidAt = new Date();
        if (paymentDetails?.method) {
            order.paymentDetails.downPayment.paymentMethod = paymentDetails.method;
        }
    }

    // Calculate estimated completion date based on production time
    const maxProductionTime = await Product.findOne({
      _id: { $in: items.map((i) => i.product) },
    })
      .sort({ productionTime: -1 })
      .select("productionTime")
      .then((p) => p.productionTime);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + (maxProductionTime || 7));
    order.estimatedCompletionDate = completionDate;

    // Save order
    await order.save();

    // If payment is made immediately (cash payment)
    if (paymentDetails.paymentNow) {
      const paymentType = paymentDetails.payFull
        ? "fullPayment"
        : "downPayment";
      const amount =
        paymentType === "fullPayment"
          ? order.paymentDetails.total
          : order.paymentDetails.downPayment.amount;

      // Create payment record
      const payment = new Payment({
        order: order._id,
        paymentType,
        amount,
        method: paymentDetails.paymentMethod || "cash",
        status: "paid",
        manualPayment: {
          receivedBy: req.user._id,
          receiptNumber: paymentDetails.receiptNumber || `MANUAL-${Date.now()}`,
          notes: paymentDetails.paymentNotes || "",
        },
        verifiedBy: req.user._id,
        verifiedAt: new Date(),
        createdBy: req.user._id,
      });

      await payment.save();

      // Update order payment status
      if (paymentType === "fullPayment") {
        order.paymentDetails.isPaid = true;
        order.paymentDetails.downPayment.status = "paid";
        order.paymentDetails.downPayment.paidAt = new Date();
        order.paymentDetails.downPayment.paymentMethod =
          paymentDetails.paymentMethod || "cash";
        order.paymentDetails.remainingPayment.status = "paid";
        order.paymentDetails.remainingPayment.paidAt = new Date();
        order.paymentDetails.remainingPayment.paymentMethod =
          paymentDetails.paymentMethod || "cash";

        // Clear customer's cart after successful full payment
        await Cart.findOneAndUpdate(
          { user: order.customer },
          { $set: { items: [] } }
        );
      } else {
        order.paymentDetails.downPayment.status = "paid";
        order.paymentDetails.downPayment.paidAt = new Date();
        order.paymentDetails.downPayment.paymentMethod =
          paymentDetails.paymentMethod || "cash";
      }

      await order.save();
    }

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "create",
      module: "order",
      description: `Created manual order: ${order.orderNumber}`,
      details: { orderId: order._id },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    // Send WhatsApp notification
    try {
      await whatsappNotifier.sendOrderConfirmation(order, customerUser);
    } catch (notifyError) {
      console.error("WhatsApp notification error:", notifyError);
      // Continue even if notification fails
    }

    res.status(201).json({
      message: "Manual order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create manual order error:", error);
    res
      .status(500)
      .json({ message: "Failed to create manual order", error: error.message });
  }
};

/**
 * Get all orders with filtering options
 */
const getAllOrders = async (req, res) => {
  try {
    // Debug authentication
    console.log('====== ORDER API DEBUG ======');
    console.log('User ID:', req.user?._id);
    console.log('User Role:', req.user?.role);
    console.log('Auth Token:', req.token ? 'Present' : 'Missing');
    console.log('Custom Debug Headers:', {
      user: req.headers['x-debug-user'],
      role: req.headers['x-debug-role']
    });
    console.log('===========================');

    // Build filters
    const filters = {};

    // Search by order number or customer name
    if (req.query.search) {
      filters.$or = [
        { orderNumber: { $regex: req.query.search, $options: 'i' } },
        { 'customer.name': { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by status if provided
    if (req.query.status && req.query.status !== 'all') {
      filters.status = req.query.status;
    }

    // Filter by payment status
    if (req.query.paymentStatus && req.query.paymentStatus !== 'all') {
      switch (req.query.paymentStatus) {
        case 'Lunas':
          filters['paymentDetails.isPaid'] = true;
          break;
        case 'DP':
          filters['paymentDetails.downPayment.status'] = 'paid';
          filters['paymentDetails.isPaid'] = false;
          break;
        case 'Belum Bayar':
          filters['paymentDetails.downPayment.status'] = 'pending';
          filters['paymentDetails.isPaid'] = false;
          break;
      }
    }

    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filters.createdAt = {};
      if (req.query.startDate) {
        filters.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        const endDate = new Date(req.query.endDate);
        endDate.setDate(endDate.getDate() + 1); // Include the end date
        filters.createdAt.$lt = endDate;
      }
    }

    // Filter by order type (online/offline)
    if (req.query.orderType && req.query.orderType !== 'all') {
      if (req.query.orderType === 'online') {
        filters.isOfflineOrder = { $ne: true }; // Online orders (not offline)
      } else if (req.query.orderType === 'offline') {
        filters.isOfflineOrder = true; // Offline orders
      }
    }

    // For role-based filtering
    if (req.user.role === "customer") {
      // Customers can only see their own orders
      filters.customer = req.user._id;
      console.log('Customer filter applied:', filters.customer);
    } else if (req.user.role === "staff") {
      // Staff can see all orders but with specific status filters if provided
      if (req.query.status && req.query.status !== 'all') {
        filters.status = req.query.status;
      }
    }

    // Log final filters
    console.log('Final query filters:', JSON.stringify(filters, null, 2));

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting
    let sort = {};
    if (req.query.sortBy) {
      if (req.query.sortBy === 'total') {
        sort['paymentDetails.total'] = req.query.sortOrder === 'asc' ? 1 : -1;
      } else {
        sort[req.query.sortBy] = req.query.sortOrder === 'asc' ? 1 : -1;
      }
    } else {
      sort = { createdAt: -1 }; // Default sort by newest
    }

    // Execute query with population
    const ordersFromDB = await Order.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("customer", "name email phone")
      .populate("items.product", "name images basePrice dozenPrice price")
      .populate("createdBy", "name");

    // Get total count
    const totalOrders = await Order.countDocuments(filters);

    // Add totalAmount to each order object
    const orders = ordersFromDB.map(order => {
      const orderObject = order.toObject(); // Convert Mongoose document to plain object
      return {
        ...orderObject,
        totalAmount: orderObject.paymentDetails?.total 
      };
    });

    res.json({
      message: "Orders retrieved successfully",
      orders: orders,
      pagination: {
        total: totalOrders,
        page,
        limit,
        pages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve orders", error: error.message });
  }
};

/**
 * Get order by ID
 */
const getOrderById = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id)
      .populate("customer", "name email phone address")
      .populate("items.product", "name images price dozenPrice discount basePrice") // Include discount field
      .populate("statusHistory.changedBy", "name role")
      .populate("createdBy", "name");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check permissions
    if (
      req.user.role === "customer" &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to view this order" });
    }

    // Get associated payments
    const payments = await Payment.find({ order: order._id })
      .populate("verifiedBy", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
      
    // The entire block for recalculating prices is removed from here.
    // getOrderById should return the order data as it is in the database,
    // relying on the Order.js pre-save hook for correct price calculations.

    res.json({
      message: "Order retrieved successfully",
      order,
      payments,
    });
  } catch (error) {
    console.error("Get order error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve order", error: error.message });
  }
};

/**
 * Update order status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { status, notes, paymentInfo } = req.body;
    const orderId = req.params.id;

    // Find order
    const order = await Order.findById(orderId).populate(
      "customer",
      "name phone"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Case: Only adding notes without changing status
    const isAddingNotesOnly = status === order.status && notes && !paymentInfo;
    
    if (!isAddingNotesOnly) {
      // Validate status
      const validStatuses = [
        "Pesanan Diterima",
        "Diproses",
        "Selesai Produksi",
        "Siap Kirim",
        "Selesai",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Validate status transition based on role
      let validTransition = false;

      if (req.user.role === "admin") {
        // Admin can change to any status
        validTransition = true;
      } else if (req.user.role === "cashier") {
        // Cashier can only set status to "Pesanan Diterima" or "Siap Kirim"
        validTransition = ["Pesanan Diterima", "Siap Kirim"].includes(status);
      } else if (req.user.role === "staff") {
        // Staff can set status to "Diproses", "Selesai Produksi", "Siap Kirim", or "Selesai"
        validTransition = ["Diproses", "Selesai Produksi", "Siap Kirim", "Selesai"].includes(status);
      } else {
        // Other roles can't change status
        return res
          .status(403)
          .json({ message: "You do not have permission to update order status" });
      }

      if (!validTransition) {
        return res
          .status(403)
          .json({ message: "You do not have permission to set this status" });
      }

      // Check if status is being set to "Siap Kirim" and validate payment is complete
      if (status === "Siap Kirim" && !order.paymentDetails.isPaid) {
        return res
          .status(400)
          .json({ 
            message: "Pesanan harus lunas sebelum status dapat diubah menjadi Siap Kirim",
            paymentRequired: true 
          });
      }
    }

    // Process payment info if provided (for manual payments by Cashier)
    if (paymentInfo && (req.user.role === "admin" || req.user.role === "cashier")) {
      const { type, method, amount, manualPayment } = paymentInfo;
      
      if (manualPayment && type && method && amount) {
        console.log(`Processing manual payment: ${type}, ${method}, ${amount}`);
        
        // Create payment record
        const payment = new Payment({
          order: order._id,
          paymentType: type,
          amount,
          method: method || "cash",
          status: "paid",
          manualPayment: {
            receivedBy: req.user._id,
            receiptNumber: `MANUAL-${Date.now()}`,
            notes: notes || "",
          },
          verifiedBy: req.user._id,
          verifiedAt: new Date(),
          createdBy: req.user._id,
        });

        await payment.save();
        console.log("Manual payment record created:", payment._id);

        // Update order payment status based on payment type
        if (type === "fullPayment") {
          // Full payment - mark everything as paid
          order.paymentDetails.isPaid = true;
          order.paymentDetails.downPayment.status = "paid";
          order.paymentDetails.downPayment.paidAt = new Date();
          order.paymentDetails.downPayment.paymentMethod = method;
          order.paymentDetails.remainingPayment.status = "paid";
          order.paymentDetails.remainingPayment.paidAt = new Date();
          order.paymentDetails.remainingPayment.paymentMethod = method;
        } else if (type === "downPayment") {
          // Down payment only
          order.paymentDetails.downPayment.status = "paid";
          order.paymentDetails.downPayment.paidAt = new Date();
          order.paymentDetails.downPayment.paymentMethod = method;
        } else if (type === "remainingPayment") {
          // Remaining payment - mark remaining and set isPaid to true
          order.paymentDetails.remainingPayment.status = "paid";
          order.paymentDetails.remainingPayment.paidAt = new Date();
          order.paymentDetails.remainingPayment.paymentMethod = method;
          order.paymentDetails.isPaid = true; // Order is fully paid after remaining payment
        }
        
        // Log payment activity
        await new ActivityLog({
          user: req.user._id,
          action: "create",
          module: "payment",
          description: `Manual payment processed for order: ${order.orderNumber}`,
          details: { 
            orderId: order._id, 
            paymentId: payment._id,
            paymentType: type,
            amount,
            method
          },
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"],
        }).save();
      }
    }

    // Update order status if needed
    if (!isAddingNotesOnly) {
      order.status = status;
    }
    
    // Always add a status history entry, even for just notes
    order.statusHistory.push({
      status: order.status, // Use current status
      changedBy: req.user._id,
      timestamp: new Date(),
      notes: notes || "",
    });

    await order.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "update",
      module: "order",
      description: isAddingNotesOnly 
        ? `Added note to order: ${order.orderNumber}`
        : `Updated order status: ${order.orderNumber} to ${status}`,
      details: { 
        orderId: order._id, 
        status: order.status,
        notes: notes || ""
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    // Send WhatsApp notification only for status changes, not just notes
    if (!isAddingNotesOnly) {
      try {
        await whatsappNotifier.sendOrderStatusUpdate(
          order,
          status,
          order.customer
        );
      } catch (notifyError) {
        console.error("WhatsApp notification error:", notifyError);
        // Continue even if notification fails
      }
    }

    res.json({
      message: isAddingNotesOnly
        ? "Order note added successfully"
        : "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res
      .status(500)
      .json({ message: "Failed to update order status", error: error.message });
  }
};

/**
 * Cancel order (only for pending orders)
 */
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body;

    // Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order can be cancelled
    if (order.status !== "Pesanan Diterima") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    }

    // Check permissions
    if (
      req.user.role === "customer" &&
      order.customer.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You do not have permission to cancel this order" });
    }

    // Check if there are any payments
    const payments = await Payment.countDocuments({
      order: order._id,
      status: "paid",
    });

    if (payments > 0 && req.user.role === "customer") {
      return res
        .status(400)
        .json({
          message:
            "Orders with payments cannot be cancelled by customer. Please contact admin.",
        });
    }

    // Cancel order
    order.status = "Cancelled";
    order.statusHistory.push({
      status: "Cancelled",
      changedBy: req.user._id,
      timestamp: new Date(),
      notes: reason || "Order cancelled by user",
    });

    await order.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "cancel",
      module: "order",
      description: `Cancelled order: ${order.orderNumber}`,
      details: { orderId: order._id, reason },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    res
      .status(500)
      .json({ message: "Failed to cancel order", error: error.message });
  }
};

/**
 * Set remaining payment due date
 */
const setPaymentDueDate = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { dueDate } = req.body;

    if (!dueDate) {
      return res.status(400).json({ message: "Due date is required" });
    }

    // Validate date format
    const dueDateObj = new Date(dueDate);
    if (isNaN(dueDateObj.getTime())) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    // Find order
    const order = await Order.findById(orderId).populate(
      "customer",
      "name phone"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if down payment is paid
    if (order.paymentDetails.downPayment.status !== "paid") {
      return res
        .status(400)
        .json({ message: "Down payment must be paid first" });
    }

    // Check if remaining payment is already paid
    if (order.paymentDetails.remainingPayment.status === "paid") {
      return res
        .status(400)
        .json({ message: "Remaining payment is already paid" });
    }

    // Set due date
    order.paymentDetails.remainingPayment.dueDate = dueDateObj;
    await order.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "update",
      module: "order",
      description: `Set payment due date: ${order.orderNumber}`,
      details: { orderId: order._id, dueDate },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    // Send WhatsApp notification
    try {
      await whatsappNotifier.sendPaymentDueDate(order, order.customer);
    } catch (notifyError) {
      console.error("WhatsApp notification error:", notifyError);
      // Continue even if notification fails
    }

    res.json({
      message: "Payment due date set successfully",
      order,
    });
  } catch (error) {
    console.error("Set payment due date error:", error);
    res
      .status(500)
      .json({
        message: "Failed to set payment due date",
        error: error.message,
      });
  }
};

/**
 * Handle midtrans notification callback
 */
const handleMidtransNotification = async (req, res) => {
  try {
    const notification = req.body;

    // Verify notification from Midtrans
    const isVerified = midtrans.verifyNotification(notification);
    if (!isVerified) {
      return res.status(403).json({ message: "Invalid notification" });
    }

    // Find payment by transaction ID
    const payment = await Payment.findOne({
      "midtrans.transactionId": notification.transaction_id,
    });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Find associated order
    const order = await Order.findById(payment.order).populate("customer");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update payment status
    payment.midtrans.transactionStatus = notification.transaction_status;
    payment.midtrans.fraudStatus = notification.fraud_status;

    // Map Midtrans status to our status
    if (
      notification.transaction_status === "settlement" ||
      notification.transaction_status === "capture"
    ) {
      payment.status = "paid";
      payment.verifiedAt = new Date();

      // Update order payment status
      if (payment.paymentType === "fullPayment") {
        order.paymentDetails.isPaid = true;
        order.paymentDetails.downPayment.status = "paid";
        order.paymentDetails.downPayment.paidAt = new Date();
        order.paymentDetails.remainingPayment.status = "paid";
        order.paymentDetails.remainingPayment.paidAt = new Date();

        // Clear customer's cart after successful full payment
        await Cart.findOneAndUpdate(
          { user: order.customer._id },
          { $set: { items: [] } }
        );
      } else if (payment.paymentType === "downPayment") {
        order.paymentDetails.downPayment.status = "paid";
        order.paymentDetails.downPayment.paidAt = new Date();
      } else if (payment.paymentType === "remainingPayment") {
        order.paymentDetails.remainingPayment.status = "paid";
        order.paymentDetails.remainingPayment.paidAt = new Date();
        order.paymentDetails.isPaid = true;

        // Clear customer's cart after successful remaining payment
        await Cart.findOneAndUpdate(
          { user: order.customer._id },
          { $set: { items: [] } }
        );
      }
    } else if (notification.transaction_status === "pending") {
      payment.status = "pending";
    } else if (
      notification.transaction_status === "deny" ||
      notification.transaction_status === "cancel" ||
      notification.transaction_status === "expire"
    ) {
      payment.status = "expired";

      // Update order payment status if needed
      if (
        payment.paymentType === "downPayment" &&
        order.paymentDetails.downPayment.status === "pending"
      ) {
        order.paymentDetails.downPayment.status = "expired";
      } else if (
        payment.paymentType === "remainingPayment" &&
        order.paymentDetails.remainingPayment.status === "pending"
      ) {
        order.paymentDetails.remainingPayment.status = "expired";
      }
    }

    await payment.save();
    await order.save();

    // ... rest of the code ...
  } catch (error) {
    console.error("Handle notification error:", error);
    res.status(500).json({ 
      message: "Failed to handle notification", 
      error: error.message 
    });
  }
};

module.exports = {
  createOrder,
  createManualOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  setPaymentDueDate,
  handleMidtransNotification,
};
