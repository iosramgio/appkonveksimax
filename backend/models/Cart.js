const mongoose = require('mongoose');

const sizeBreakdownSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  additionalPrice: {
    type: Number,
    default: 0
  }
});

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  productImage: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  color: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    code: {
      type: String,
      required: true
    }
  },
  material: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    additionalPrice: {
      type: Number,
      default: 0
    }
  },
  sizeBreakdown: [sizeBreakdownSchema],
  customDesign: {
    file: {
      type: Object
    },
    notes: String,
    customizationFee: Number
  },
  notes: String,
  basePrice: {
    type: Number,
    required: true
  },
  dozenPrice: {
    type: Number,
    required: true
  },
  priceDetails: {
    total: Number,
    basePrice: Number,
    dozenPrice: Number,
    totalQuantity: Number,
    hasDozenPrice: Boolean,
    totalDozens: Number,
    remainingUnits: Number
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  total: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate total before saving
cartSchema.pre('save', async function(next) {
  if (this.isModified('items')) {
    this.total = this.items.reduce((total, item) => {
      return total + (item.priceDetails?.total || 0);
    }, 0);
  }
  next();
});

module.exports = mongoose.model('Cart', cartSchema); 