require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Product = require("../models/Product");
const Material = require("../models/Material");
const { connectDB, disconnectDB } = require("../config/database");

/**
 * Seed database with initial data
 */
const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log("Connected to database");

    // Check if admin user exists
    const adminExists = await User.findOne({ email: "admin@example.com" });

    if (!adminExists) {
      console.log("Creating admin user...");

      const adminUser = new User({
        name: "Admin",
        email: "admin@example.com",
        password: "admin123456",
        phone: "6281234567890",
        role: "admin",
        active: true,
      });

      await adminUser.save();
      console.log("Admin user created");

      // Create other sample users
      console.log("Creating sample users...");

      const users = [
        {
          name: "Cashier User",
          email: "cashier@example.com",
          password: await bcrypt.hash("cashier123", 10),
          phone: "6281234567891",
          role: "cashier",
          active: true,
          createdBy: adminUser._id,
        },
        {
          name: "Staff User",
          email: "staff@example.com",
          password: await bcrypt.hash("staff123", 10),
          phone: "6281234567892",
          role: "staff",
          active: true,
          createdBy: adminUser._id,
        },
        {
          name: "Owner User",
          email: "owner@example.com",
          password: await bcrypt.hash("owner123", 10),
          phone: "6281234567893",
          role: "owner",
          active: true,
          createdBy: adminUser._id,
        },
        {
          name: "Customer User",
          email: "customer@example.com",
          password: await bcrypt.hash("customer123", 10),
          phone: "6281234567894",
          role: "customer",
          active: true,
          createdBy: adminUser._id,
          address: {
            street: "Jl. Customer No. 123",
            city: "Jakarta",
            province: "DKI Jakarta",
            postalCode: "12345",
          },
        },
      ];

      await User.insertMany(users);
      console.log("Sample users created");
    } else {
      console.log("Admin user already exists, skipping user creation");
    }

    // Check if materials exist
    const materialsExist = await Material.countDocuments();

    if (materialsExist === 0) {
      console.log("Creating sample materials...");

      const admin = await User.findOne({ role: "admin" });

      const materials = [
        {
          name: "Cotton Combed 30s",
          description: "High quality cotton combed 30s fabric",
          type: "fabric",
          unit: "meter",
          stockQuantity: 100,
          reorderPoint: 20,
          price: 35000,
          supplier: {
            name: "Textile Supplier Inc.",
            contactPerson: "Supplier Contact",
            phone: "628123456789",
            email: "supplier@example.com",
            address: "Jl. Supplier No. 123, Jakarta",
          },
          isActive: true,
          createdBy: admin._id,
        },
        {
          name: "Cotton Combed 24s",
          description: "High quality cotton combed 24s fabric",
          type: "fabric",
          unit: "meter",
          stockQuantity: 80,
          reorderPoint: 15,
          price: 30000,
          supplier: {
            name: "Textile Supplier Inc.",
            contactPerson: "Supplier Contact",
            phone: "628123456789",
            email: "supplier@example.com",
            address: "Jl. Supplier No. 123, Jakarta",
          },
          isActive: true,
          createdBy: admin._id,
        },
        {
          name: "Polyester",
          description: "High quality polyester fabric",
          type: "fabric",
          unit: "meter",
          stockQuantity: 90,
          reorderPoint: 18,
          price: 25000,
          supplier: {
            name: "Textile Supplier Inc.",
            contactPerson: "Supplier Contact",
            phone: "628123456789",
            email: "supplier@example.com",
            address: "Jl. Supplier No. 123, Jakarta",
          },
          isActive: true,
          createdBy: admin._id,
        }
      ];

      await Material.insertMany(materials);
      console.log("Sample materials created");
    } else {
      console.log("Materials already exist, skipping material creation");
    }

    // Check if products exist
    const productsExist = await Product.countDocuments();

    if (productsExist === 0) {
      console.log("Creating sample products...");

      const admin = await User.findOne({ role: "admin" });

      // Create sample products
      const tshirtProduct = new Product({
        name: "Basic T-Shirt",
        description: "High quality cotton t-shirt with round neck",
        basePrice: 85000,
        dozenPrice: 75000,
        category: "kaos",
        availability: true,
        sizes: [
          { size: "S", additionalPrice: 0, available: true },
          { size: "M", additionalPrice: 0, available: true },
          { size: "L", additionalPrice: 0, available: true },
          { size: "XL", additionalPrice: 0, available: true },
          { size: "2XL", additionalPrice: 10000, available: true },
          { size: "3XL", additionalPrice: 15000, available: true },
        ],
        colors: [
          { name: "Black", code: "#000000", available: true },
          { name: "White", code: "#FFFFFF", available: true },
          { name: "Red", code: "#FF0000", available: true },
          { name: "Navy", code: "#000080", available: true },
        ],
        materials: [
          { name: "Cotton Combed 30s", additionalPrice: 0, available: true },
          {
            name: "Cotton Combed 24s",
            additionalPrice: -5000,
            available: true,
          },
        ],
        customizationFee: 25000,
        productionTime: 5,
        discount: 0,
        featured: true,
        images: [
          {
            url: "https://res.cloudinary.com/demo/image/upload/v1612345678/samples/tshirt.jpg",
            public_id: "samples/tshirt"
          }
        ],
        createdBy: admin._id,
      });

      // Generate SKUs for the product
      const { generateProductSKUs } = require("./skuGenerator");
      tshirtProduct.skus = generateProductSKUs(tshirtProduct);

      await tshirtProduct.save();

      // Create polo shirt product
      const poloProduct = new Product({
        name: "Polo Shirt",
        description: "High quality polo shirt with collar",
        basePrice: 110000,
        dozenPrice: 95000,
        category: "polo",
        availability: true,
        sizes: [
          { size: "S", additionalPrice: 0, available: true },
          { size: "M", additionalPrice: 0, available: true },
          { size: "L", additionalPrice: 0, available: true },
          { size: "XL", additionalPrice: 0, available: true },
          { size: "2XL", additionalPrice: 10000, available: true },
          { size: "3XL", additionalPrice: 15000, available: true },
        ],
        colors: [
          { name: "Black", code: "#000000", available: true },
          { name: "White", code: "#FFFFFF", available: true },
          { name: "Navy", code: "#000080", available: true },
          { name: "Maroon", code: "#800000", available: true },
        ],
        materials: [
          { name: "Cotton Combed 30s", additionalPrice: 0, available: true },
          { name: "Polyester", additionalPrice: -10000, available: true },
        ],
        customizationFee: 30000,
        productionTime: 7,
        discount: 0,
        featured: true,
        images: [
          {
            url: "https://res.cloudinary.com/demo/image/upload/v1612345678/samples/polo.jpg",
            public_id: "samples/polo"
          }
        ],
        createdBy: admin._id,
      });

      // Generate SKUs for the product
      poloProduct.skus = generateProductSKUs(poloProduct);

      await poloProduct.save();

      console.log("Sample products created");
    } else {
      console.log("Products already exist, skipping product creation");
    }

    console.log("Database seeding completed");
  } catch (error) {
    console.error("Database seeding error:", error);
  } finally {
    // Disconnect from database
    await disconnectDB();
    console.log("Disconnected from database");
    process.exit(0);
  }
};

// Run seeder
seedDatabase();
