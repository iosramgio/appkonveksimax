const Product = require("../models/Product");
const ActivityLog = require("../models/ActivityLog");
const { generateProductSKUs } = require("../utils/skuGenerator");
const { cloudinary } = require("../config/cloudinary");
const mongoose = require("mongoose");
const { calculateItemPrice } = require("../utils/priceCalculator");

/**
 * Create a new product
 */
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      basePrice,
      dozenPrice,
      category,
      sizes,
      colors,
      materials,
      customizationFee,
      productionTime,
      discount,
      featured,
    } = req.body;

    // Validate required fields
    if (!name || !basePrice || !dozenPrice || !category) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // --- Start: Generate Automatic Product Code ---
    const lastProduct = await Product.findOne({ productCode: { $regex: /^PRODUK-/ } })
      .sort({ createdAt: -1 })
      .exec();

    let nextProductNumber = 1;
    if (lastProduct && lastProduct.productCode) {
      const lastNumber = parseInt(lastProduct.productCode.split('-')[1], 10);
      nextProductNumber = lastNumber + 1;
    }
    
    const productCode = `PRODUK-${String(nextProductNumber).padStart(4, '0')}`;
    // --- End: Generate Automatic Product Code ---

    // Parse arrays from stringified JSON
    const parsedSizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    const parsedColors = typeof colors === 'string' ? JSON.parse(colors) : colors;
    const parsedMaterials = typeof materials === 'string' ? JSON.parse(materials) : materials;

    // Create product instance
    const product = new Product({
      productCode,
      name,
      description,
      basePrice: Number(basePrice),
      dozenPrice: Number(dozenPrice),
      category,
      sizes: parsedSizes,
      colors: parsedColors,
      materials: parsedMaterials,
      customizationFee: Number(customizationFee) || 0,
      productionTime: Number(productionTime) || 7,
      discount: Number(discount) || 0,
      featured: featured === 'true',
      createdBy: req.user._id,
    });

    // Add images if uploaded
    if (req.files && req.files.length > 0) {
      product.images = req.files.map((file) => ({
        url: file.path, // Cloudinary URL
        public_id: file.filename // Cloudinary public_id
      }));
    }

    // Generate SKUs based on combinations
    product.skus = generateProductSKUs(product);

    // Save product
    await product.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "create",
      module: "product",
      description: `Created new product: ${name}`,
      details: { productId: product._id },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ 
      message: "Failed to create product", 
      error: error.message 
    });
  }
};

/**
 * Get all products with optional filtering
 */
const getAllProducts = async (req, res) => {
  try {
    // Build filters object
    const filters = {};

    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.search) {
      filters.name = { $regex: req.query.search, $options: "i" };
    }

    if (req.query.availability !== undefined) {
      filters.availability = req.query.availability === "true";
    }

    if (req.query.featured !== undefined) {
      filters.featured = req.query.featured === "true";
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filters.basePrice = {};
      if (req.query.minPrice) {
        filters.basePrice.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filters.basePrice.$lte = Number(req.query.maxPrice);
      }
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sort
    const sortField = req.query.sortField || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    // Execute query
    const products = await Product.find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name");

    // Get total count
    const total = await Product.countDocuments(filters);

    // Log products data for debugging
    console.log('Products data being sent:', products.map(p => ({
      id: p._id,
      name: p.name,
      images: p.images
    })));

    res.json({
      message: "Products retrieved successfully",
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve products", error: error.message });
  }
};

/**
 * Get product by ID
 */
const getProductById = async (req, res) => {
  try {
    console.log('Received product ID:', req.params.id); // Debug log
    const product = await Product.findById(req.params.id).populate(
      "createdBy",
      "name"
    );

    console.log('Found product:', product); // Debug log

    if (!product) {
      console.log('Product not found for ID:', req.params.id); // Debug log
      return res.status(404).json({ message: "Product not found" });
    }

    // Pastikan format URL gambar konsisten
    if (product.images && product.images.length > 0) {
      product.images = product.images.map(image => {
        if (typeof image === 'string') {
          return { url: image };
        } else if (image && !image.url && image.path) {
          // Jika Cloudinary menggunakan path bukan url
          return { url: image.path, public_id: image.filename };
        }
        return image;
      });
    }

    res.json({
      message: "Product retrieved successfully",
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);
    res
      .status(500)
      .json({ message: "Failed to retrieve product", error: error.message });
  }
};

/**
 * Update product
 */
const updateProduct = async (req, res) => {
  try {
    console.log('Update product request received:', {
      productId: req.params.id,
      body: req.body,
      files: req.files
    });

    const productId = req.params.id;

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID format" });
    }

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      console.log('Product not found:', productId);
      return res.status(404).json({ message: "Product not found" });
    }

    // Parse arrays from stringified JSON if they exist
    let sizes, colors, materials, existingImages;
    try {
      if (req.body.sizes) {
        sizes = typeof req.body.sizes === 'string' ? JSON.parse(req.body.sizes) : req.body.sizes;
        if (!Array.isArray(sizes)) throw new Error('Sizes must be an array');
      }
      
      if (req.body.colors) {
        colors = typeof req.body.colors === 'string' ? JSON.parse(req.body.colors) : req.body.colors;
        if (!Array.isArray(colors)) throw new Error('Colors must be an array');
      }
      
      if (req.body.materials) {
        materials = typeof req.body.materials === 'string' ? JSON.parse(req.body.materials) : req.body.materials;
        if (!Array.isArray(materials)) throw new Error('Materials must be an array');
      }
      
      if (req.body.existingImages) {
        existingImages = typeof req.body.existingImages === 'string' ? JSON.parse(req.body.existingImages) : req.body.existingImages;
        if (!Array.isArray(existingImages)) throw new Error('Existing images must be an array');
      }
    } catch (parseError) {
      console.error('Error parsing JSON data:', parseError);
      return res.status(400).json({ 
        message: "Invalid data format", 
        error: parseError.message 
      });
    }

    // Update fields if provided
    try {
      if (req.body.name !== undefined) product.name = req.body.name;
      if (req.body.description !== undefined) product.description = req.body.description;
      if (req.body.basePrice !== undefined) product.basePrice = Number(req.body.basePrice);
      if (req.body.dozenPrice !== undefined) product.dozenPrice = Number(req.body.dozenPrice);
      if (req.body.category !== undefined) product.category = req.body.category;
      if (req.body.availability !== undefined) product.availability = req.body.availability === 'true';
      if (sizes !== undefined) product.sizes = sizes;
      if (colors !== undefined) product.colors = colors;
      if (materials !== undefined) product.materials = materials;
      if (req.body.customizationFee !== undefined) product.customizationFee = Number(req.body.customizationFee);
      if (req.body.productionTime !== undefined) product.productionTime = Number(req.body.productionTime);
      if (req.body.discount !== undefined) product.discount = Number(req.body.discount);
      if (req.body.featured !== undefined) product.featured = req.body.featured === 'true';
    } catch (updateError) {
      console.error('Error updating product fields:', updateError);
      return res.status(400).json({ 
        message: "Error updating product fields", 
        error: updateError.message 
      });
    }

    // Handle images
    try {
      let updatedImages = [];

      // Add existing images if provided
      if (existingImages && Array.isArray(existingImages)) {
        updatedImages = existingImages;
      }

      // Add new images if uploaded
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => ({
          url: file.path,
          public_id: file.filename
        }));
        updatedImages = [...updatedImages, ...newImages];
      }

      // Update product images if we have any
      if (updatedImages.length > 0) {
        product.images = updatedImages;
      }
    } catch (imageError) {
      console.error('Error handling images:', imageError);
      return res.status(400).json({ 
        message: "Error processing images", 
        error: imageError.message 
      });
    }

    // Check if attributes affecting SKUs have changed
    const relevantFieldsChanged = 
      sizes || colors || materials || (req.body.productCode && req.body.productCode !== product.productCode);

    // Regenerate SKUs if relevant attributes changed or if SKUs seem to be in the old format
    const skusNeedUpdate = !product.skus || product.skus.length === 0 || !product.skus.every(s => s.sku && s.sku.startsWith(product.productCode));

    if (relevantFieldsChanged || skusNeedUpdate) {
      console.log("Regenerating SKUs due to product update.");
      product.skus = generateProductSKUs(product);
    }
    
    // Save updated product
    const updatedProduct = await product.save();

    // Log activity
    try {
      await new ActivityLog({
        user: req.user._id,
        action: "update",
        module: "product",
        description: `Updated product: ${product.name}`,
        details: { productId: product._id },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }).save();
    } catch (logError) {
      console.error('Error logging activity:', logError);
      // Don't return error here, just log it
    }

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ 
      message: "Failed to update product", 
      error: error.message 
    });
  }
};

/**
 * Delete product
 */
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary if they exist
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.public_id) {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (cloudinaryError) {
            console.error("Cloudinary deletion error:", cloudinaryError);
            // Continue with deletion even if Cloudinary fails
          }
        }
      }
    }

    // Delete product
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "delete",
      module: "product",
      description: `Deleted product: ${product.name}`,
      details: { productId: product._id },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: "Invalid product ID format" 
      });
    }
    res.status(500).json({ 
      message: "Failed to delete product", 
      error: error.message 
    });
  }
};

/**
 * Update product inventory
 */
const updateInventory = async (req, res) => {
  try {
    const { productId, sku, quantity } = req.body;

    if (!productId || !sku || quantity === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Find the SKU
    const skuIndex = product.skus.findIndex((s) => s.sku === sku);
    if (skuIndex === -1) {
      return res.status(404).json({ message: "SKU not found" });
    }

    // Update inventory
    product.skus[skuIndex].inventory = quantity;
    await product.save();

    // Log activity
    await new ActivityLog({
      user: req.user._id,
      action: "update",
      module: "product",
      description: `Updated inventory for product: ${product.name}, SKU: ${sku}`,
      details: { productId, sku, quantity },
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    }).save();

    res.json({
      message: "Inventory updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update inventory error:", error);
    res
      .status(500)
      .json({ message: "Failed to update inventory", error: error.message });
  }
};

/**
 * Get all product categories with product count
 */
const getProductCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          name: { $first: "$category" },
          productCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          productCount: 1
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);

    res.json({
      message: "Categories retrieved successfully",
      categories
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ 
      message: "Failed to retrieve categories", 
      error: error.message 
    });
  }
};

/**
 * Upload custom design file
 */
const uploadDesign = async (req, res) => {
  try {
    console.log('Upload design request received:', {
      file: req.file ? 'File received' : 'No file',
      userId: req.user ? req.user._id : 'No user',
      headers: req.headers['content-type']
    });
    
    // Validate that a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    console.log('Design file uploaded:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path || 'No path',
      cloudinaryUrl: req.file.path || req.file.secure_url || 'No URL'
    });
    
    // Return the file URL that Cloudinary assigned
    res.status(200).json({
      message: "Design uploaded successfully",
      url: req.file.path || req.file.secure_url, // This contains the Cloudinary URL
      publicId: req.file.filename || req.file.public_id
    });
    
    // Log activity
    try {
      await new ActivityLog({
        user: req.user._id,
        action: "upload",
        module: "design",
        description: `Uploaded custom design`,
        details: {
          filename: req.file.originalname,
          filesize: req.file.size,
          url: req.file.path || req.file.secure_url
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      }).save();
    } catch (logError) {
      console.error("Failed to log design upload activity:", logError);
      // Continue even if logging fails
    }
  } catch (error) {
    console.error("Upload design error:", error);
    res.status(500).json({ 
      message: "Failed to upload design", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Calculate price for a product with given specifications
 */
const calculatePrice = async (req, res) => {
  try {
    const { productId, items, customDesign } = req.body;

    // Find product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Calculate price using the correct function
    const priceDetails = calculateItemPrice({
      product,
      sizeBreakdown: items,
      material: items.length > 0 ? 
        product.materials.find(m => m.name === items[0].material) : 
        null,
      customDesign: customDesign ? { isCustom: true } : undefined
    });

    res.json(priceDetails);
  } catch (error) {
    console.error('Price calculation error:', error);
    res.status(500).json({ message: 'Failed to calculate price', error: error.message });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateInventory,
  getProductCategories,
  uploadDesign,
  calculatePrice
};
