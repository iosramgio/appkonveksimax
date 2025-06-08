/**
 * SKU Generator utility
 * Generates SKU codes based on product attributes
 */
const { calculatePrice } = require('./priceCalculator');

// Generate a product SKU based on attributes
const generateSKU = (productInfo, sizeCode, colorCode, materialCode) => {
  // Category code (2 characters)
  let categoryCode = getCategoryCode(productInfo.category);

  // Product code (4 characters) - derived from name or ID
  let productCode = getProductCode(productInfo);

  // Size code (2 characters)
  let sizeShortCode = getSizeCode(sizeCode);

  // Color code (2 characters)
  let colorShortCode = getColorCode(colorCode);

  // Material code (2 characters)
  let materialShortCode = getMaterialCode(materialCode);

  // Combine to create SKU
  return `${categoryCode}${productCode}${sizeShortCode}${colorShortCode}${materialShortCode}`;
};

// Get short code for product category
const getCategoryCode = (category) => {
  // Map categories to codes
  const categoryMap = {
    kaos: "KS",
    kemeja: "KM",
    jaket: "JK",
    celana: "CL",
    hoodie: "HD",
    polo: "PL",
    sweater: "SW",
    topi: "TP",
    tas: "TS",
    masker: "MS",
    // Add more categories as needed
  };

  // Return category code or default 'XX' if not found
  return (
    categoryMap[category.toLowerCase()] ||
    category.substring(0, 2).toUpperCase()
  );
};

// Get product code from name or ID
const getProductCode = (productInfo) => {
  if (productInfo._id) {
    // Use last 4 characters of MongoDB ObjectId
    return productInfo._id.toString().substr(-4).toUpperCase();
  } else if (productInfo.name) {
    // Generate code from name (first 2 chars + 2 random digits)
    const nameBase = productInfo.name.substring(0, 2).toUpperCase();
    const randomNum = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    return `${nameBase}${randomNum}`;
  } else {
    // Generate random 4-character alphanumeric code
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  }
};

// Get size code
const getSizeCode = (size) => {
  const sizeMap = {
    S: "S0",
    M: "M0",
    L: "L0",
    XL: "XL",
    "2XL": "2X",
    "3XL": "3X",
    "4XL": "4X",
    "5XL": "5X",
  };

  return sizeMap[size] || "XX";
};

// Get color code
const getColorCode = (color) => {
  // If color is longer than 2 chars, take first and last char
  if (color && color.length > 2) {
    return (color.charAt(0) + color.charAt(color.length - 1)).toUpperCase();
  }

  // Otherwise just take the color and pad with X if needed
  return color ? color.padEnd(2, "X").toUpperCase() : "XX";
};

// Get material code
const getMaterialCode = (material) => {
  const materialMap = {
    cotton: "CT",
    polyester: "PL",
    fleece: "FL",
    denim: "DN",
    canvas: "CV",
    katun: "KT",
    combed: "CM",
    // Add more materials as needed
  };

  // Try to find in map first
  if (material && materialMap[material.toLowerCase()]) {
    return materialMap[material.toLowerCase()];
  }

  // Otherwise same logic as color code
  if (material && material.length > 2) {
    return (
      material.charAt(0) + material.charAt(material.length - 1)
    ).toUpperCase();
  }

  return material ? material.padEnd(2, "X").toUpperCase() : "XX";
};

// Generate multiple SKUs for a product based on combinations
const generateProductSKUs = (product) => {
  const skus = [];

  // For each size
  product.sizes.forEach((sizeObj) => {
    if (!sizeObj.available) return;

    // For each color
    product.colors.forEach((colorObj) => {
      if (!colorObj.available) return;

      // For each material
      product.materials.forEach((materialObj) => {
        if (!materialObj.available) return;

        // Generate base price using priceCalculator
        const unitPriceResult = calculatePrice(
          product,
          [{
            size: sizeObj.size,
            material: materialObj.name,
            quantity: 1
          }],
          false
        );

        // Generate dozen price using priceCalculator
        const dozenPriceResult = calculatePrice(
          product,
          [{
            size: sizeObj.size,
            material: materialObj.name,
            quantity: 12
          }],
          false
        );

        // Generate SKU
        const sku = generateSKU(
          { _id: product._id, name: product.name, category: product.category },
          sizeObj.size,
          colorObj.name,
          materialObj.name
        );

        // Add to SKUs array
        skus.push({
          sku,
          size: sizeObj.size,
          color: colorObj.name,
          material: materialObj.name,
          price: unitPriceResult.total,
          dozenPrice: dozenPriceResult.total,
          inventory: 0, // Default inventory
        });
      });
    });
  });

  return skus;
};

module.exports = {
  generateSKU,
  generateProductSKUs,
};
