const Product = require("../models/Product");

// Get all unique colors from products
const getAllColors = async (req, res) => {
  try {
    const products = await Product.find({ availability: true });
    
    // Extract unique colors from all products
    const uniqueColors = new Map();
    products.forEach(product => {
      product.colors.forEach(color => {
        if (!uniqueColors.has(color.name)) {
          uniqueColors.set(color.name, {
            name: color.name,
            code: color.code,
            available: color.available
          });
        }
      });
    });

    // Convert Map to Array
    const colors = Array.from(uniqueColors.values());

    res.json(colors);
  } catch (error) {
    console.error('Error fetching colors:', error);
    res.status(500).json({ message: 'Error fetching colors' });
  }
};

module.exports = {
  getAllColors
}; 