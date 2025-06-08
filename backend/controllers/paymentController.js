const Payment = require("../models/Payment");
const Order = require("../models/Order");
const User = require("../models/User");
const ActivityLog = require("../models/ActivityLog");
const whatsappNotifier = require("../utils/whatsappNotifier");
const midtrans = require("../config/midtrans");
const Product = require("../models/Product");

/**
 * Create Snap token for payment
 */
const createSnapToken = async (req, res) => {
  try {
    const { orderData, paymentType, amount } = req.body;

    // Validate input
    if (!orderData || !paymentType) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate customer
    if (!orderData.customer) {
      return res.status(400).json({ message: "Customer is required" });
    }

    // Validate items
    if (!orderData.items || orderData.items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    // Validate payment details
    if (!orderData.paymentDetails) {
      return res.status(400).json({ message: "Payment details are required" });
    }

    // Validate and format amount
    const paymentAmount = Math.round(amount); // Round to nearest integer
    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    console.log("Creating order with data:", JSON.stringify(orderData, null, 2));

    // Create order first
    const populatedItems = await Promise.all(orderData.items.map(async (item) => {
      // Try to find product by item.product (ObjectId) or item.productId (string)
      const product = await Product.findById(item.product || item.productId).lean(); // Use .lean() for plain JS object if not modifying product further
      
      let productImages = [];
      if (product && product.images && product.images.length > 0) {
        productImages = product.images.slice(0, 2).map(img => ({ // Take first 2 images
          url: img.url,
          public_id: img.public_id,
        }));
      }

      // Preserve productDetails from frontend if product not found, otherwise use DB product details
      let finalProductDetails = item.productDetails || {};
      if (product) {
        finalProductDetails = {
          name: product.name,
          description: product.description,
          category: product.category,
          // images will be overridden below
        };
      }
      
      return {
        ...item,
        // Ensure SKU is present
        sku: item.sku || `${item.product || item.productId}-${item.color?.name || 'std'}-${item.material?.name || 'std'}`.replace(/\s+/g, '-').substring(0, 50),
        // Ensure sizeBreakdown is an array
        sizeBreakdown: Array.isArray(item.sizeBreakdown) ? item.sizeBreakdown : 
          ((item.quantity && item.size) ? [{ size: item.size, quantity: item.quantity, additionalPrice: 0 }] : []),
        
        // Use priceDetails from frontend if valid, otherwise it will be calculated by Order model's pre-save hook
        priceDetails: (item.priceDetails && typeof item.priceDetails === 'object') ? item.priceDetails : null,
        
        // Ensure customDesign is structured correctly
        customDesign: item.customDesign ? {
          isCustom: item.customDesign.isCustom || false,
          designUrl: item.customDesign.designUrl || item.customDesign.url || '',
          customizationFee: typeof item.customDesign.customizationFee === 'number' 
                              ? item.customDesign.customizationFee 
                              : (typeof item.customDesign.designFee === 'number' ? item.customDesign.designFee : 0),
          notes: item.customDesign.notes || ''
        } : null, // Ensure it's null if not provided or not isCustom

        productDetails: { // Populate productDetails
          ...finalProductDetails, // Spread existing or default details
          images: productImages,  // Override with images from DB
        },
      };
    }));

    const order = new Order({
      ...orderData,
      items: populatedItems, // Use the new populatedItems array
      orderNumber: `TEMP-${Date.now()}`, // Will be replaced by backend
    });

    // Calculate estimated completion date based on production time
    const maxProductionTime = await Product.findOne({
      _id: { $in: orderData.items.map((i) => i.product) },
    })
      .sort({ productionTime: -1 })
      .select("productionTime")
      .then((p) => p?.productionTime || 7);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + maxProductionTime);
    order.estimatedCompletionDate = completionDate;

    // Save order
    await order.save();
    console.log("Order created successfully:", order._id);

    // Get customer data
    const customer = await User.findById(order.customer);
    if (!customer) {
      throw new Error("Customer not found");
    }

    console.log("Creating Snap payment with amount:", paymentAmount);

    // Create Midtrans Snap transaction
    const transactionDetails = {
      transaction_details: {
        order_id: `${order.orderNumber}-${paymentType}-${Date.now()}`,
        gross_amount: paymentAmount,
      },
      item_details: [
        {
          id: order._id.toString(),
          price: paymentAmount,
          quantity: 1,
          name: `${paymentType} for Order ${order.orderNumber}`,
        },
      ],
      customer_details: {
        first_name: customer.name || "Customer",
        email: customer.email || "customer@example.com",
        phone: customer.phone || "081234567890",
        billing_address: {
          first_name: customer.name || "Customer",
          phone: customer.phone || "081234567890",
          address: order.shippingAddress?.street || "Address not provided",
          city: order.shippingAddress?.city || "City not provided",
          postal_code: order.shippingAddress?.postalCode || "00000",
          country_code: "IDN",
        },
      },
      credit_card: {
        secure: true,
      },
      enabled_payments: [
        "credit_card",
        "bank_transfer",
        "gopay",
        "shopeepay",
        "permata_va",
        "bca_va",
        "bni_va",
        "bri_va",
        "other_va",
        "echannel",
      ],
    };

    console.log("Transaction details:", JSON.stringify(transactionDetails, null, 2));

    // Get Snap token from Midtrans
    const snapResponse = await midtrans.createSnapToken(transactionDetails);
    console.log("Snap response:", JSON.stringify(snapResponse, null, 2));

    // Create payment record
    const payment = new Payment({
      order: order._id,
      paymentType,
      amount,
      status: "pending",
      method: "midtrans",
      midtrans: {
        transactionId: transactionDetails.transaction_details.order_id,
        transactionTime: new Date(),
        transactionStatus: "pending",
        grossAmount: amount,
      },
      createdBy: req.user?._id || order.customer,
    });

    await payment.save();
    console.log("Payment record created:", payment._id);

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "create",
      module: "payment",
      description: `Created Snap payment request for order: ${order.orderNumber}`,
      details: {
        orderId: order._id,
        paymentId: payment._id,
        paymentType,
        amount,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.status(201).json({
      message: "Snap payment request created successfully",
      token: snapResponse.token,
      redirect_url: snapResponse.redirect_url,
      payment,
      order,
    });
  } catch (error) {
    console.error("Create Snap payment error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error response:", error.response?.data);
    console.error("Error config:", {
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      data: error.config?.data
    });
    res
      .status(500)
      .json({ 
        message: "Failed to create Snap payment", 
        error: error.message,
        details: error.response?.data || null,
        config: {
          url: error.config?.url,
          method: error.config?.method
        }
      });
  }
};

/**
 * Create Snap token for existing order
 */
const createPaymentForExistingOrder = async (req, res) => {
  try {
    const { orderId, paymentType, amount } = req.body;

    // Validate input
    if (!orderId || !paymentType || !amount) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the order
    const order = await Order.findById(orderId).populate("customer");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Pastikan semua item memiliki sku
    if (order.items && order.items.length > 0) {
      let needUpdate = false;
      order.items.forEach(item => {
        if (!item.sku) {
          item.sku = `${item.product}-${item.color}-${item.material}`.replace(/\s+/g, '-');
          needUpdate = true;
        }
      });
      
      if (needUpdate) {
        await order.save();
      }
    }

    // Check if user has permission (customer or admin/cashier)
    if (
      req.user.role === "customer" &&
      order.customer._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: "You do not have permission to make payment for this order"
      });
    }

    // Validate payment status
    if (order.paymentDetails.isPaid) {
      return res.status(400).json({ message: "Order is already paid" });
    }

    // Determine payment amount based on payment type
    let paymentAmount = 0;
    if (paymentType === "downPayment") {
      if (order.paymentDetails.downPayment.status === 'paid') {
        return res.status(400).json({ message: "Down payment is already paid" });
      }
      paymentAmount = order.paymentDetails.downPayment.amount;
    } else if (paymentType === "remainingPayment") {
      if (order.paymentDetails.remainingPayment.status === 'paid') {
        return res.status(400).json({ message: "Remaining payment is already paid" });
      }
      paymentAmount = order.paymentDetails.remainingPayment.amount;
    } else {
      // Full payment
      paymentAmount = order.paymentDetails.total;
    }

    // Use provided amount if specified and valid
    if (amount && amount > 0) {
      paymentAmount = Math.round(amount);
    }

    console.log("Creating payment for existing order:", {
      orderId,
      paymentType,
      paymentAmount
    });

    // Create Midtrans Snap transaction
    const transactionDetails = {
      transaction_details: {
        order_id: `${order.orderNumber}-${paymentType}-${Date.now()}`,
        gross_amount: paymentAmount,
      },
      item_details: [
        {
          id: order._id.toString(),
          price: paymentAmount,
          quantity: 1,
          name: `${paymentType} for Order ${order.orderNumber}`,
        },
      ],
      customer_details: {
        first_name: order.customer.name || "Customer",
        email: order.customer.email || "customer@example.com",
        phone: order.customer.phone || "081234567890",
        billing_address: {
          first_name: order.customer.name || "Customer",
          phone: order.customer.phone || "081234567890",
          address: order.shippingAddress?.street || "Address not provided",
          city: order.shippingAddress?.city || "City not provided",
          postal_code: order.shippingAddress?.postalCode || "00000",
          country_code: "IDN",
        },
      },
      credit_card: {
        secure: true,
      },
      enabled_payments: [
        "credit_card",
        "bank_transfer",
        "gopay",
        "shopeepay",
        "permata_va",
        "bca_va",
        "bni_va",
        "bri_va",
        "other_va",
        "echannel",
      ],
    };

    // Get Snap token from Midtrans
    const snapResponse = await midtrans.createSnapToken(transactionDetails);
    console.log("Snap response:", JSON.stringify(snapResponse, null, 2));

    // Create payment record
    const payment = new Payment({
      order: order._id,
      paymentType,
      amount: paymentAmount,
      status: "pending",
      method: "midtrans",
      midtrans: {
        transactionId: transactionDetails.transaction_details.order_id,
        transactionTime: new Date(),
        transactionStatus: "pending",
        grossAmount: paymentAmount,
      },
      createdBy: req.user?._id,
    });

    await payment.save();
    console.log("Payment record created:", payment._id);

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "create",
      module: "payment",
      description: `Created Snap payment request for existing order: ${order.orderNumber}`,
      details: {
        orderId: order._id,
        paymentId: payment._id,
        paymentType,
        amount: paymentAmount,
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.status(201).json({
      message: "Snap payment request created successfully",
      token: snapResponse.token,
      redirect_url: snapResponse.redirect_url,
      payment,
      order,
    });
  } catch (error) {
    console.error("Create payment for existing order error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error response:", error.response?.data);
    res
      .status(500)
      .json({ 
        message: "Failed to create payment request", 
        error: error.message,
        details: error.response?.data || null
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
      } else if (payment.paymentType === "downPayment") {
        order.paymentDetails.downPayment.status = "paid";
        order.paymentDetails.downPayment.paidAt = new Date();
      } else if (payment.paymentType === "remainingPayment") {
        order.paymentDetails.remainingPayment.status = "paid";
        order.paymentDetails.remainingPayment.paidAt = new Date();
        order.paymentDetails.isPaid = true;
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

    // Log activity
    await new ActivityLog({
      user: payment.createdBy,
      action: "update",
      module: "payment",
      description: `Payment ${notification.transaction_status} for order: ${order.orderNumber}`,
      details: {
        orderId: order._id,
        paymentId: payment._id,
        transactionStatus: notification.transaction_status,
      },
    }).save();

    // Send WhatsApp notification for successful payments
    if (payment.status === "paid") {
      try {
        await whatsappNotifier.sendPaymentVerification(
          payment,
          order,
          order.customer
        );
      } catch (notifyError) {
        console.error("WhatsApp notification error:", notifyError);
        // Continue even if notification fails
      }
    }

    res.status(200).json({ message: "Notification processed successfully" });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    res
      .status(500)
      .json({
        message: "Failed to process notification",
        error: error.message,
      });
  }
};

/**
 * Get all payments with filters
 */
const getAllPayments = async (req, res) => {
  try {
    // Build filters
    const filters = {};

    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      filters.status = req.query.status;
    }

    // Filter by payment type
    if (req.query.paymentType && req.query.paymentType !== 'all') {
      filters.paymentType = req.query.paymentType;
    } else if (req.query.status === 'pending') {
      // Don't show remaining payments in verification page until DP is paid
      filters.paymentType = { $ne: 'remainingPayment' };
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

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sort by creation date (newest first)
    const sort = { createdAt: -1 };

    // Get orders with any payment (either fully paid or with down payment)
    const allPayments = await Payment.find(filters)
      .sort(sort)
      .populate({
        path: "order",
        select: "orderNumber customer paymentDetails status",
        populate: {
          path: "customer",
          select: "name email phone",
        },
      })
      .populate("verifiedBy", "name")
      .populate("createdBy", "name");
      
    // Filter by search term if provided
    let filteredPayments = allPayments;
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredPayments = allPayments.filter(payment => {
        // Search in order number
        if (payment.order?.orderNumber?.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        // Search in customer name
        if (payment.order?.customer?.name?.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        // Search in customer email or phone if available
        if (payment.order?.customer?.email?.toLowerCase().includes(searchTerm)) {
          return true;
        }
        
        if (payment.order?.customer?.phone?.includes(searchTerm)) {
          return true;
        }
        
        return false;
      });
    }
    
    // Filter by order status if provided
    if (req.query.orderStatus && req.query.orderStatus !== 'all') {
      filteredPayments = filteredPayments.filter(payment => {
        return payment.order?.status === req.query.orderStatus;
      });
    }
    
    // Filter out payments for orders where neither full payment nor down payment is made
    const validPayments = filteredPayments.filter(payment => {
      // Check if the order exists
      if (!payment.order) return false;
      
      // Include if the order is fully paid
      if (payment.order.paymentDetails?.isPaid) return true;
      
      // Include if the down payment is paid
      if (payment.order.paymentDetails?.downPayment?.status === 'paid') return true;
      
      // Include if this is a manual/cash payment that needs verification
      if (payment.paymentMethod === 'cash' || 
          payment.paymentMethod === 'bank_transfer' || 
          payment.method === 'manual') return true;
      
      // Exclude other payments (no payment made yet)
      return false;
    });
    
    // Group payments by order ID to prevent duplicates
    const orderPaymentMap = new Map();
    
    // Process each payment
    validPayments.forEach(payment => {
      if (!payment.order) return;
      
      const orderId = payment.order._id.toString();
      
      // If this order isn't in our map yet or this payment is newer, update the map
      if (!orderPaymentMap.has(orderId) || 
          new Date(payment.createdAt) > new Date(orderPaymentMap.get(orderId).createdAt)) {
        orderPaymentMap.set(orderId, payment);
      }
    });
    
    // Convert map values back to an array
    const uniquePayments = Array.from(orderPaymentMap.values());
    
    // Sort by creation date (newest first)
    uniquePayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply pagination to the unique payments
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedPayments = uniquePayments.slice(startIndex, endIndex);
    
    // Get total count of filtered payments
    const total = uniquePayments.length;

    res.json({
      message: "Payments retrieved successfully",
      payments: paginatedPayments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve payments", error: error.message });
  }
};

/**
 * Get payment by ID
 */
const getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: "order",
        populate: {
          path: "customer",
          select: "name email phone",
        },
      })
      .populate("verifiedBy", "name")
      .populate("createdBy", "name");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.json({
      message: "Payment retrieved successfully",
      payment,
    });
  } catch (error) {
    console.error("Get payment error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve payment", error: error.message });
  }
};

/**
 * Confirm payment status
 */
const confirmPayment = async (req, res) => {
  try {
    const { orderId, transactionId, paymentType, amount, status, paymentMethod, transactionTime, status_code, status_message } = req.body;

    console.log('Payment confirmation data:', req.body);

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      console.error('Order not found:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Current order payment status:', {
      isPaid: order.paymentDetails.isPaid,
      downPaymentStatus: order.paymentDetails.downPayment?.status,
      remainingPaymentStatus: order.paymentDetails.remainingPayment?.status
    });

    // Find existing payment to avoid duplicates
    const existingPayment = await Payment.findOne({
      'midtrans.transactionId': transactionId
    });

    if (existingPayment) {
      console.log('Payment already exists, updating status');
      existingPayment.status = status === 'success' ? 'paid' : 'pending';
      existingPayment.midtrans.transactionStatus = status;
      await existingPayment.save();
      
      // Update order status
      await updateOrderPaymentStatus(order, existingPayment);
      console.log('Order payment status updated for existing payment:', {
        isPaid: order.paymentDetails.isPaid,
        downPaymentStatus: order.paymentDetails.downPayment?.status,
        remainingPaymentStatus: order.paymentDetails.remainingPayment?.status
      });
      return res.json({ message: 'Payment status updated successfully' });
    }

    // Create new payment record
    const payment = new Payment({
      order: orderId,
      paymentType,
      amount: Number(amount),
      status: status === 'success' ? 'paid' : 'pending',
      method: 'midtrans',
      midtrans: {
        transactionId,
        transactionTime: new Date(transactionTime),
        transactionStatus: status,
        grossAmount: Number(amount),
        paymentType: paymentMethod,
        statusCode: status_code,
        statusMessage: status_message
      }
    });

    console.log('Creating new payment record:', payment);

    await payment.save();

    // Update order payment status
    await updateOrderPaymentStatus(order, payment);
    
    console.log('Order payment status after update:', {
      isPaid: order.paymentDetails.isPaid,
      downPaymentStatus: order.paymentDetails.downPayment?.status,
      remainingPaymentStatus: order.paymentDetails.remainingPayment?.status
    });

    // Log payment activity
    try {
      await new ActivityLog({
        module: 'payment',
        action: 'create',
        description: `Payment ${status} for order ${order.orderNumber}`,
        details: {
          orderId: order._id,
          paymentId: payment._id,
          transactionStatus: status,
          paymentType
        }
      }).save();
    } catch (logError) {
      console.error('Error logging payment activity:', logError);
      // Continue even if logging fails
    }

    res.json({
      message: 'Payment processed successfully',
      paymentStatus: payment.status,
      orderStatus: {
        isPaid: order.paymentDetails.isPaid,
        downPaymentStatus: order.paymentDetails.downPayment?.status,
        remainingPaymentStatus: order.paymentDetails.remainingPayment?.status
      }
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    res.status(500).json({ message: 'Failed to confirm payment', error: error.message });
  }
};

// Helper function to update order payment status
async function updateOrderPaymentStatus(order, payment) {
  try {
    console.log('Updating order payment status:', {
      paymentType: payment.paymentType,
      paymentStatus: payment.status,
      amount: payment.amount
    });
    
    if (payment.status === 'paid') {
      if (payment.paymentType === 'fullPayment') {
        order.paymentDetails.isPaid = true;
        order.paymentDetails.downPayment.status = 'paid';
        order.paymentDetails.downPayment.paidAt = new Date();
        order.paymentDetails.downPayment.paymentMethod = 'midtrans';
        order.paymentDetails.remainingPayment.status = 'paid';
        order.paymentDetails.remainingPayment.paidAt = new Date();
        order.paymentDetails.remainingPayment.paymentMethod = 'midtrans';
      } else if (payment.paymentType === 'downPayment') {
        order.paymentDetails.downPayment.status = 'paid';
        order.paymentDetails.downPayment.paidAt = new Date();
        order.paymentDetails.downPayment.paymentMethod = 'midtrans';
      } else if (payment.paymentType === 'remainingPayment') {
        order.paymentDetails.remainingPayment.status = 'paid';
        order.paymentDetails.remainingPayment.paidAt = new Date();
        order.paymentDetails.remainingPayment.paymentMethod = 'midtrans';
        
        // PENTING: Pastikan pesanan ditandai sebagai lunas saat sisa pembayaran telah dibayar
        order.paymentDetails.isPaid = true;
        
        console.log('Remaining payment completed, marking order as fully paid');
      }
    } else if (payment.status === 'pending') {
      if (payment.paymentType === 'fullPayment') {
        order.paymentDetails.downPayment.status = 'pending';
        order.paymentDetails.remainingPayment.status = 'pending';
      } else if (payment.paymentType === 'downPayment') {
        order.paymentDetails.downPayment.status = 'pending';
      } else if (payment.paymentType === 'remainingPayment') {
        order.paymentDetails.remainingPayment.status = 'pending';
      }
    }

    await order.save();
    console.log('Order payment status saved successfully');

    return order;
  } catch (error) {
    console.error('Error updating order payment status:', error);
    throw error;
  }
}

/**
 * Verify payment (Admin/Cashier)
 */
const verifyPayment = async (req, res) => {
  try {
    const { status, note } = req.body;
    const paymentId = req.params.paymentId;

    // Find payment
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Find associated order
    const order = await Order.findById(payment.order)
      .populate("customer", "name email phone")
      .populate("items.product", "name images");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update payment status
    payment.status = status === 'verified' ? 'paid' : 'failed';
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();

    // Update order payment status and verification status
    if (status === 'verified') {
      if (payment.paymentType === "fullPayment") {
        order.paymentDetails.isPaid = true;
        order.paymentDetails.downPayment.status = "paid";
        order.paymentDetails.downPayment.paidAt = new Date();
        order.paymentDetails.remainingPayment.status = "paid";
        order.paymentDetails.remainingPayment.paidAt = new Date();
      } else if (payment.paymentType === "downPayment") {
        order.paymentDetails.downPayment.status = "paid";
        order.paymentDetails.downPayment.paidAt = new Date();
      } else if (payment.paymentType === "remainingPayment") {
        order.paymentDetails.remainingPayment.status = "paid";
        order.paymentDetails.remainingPayment.paidAt = new Date();
        order.paymentDetails.isPaid = true;
      }
      
      // Update order verification status
      order.verificationStatus = 'Diverifikasi';
      order.verificationNotes = note || 'Pembayaran telah diverifikasi';
      
      // Automatically change order status from "Pesanan Diterima" to "Diproses" after payment verification
      if (order.status === "Pesanan Diterima") {
        const oldStatus = order.status;
        order.status = "Diproses";
        
        // Add status change to history
        order.statusHistory.push({
          status: "Diproses",
          changedBy: req.user._id,
          timestamp: new Date(),
          notes: `Status diubah otomatis dari ${oldStatus} ke Diproses setelah pembayaran diverifikasi`
        });
      }
    } else if (status === 'rejected') {
      // Reset payment status to pending
      if (payment.paymentType === "fullPayment") {
        order.paymentDetails.isPaid = false;
        order.paymentDetails.downPayment.status = "pending";
        order.paymentDetails.remainingPayment.status = "pending";
      } else if (payment.paymentType === "downPayment") {
        order.paymentDetails.downPayment.status = "pending";
      } else if (payment.paymentType === "remainingPayment") {
        order.paymentDetails.remainingPayment.status = "pending";
        order.paymentDetails.isPaid = false;
      }
      
      // Update order verification status
      order.verificationStatus = 'Ditolak';
      order.verificationNotes = note || 'Pembayaran ditolak';
    }

    // Add to status history - only add payment verification info if status didn't change
    if (!(status === 'verified' && order.status === "Diproses")) {
      order.statusHistory.push({
        status: order.status,
        changedBy: req.user._id,
        timestamp: new Date(),
        notes: `Pembayaran ${status === 'verified' ? 'diverifikasi' : 'ditolak'}: ${note || ''}`
      });
    }

    await payment.save();
    await order.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "verify",
      module: "payment",
      description: `Payment ${status} for order: ${order.orderNumber}${status === 'verified' && order.status === "Diproses" ? ', status changed to Diproses' : ''}`,
      details: {
        orderId: order._id,
        paymentId: payment._id,
        status,
        note,
        statusChanged: status === 'verified' && order.status === "Diproses"
      },
    }).save();

    // Send WhatsApp notification for verified payments
    if (status === 'verified') {
      try {
        await whatsappNotifier.sendPaymentVerification(
          payment,
          order,
          order.customer
        );
        
        // If order status changed to "Diproses", also send status update notification
        if (order.status === "Diproses") {
          await whatsappNotifier.sendOrderStatusUpdate(
            order,
            "Diproses",
            order.customer
          );
        }
      } catch (notifyError) {
        console.error("WhatsApp notification error:", notifyError);
        // Continue even if notification fails
      }
    }

    // Return updated order with populated fields
    const updatedOrder = await Order.findById(order._id)
      .populate("customer", "name email phone")
      .populate("items.product", "name images")
      .populate("statusHistory.changedBy", "name role");

    res.json({
      message: status === 'verified' ? "Payment verification successful" : "Payment rejection successful",
      payment,
      order: updatedOrder
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      message: "Failed to verify payment",
      error: error.message
    });
  }
};

/**
 * Create manual payment
 */
const createManualPayment = async (req, res) => {
  try {
    const { orderId, paymentType, amount, method, notes } = req.body;

    // Validate required fields
    if (!orderId || !paymentType || !amount || !method) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Validate payment type
    if (!["downPayment", "remainingPayment", "fullPayment"].includes(paymentType)) {
      return res.status(400).json({ message: "Invalid payment type" });
    }

    // Create payment record
    const payment = new Payment({
      order: order._id,
      paymentType,
      amount: Number(amount),
      method,
      status: "paid", // Set to paid immediately
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
    if (paymentType === "fullPayment") {
      // Full payment - mark everything as paid
      order.paymentDetails.isPaid = true;
      order.paymentDetails.downPayment.status = "paid";
      order.paymentDetails.downPayment.paidAt = new Date();
      order.paymentDetails.downPayment.paymentMethod = method;
      order.paymentDetails.remainingPayment.status = "paid";
      order.paymentDetails.remainingPayment.paidAt = new Date();
      order.paymentDetails.remainingPayment.paymentMethod = method;
    } else if (paymentType === "downPayment") {
      // Down payment only
      order.paymentDetails.downPayment.status = "paid";
      order.paymentDetails.downPayment.paidAt = new Date();
      order.paymentDetails.downPayment.paymentMethod = method;
    } else if (paymentType === "remainingPayment") {
      // Remaining payment - mark remaining and set isPaid to true
      order.paymentDetails.remainingPayment.status = "paid";
      order.paymentDetails.remainingPayment.paidAt = new Date();
      order.paymentDetails.remainingPayment.paymentMethod = method;
      order.paymentDetails.isPaid = true; // Order is fully paid after remaining payment
    }

    await order.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "create",
      module: "payment",
      description: `Manual payment processed for order: ${order.orderNumber}`,
      details: { 
        orderId: order._id, 
        paymentId: payment._id,
        paymentType,
        amount,
        method
      },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.status(201).json({
      message: "Manual payment processed successfully",
      payment,
      order
    });
  } catch (error) {
    console.error("Create manual payment error:", error);
    res.status(500).json({ 
      message: "Failed to process manual payment", 
      error: error.message 
    });
  }
};

const getMidtransConfig = async (req, res) => {
  try {
    const config = {
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
      isProduction: process.env.MIDTRANS_PRODUCTION === "true",
      snapUrl: process.env.MIDTRANS_PRODUCTION === "true" 
        ? "https://app.midtrans.com/snap/snap.js"
        : "https://app.sandbox.midtrans.com/snap/snap.js"
    };
    
    res.json({ success: true, config });
  } catch (error) {
    console.error("Error getting Midtrans config:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get Midtrans configuration" 
    });
  }
};

module.exports = {
  createSnapToken,
  createPaymentForExistingOrder,
  handleMidtransNotification,
  getAllPayments,
  getPaymentById,
  confirmPayment,
  verifyPayment,
  createManualPayment,
  getMidtransConfig
};
