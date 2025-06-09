/**
 * SKU Generator utility
 * Generates SKU codes based on product attributes
 */

// Generate multiple SKUs for a product based on combinations
const generateProductSKUs = (product) => {
  const skus = [];
  const baseCode = product.productCode; // ALWAYS use productCode.

  if (!baseCode) {
    throw new Error("generateProductSKUs requires the product to have a productCode.");
  }

  if (product.sizes && product.colors && product.materials) {
    product.sizes.forEach((size) => {
      product.colors.forEach((color) => {
        product.materials.forEach((material) => {
          // Construct a readable SKU
          const sku = `${baseCode}-${size.size}-${color.name.replace(/\s+/g, '')}-${material.name.replace(/\s+/g, '')}`;
          
          skus.push({
            sku: sku,
            size: size.size,
            color: color.name,
            material: material.name,
            inventory: 0, // Default inventory
          });
        });
      });
    });
  }

  return skus;
};

module.exports = {
  generateProductSKUs,
};
