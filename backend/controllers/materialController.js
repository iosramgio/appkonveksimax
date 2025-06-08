const Product = require("../models/Product");

// Get all unique materials from products
const getAllMaterials = async (req, res) => {
  try {
    const products = await Product.find({ availability: true });
    
    // Extract unique materials from all products
    const uniqueMaterials = new Map();
    products.forEach(product => {
      product.materials.forEach(material => {
        if (!uniqueMaterials.has(material.name)) {
          uniqueMaterials.set(material.name, {
            name: material.name,
            additionalPrice: material.additionalPrice || 0,
            available: material.available
          });
        }
      });
    });

    // Convert Map to Array
    const materials = Array.from(uniqueMaterials.values());

    res.json(materials);
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({ message: 'Error fetching materials' });
  }
};

module.exports = {
  getAllMaterials
}; 