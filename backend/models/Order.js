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
        "Ditolak"
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

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
