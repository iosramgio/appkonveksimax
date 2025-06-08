import api, { handleApiResponse } from '../utils/api';
import { REPORTS, SALES_REPORT, FINANCIAL_REPORT, INVENTORY_REPORT, EXPORT_REPORT } from '../constants/api';

/**
 * Get dashboard summary report
 * 
 * @param {Object} params - Query parameters (dates, etc.)
 * @returns {Promise} - API response
 */
export const getDashboardSummary = async (params = {}) => {
  return handleApiResponse(
    api.get(`${REPORTS}/dashboard`, { params })
  );
};

/**
 * Get sales report
 * 
 * @param {Object} params - Query parameters (period, dates, etc.)
 * @returns {Promise} - API response
 */
export const getSalesReport = async (params = {}) => {
  return handleApiResponse(
    api.get(SALES_REPORT, { params })
  );
};

/**
 * Get financial report
 * 
 * @param {Object} params - Query parameters (period, dates, etc.)
 * @returns {Promise} - API response
 */
export const getFinancialReport = async (params = {}) => {
  return handleApiResponse(
    api.get(FINANCIAL_REPORT, { params })
  );
};

/**
 * Get inventory report
 * 
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response
 */
export const getInventoryReport = async (params = {}) => {
  return handleApiResponse(
    api.get(INVENTORY_REPORT, { params })
  );
};

/**
 * Export report to Excel
 * 
 * @param {string} type - Report type (sales, financial, inventory)
 * @param {Object} params - Query parameters (period, dates, etc.)
 * @returns {Promise} - API response with download URL
 */
export const exportReport = async (type, params = {}) => {
  return handleApiResponse(
    api.get(EXPORT_REPORT(type), {
      params,
      responseType: 'blob'
    })
  );
};

/**
 * Get top selling products
 * 
 * @param {Object} params - Query parameters (limit, period, etc.)
 * @returns {Promise} - API response
 */
export const getTopSellingProducts = async (params = {}) => {
  return handleApiResponse(
    api.get(`${REPORTS}/top-products`, { params })
  );
};

/**
 * Get orders by status count
 * 
 * @param {Object} params - Query parameters (period, dates, etc.)
 * @returns {Promise} - API response
 */
export const getOrdersByStatusCount = async (params = {}) => {
  return handleApiResponse(
    api.get(`${REPORTS}/orders-by-status`, { params })
  );
};

/**
 * Get revenue by period
 * 
 * @param {string} period - Period type (daily, weekly, monthly, yearly)
 * @param {Object} params - Additional parameters (dates, etc.)
 * @returns {Promise} - API response
 */
export const getRevenueByPeriod = async (period, params = {}) => {
  return handleApiResponse(
    api.get(`${REPORTS}/revenue/${period}`, { params })
  );
};

/**
 * Get sales by product category
 * 
 * @param {Object} params - Query parameters (period, dates, etc.)
 * @returns {Promise} - API response
 */
export const getSalesByCategory = async (params = {}) => {
  return handleApiResponse(
    api.get(`${REPORTS}/sales-by-category`, { params })
  );
};

/**
 * Get payment methods distribution
 * 
 * @param {Object} params - Query parameters (period, dates, etc.)
 * @returns {Promise} - API response
 */
export const getPaymentMethodsDistribution = async (params = {}) => {
  return handleApiResponse(
    api.get(`${REPORTS}/payment-methods`, { params })
  );
};

/**
 * Get customer statistics
 * 
 * @param {Object} params - Query parameters (period, dates, etc.)
 * @returns {Promise} - API response
 */
export const getCustomerStats = async (params = {}) => {
  return handleApiResponse(
    api.get(`${REPORTS}/customer-stats`, { params })
  );
};

/**
 * Get material inventory status
 * 
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response
 */
export const getMaterialInventory = async (params = {}) => {
  return handleApiResponse(
    api.get(`${REPORTS}/materials`, { params })
  );
};

/**
 * Get material usage report
 * 
 * @param {Object} params - Query parameters (period, dates, etc.)
 * @returns {Promise} - API response
 */
export const getMaterialUsage = async (params = {}) => {
  return handleApiResponse(
    api.get(`${REPORTS}/material-usage`, { params })
  );
};