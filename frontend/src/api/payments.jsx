import api, { handleApiResponse } from '../utils/api';
import { PAYMENTS, PAYMENT_VERIFY, PAYMENT_CONFIRM, MIDTRANS_TOKEN } from '../constants/api';

/**
 * Get all payments
 * 
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response
 */
export const getPayments = async (params = {}) => {
  return handleApiResponse(
    api.get(PAYMENTS, { params })
  );
};

/**
 * Get payment by ID
 * 
 * @param {string} id - Payment ID
 * @returns {Promise} - API response
 */
export const getPaymentById = async (id) => {
  return handleApiResponse(
    api.get(`${PAYMENTS}/${id}`)
  );
};

/**
 * Get payments by order ID
 * 
 * @param {string} orderId - Order ID
 * @returns {Promise} - API response
 */
export const getPaymentsByOrderId = async (orderId) => {
  return handleApiResponse(
    api.get(`${PAYMENTS}/order/${orderId}`)
  );
};

/**
 * Create Snap token for payment
 * 
 * @param {Object} data - Payment data
 * @returns {Promise} - API response
 */
export const createSnapToken = async (data) => {
  return handleApiResponse(
    api.post(MIDTRANS_TOKEN, data)
  );
};

/**
 * Confirm payment status
 * 
 * @param {Object} paymentData - Payment data from Midtrans
 * @returns {Promise} - API response
 */
export const confirmPayment = async (paymentData) => {
  return handleApiResponse(
    api.post(PAYMENT_CONFIRM, paymentData)
  );
};

/**
 * Verify payment (Admin/Cashier)
 * 
 * @param {string} id - Payment ID
 * @param {boolean} isVerified - Verification status
 * @param {string} notes - Verification notes
 * @returns {Promise} - API response
 */
export const verifyPayment = async (id, isVerified, notes = '') => {
  return handleApiResponse(
    api.post(PAYMENT_VERIFY.replace(':paymentId', id), { isVerified, notes })
  );
};

/**
 * Record manual payment (Cashier/Admin)
 * 
 * @param {string} orderId - Order ID
 * @param {Object} paymentData - Payment data
 * @returns {Promise} - API response
 */
export const recordManualPayment = async (orderId, paymentData) => {
  return handleApiResponse(
    api.post(`${PAYMENTS}/manual/${orderId}`, paymentData)
  );
};

/**
 * Get payment status from Midtrans
 * 
 * @param {string} transactionId - Midtrans transaction ID
 * @returns {Promise} - API response
 */
export const getPaymentStatus = async (transactionId) => {
  return handleApiResponse(
    api.get(`${PAYMENTS}/status/${transactionId}`)
  );
};

/**
 * Request payment for remaining balance (for DP payments)
 * 
 * @param {string} orderId - Order ID
 * @returns {Promise} - API response
 */
export const requestRemainingPayment = async (orderId) => {
  return handleApiResponse(
    api.post(`${PAYMENTS}/remaining/${orderId}`)
  );
};

/**
 * Set payment due date for remaining balance
 * 
 * @param {string} orderId - Order ID
 * @param {string} dueDate - Due date
 * @returns {Promise} - API response
 */
export const setPaymentDueDate = async (orderId, dueDate) => {
  return handleApiResponse(
    api.post(`${PAYMENTS}/due-date/${orderId}`, { dueDate })
  );
};

/**
 * Get Midtrans configuration
 * 
 * @returns {Promise} - API response
 */
export const getMidtransConfig = () => {
  return api.get('/payments/config');
};