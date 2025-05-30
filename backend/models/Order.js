const mongoose = require("mongoose");
const { calculateItemPrice } = require('../utils/priceCalculator');

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        sku: {
          type: String,
          required: true,
        },
        color: {
          name: {
            type: String,
            required: true,
          },
          code: {
            type: String,
            required: true,
          },
          available: {
            type: Boolean,
            default: true,
          },
          _id: {
            type: String,
            required: false,
          },
        },
        material: {
          name: {
            type: String,
            required: true,
          },
          additionalPrice: {
            type: Number,
            default: 0,
          },
          available: {
            type: Boolean,
            default: true,
          },
          _id: {
            type: String,
            required: false,
          },
        },
        sizeBreakdown: [{
          size: {
            type: String,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
          additionalPrice: {
            type: Number,
            default: 0
          }
        }],
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        dozenPrice: {
          type: Number,
          default: 0
        },
        priceDetails: {
          subtotal: Number,
          total: Number,
          sizeDetails: [{
            size: String,
            quantity: Number,
            pricePerUnit: Number,
            additionalPrice: Number,
            subtotal: Number,
          }],
          totalQuantity: Number,
          totalDozens: Number,
          customDesignFee: Number,
          discountAmount: Number,
          discountPercentage: Number,
          priceComponents: {
            basePrice: Number,
            dozenPrice: Number,
            materialAdditionalPrice: Number,
            customizationFee: Number
          }
        },
        customDesign: {
          isCustom: {
            type: Boolean,
            default: false,
          },
          designUrl: {
            type: String,
            default: ''
          },
          customizationFee: {
            type: Number,
            default: 0,
          },
          notes: {
            type: String,
            default: ''
          }
        },
        notes: {
          type: String,
        },
        productDetails: {
          name: {
            type: String,
          },
          description: {
            type: String,
          },
          category: {
            type: String,
          },
          images: [{
            url: String,
            public_id: String
          }]
        }
      },
    ],
    status: {
      type: String,
      enum: [
        "Pesanan Diterima",
        "Diproses",
        "Selesai Produksi",
        "Siap Kirim",
        "Selesai",
      ],
      default: "Pesanan Diterima",
    },
    verificationStatus: {
      type: String,
      enum: ["Belum Diverifikasi", "Diverifikasi", "Ditolak"],
      default: "Belum Diverifikasi",
    },
    verificationNotes: {
      type: String,
    },
    statusHistory: [
      {
        status: {
          type: String,
          required: true,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        notes: {
          type: String,
        },
      },
    ],
    shippingAddress: {
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      province: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
    },
    paymentDetails: {
      subtotal: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
      customFees: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
      downPayment: {
        required: {
          type: Boolean,
          default: true,
        },
        percentage: {
          type: Number,
          default: 30,
        },
        amount: {
          type: Number,
        },
        status: {
          type: String,
          enum: ["pending", "paid", "expired"],
          default: "pending",
        },
        paymentMethod: {
          type: String,
        },
        paymentId: {
          type: String,
        },
        paidAt: {
          type: Date,
        },
      },
      remainingPayment: {
        amount: {
          type: Number,
        },
        dueDate: {
          type: Date,
        },
        status: {
          type: String,
          enum: ["pending", "paid", "expired"],
          default: "pending",
        },
        paymentMethod: {
          type: String,
        },
        paymentId: {
          type: String,
        },
        paidAt: {
          type: Date,
        },
      },
      isPaid: {
        type: Boolean,
        default: false,
      },
    },
    isOfflineOrder: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    estimatedCompletionDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to set order number
OrderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    // Find the latest order from today
    const latestOrder = await mongoose
      .model("Order")
      .findOne({
        orderNumber: new RegExp(`^KVK-${year}${month}${day}`),
      })
      .sort({ orderNumber: -1 });

    let sequence = "001";
    if (latestOrder) {
      const latestSequence = latestOrder.orderNumber.slice(-3);
      sequence = (parseInt(latestSequence) + 1).toString().padStart(3, "0");
    }

    this.orderNumber = `KVK-${year}${month}${day}-${sequence}`;
  }

  next();
});

// Calculate total from items' priceDetails
OrderSchema.pre('save', function(next) {
  const frontendSubtotal = this.paymentDetails?.subtotal;
  const frontendTotal = this.paymentDetails?.total;
  let calculatedSubtotalBasedOnItems = 0;
  let customFees = 0;

  // Prioritaskan priceDetails dari frontend untuk setiap item
  this.items.forEach(item => {
    // Jika priceDetails dari frontend lengkap dan valid, gunakan tanpa kalkulasi ulang
    if (item.priceDetails && typeof item.priceDetails.total === 'number') {
      calculatedSubtotalBasedOnItems += item.priceDetails.total; // item.priceDetails.total sudah termasuk diskon level item
      customFees += item.priceDetails.customDesignFee || 0; // customDesignFee dari kalkulasi frontend
    } else {
      // Fallback: Hitung priceDetails menggunakan logika backend jika tidak disediakan atau tidak valid dari frontend
      const productCustomizationFeePerUnit = item.customDesign?.customizationFee || 0;

      const productForPriceCalc = {
        basePrice: item.unitPrice, // Dari cart item.basePrice
        dozenPrice: item.dozenPrice, // Dari cart item.dozenPrice
        discount: item.discount || 0, // Diskon spesifik item dari cart item.discount
        customizationFee: productCustomizationFeePerUnit // Fee per unit
      };

      const backendCalculatedDetails = calculateItemPrice({
        product: productForPriceCalc,
        sizeBreakdown: item.sizeBreakdown,
        material: {
          name: item.material?.name,
          additionalPrice: item.material?.additionalPrice || 0
        },
        // calculateItemPrice uses product.customizationFee and checks customDesign.isCustom
        customDesign: item.customDesign?.isCustom ? { isCustom: true } : null 
      });

      item.priceDetails = backendCalculatedDetails; // Set the backend-calculated details
      calculatedSubtotalBasedOnItems += backendCalculatedDetails.total; // This total is after item-specific discount
      if (backendCalculatedDetails.customDesignFee) { // customDesignFee is also part of backendCalculatedDetails
        customFees += backendCalculatedDetails.customDesignFee;
      }
    }
  });

  // Determine subtotal to use for the order - prioritaskan nilai dari frontend jika valid
  const subtotalToUse = (typeof frontendSubtotal === 'number') ? frontendSubtotal : calculatedSubtotalBasedOnItems;

  let finalTotal;

  if (typeof frontendTotal === 'number') {
    finalTotal = frontendTotal;
    this.paymentDetails.subtotal = subtotalToUse; 
  } else {
    const orderDiscountPercentage = this.paymentDetails.discount || 0; // Order-level discount
    const discountAmount = Math.round((subtotalToUse * orderDiscountPercentage) / 100);
    finalTotal = subtotalToUse - discountAmount;
    this.paymentDetails.subtotal = subtotalToUse;
  }
  
  this.paymentDetails.customFees = customFees; // Sum of customFees from items (either frontend or backend calculated)
  this.paymentDetails.total = finalTotal;

  // Calculate down payment amount if required, based on the finalTotal
  if (this.paymentDetails.downPayment && this.paymentDetails.downPayment.required) {
    const dpPercentage = this.paymentDetails.downPayment.percentage || 0; // Ensure percentage is defined
    const dpAmount = Math.round((finalTotal * dpPercentage) / 100);
    this.paymentDetails.downPayment.amount = dpAmount;
    this.paymentDetails.remainingPayment.amount = finalTotal - dpAmount;
  } else if (this.paymentDetails.downPayment) { // if downPayment object exists but not required (e.g. full payment)
    this.paymentDetails.downPayment.amount = 0;
    if (this.paymentDetails.remainingPayment) { // ensure remainingPayment exists
        this.paymentDetails.remainingPayment.amount = finalTotal;
    } else { // if remainingPayment doesn't exist, create it
        this.paymentDetails.remainingPayment = { amount: finalTotal, status: 'pending' };
    }
  } else { // If no downPayment object, assume full payment pending
    this.paymentDetails.downPayment = { required: false, amount: 0, status: 'pending', percentage: 0};
    this.paymentDetails.remainingPayment = { amount: finalTotal, status: 'pending' };
  }
  
  // Ensure isPaid status reflects reality if total is 0
  if (finalTotal === 0) {
    this.paymentDetails.isPaid = true;
    if(this.paymentDetails.downPayment) this.paymentDetails.downPayment.status = 'paid';
    if(this.paymentDetails.remainingPayment) this.paymentDetails.remainingPayment.status = 'paid';
  }

  next();
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
