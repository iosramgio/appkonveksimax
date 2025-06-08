import api, { handleApiResponse, uploadFile } from '../utils/api';
import { PRODUCTS, PRODUCT_BY_ID, PRODUCT_UPLOAD_DESIGN } from '../constants/api';

/**
 * Get all products
 * 
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response
 */
export const getProducts = async (params = {}) => {
  return handleApiResponse(
    api.get(PRODUCTS, { params })
  );
};

/**
 * Get product by ID
 * 
 * @param {string} id - Product ID
 * @returns {Promise} - API response
 */
export const getProductById = async (id) => {
  return handleApiResponse(
    api.get(PRODUCT_BY_ID(id))
  );
};

/**
 * Create new product
 * 
 * @param {Object} productData - Product data
 * @returns {Promise} - API response
 */
export const createProduct = async (productData) => {
  return handleApiResponse(
    api.post(PRODUCTS, productData)
  );
};

/**
 * Update product
 * 
 * @param {string} id - Product ID
 * @param {Object} productData - Product data to update
 * @returns {Promise} - API response
 */
export const updateProduct = async (id, productData) => {
  return handleApiResponse(
    api.put(PRODUCT_BY_ID(id), productData)
  );
};

/**
 * Delete product
 * 
 * @param {string} id - Product ID
 * @returns {Promise} - API response
 */
export const deleteProduct = async (id) => {
  return handleApiResponse(
    api.delete(PRODUCT_BY_ID(id))
  );
};

/**
 * Upload product image
 * 
 * @param {string} productId - Product ID
 * @param {File} image - Image file
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} - API response
 */
export const uploadProductImage = async (productId, image, onProgress) => {
  return uploadFile(
    `${PRODUCT_BY_ID(productId)}/image`,
    image,
    { productId },
    onProgress
  );
};

/**
 * Upload customer design
 * 
 * @param {File} designFile - Design file
 * @param {Object} designInfo - Design information
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} - API response
 */
export const uploadDesign = async (designFile, designInfo = {}, onProgress) => {
  return uploadFile(
    PRODUCT_UPLOAD_DESIGN,
    designFile,
    designInfo,
    onProgress
  );
};

/**
 * Get product variations
 * 
 * @param {string} id - Product ID
 * @returns {Promise} - API response
 */
export const getProductVariations = async (id) => {
  return handleApiResponse(
    api.get(`${PRODUCT_BY_ID(id)}/variations`)
  );
};

/**
 * Update product variations
 * 
 * @param {string} id - Product ID
 * @param {Array} variations - Product variations
 * @returns {Promise} - API response
 */
export const updateProductVariations = async (id, variations) => {
  return handleApiResponse(
    api.put(`${PRODUCT_BY_ID(id)}/variations`, { variations })
  );
};