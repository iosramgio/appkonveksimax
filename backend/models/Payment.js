const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["downPayment", "remainingPayment", "fullPayment"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "expired", "failed", "refunded"],
      default: "pending",
    },
    method: {
      type: String,
      enum: ["midtrans", "cash", "transfer"],
      required: true,
    },
    midtrans: {
      transactionId: {
        type: String,
        index: true,
        sparse: true
      },
      transactionTime: Date,
      transactionStatus: String,
      grossAmount: Number,
      paymentType: String,
      fraudStatus: String,
      expiryTime: Date
    },
    manualPayment: {
      receivedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      receiptNumber: String,
      notes: String
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quicker searches
PaymentSchema.index({ order: 1 });
PaymentSchema.index({ "midtrans.transactionId": 1 }, { sparse: true });

module.exports = mongoose.model("Payment", PaymentSchema);
