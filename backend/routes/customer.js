const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/auth');
const { isAdminOrCashier } = require('../middleware/roleCheck');

// All routes require authentication
router.use(auth);

// Search customers (Admin & Cashier only)
router.get('/search', isAdminOrCashier, customerController.searchCustomers);

// Get customer by ID (Admin & Cashier only)
router.get('/:id', isAdminOrCashier, customerController.getCustomerById);

// Create new customer (Admin & Cashier only)
router.post('/', isAdminOrCashier, customerController.createCustomer);

module.exports = router; 