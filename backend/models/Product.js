const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    dozenPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    images: [
      {
        url: {
          type: String,
          required: true
        },
        public_id: {
          type: String,
          required: true
        }
      }
    ],
    category: {
      type: String,
      required: true,
      trim: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    sizes: [
      {
        size: {
          type: String,
          enum: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
        },
        additionalPrice: {
          type: Number,
          default: 0,
        },
        available: {
          type: Boolean,
          default: true,
        },
      },
    ],
    colors: [
      {
        name: {
          type: String,
          required: true,
        },
        code: {
          type: String,
          required: true, // Hex color code
        },
        available: {
          type: Boolean,
          default: true,
        },
      },
    ],
    materials: [
      {
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
      },
    ],
    customizationFee: {
      type: Number,
      default: 0,
    },
    skus: [
      {
        sku: {
          type: String,
          required: true,
          unique: true,
        },
        size: String,
        color: String,
        material: String,
        price: Number,
        dozenPrice: Number,
        inventory: {
          type: Number,
          default: 0,
        },
      },
    ],
    productionTime: {
      type: Number,
      default: 7, // Default production time in days
      min: 1,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
