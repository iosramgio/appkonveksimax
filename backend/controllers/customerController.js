const User = require("../models/User");

/**
 * Search customers by name, phone, or email
 */
const searchCustomers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 3) {
      return res.status(400).json({ message: "Search query must be at least 3 characters long" });
    }

    // Create search regex (case insensitive)
    const searchRegex = new RegExp(q, 'i');

    // Search customers by name, phone, or email
    const customers = await User.find({
      role: 'customer',
      $or: [
        { name: searchRegex },
        { phone: searchRegex },
        { email: searchRegex }
      ]
    })
    .select('name phone email address')
    .limit(20)
    .sort({ createdAt: -1 });

    res.json(customers);
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({ message: "Failed to search customers" });
  }
};

/**
 * Get customer details by ID
 */
const getCustomerById = async (req, res) => {
  try {
    const customer = await User.findOne({
      _id: req.params.id,
      role: 'customer'
    }).select('-password');

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json(customer);
  } catch (error) {
    console.error('Error getting customer:', error);
    res.status(500).json({ message: "Failed to get customer details" });
  }
};

/**
 * Create a new customer (for offline orders)
 */
const createCustomer = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    // Validate required fields
    if (!name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }

    // Check if customer with same phone exists
    const existingCustomer = await User.findOne({ phone });
    if (existingCustomer) {
      return res.status(400).json({ 
        message: "Customer with this phone number already exists",
        customer: existingCustomer
      });
    }

    // Create new customer
    const customer = new User({
      name,
      phone,
      email: email || `${phone}@offline.customer`,
      address,
      role: 'customer',
      password: Math.random().toString(36).slice(-10), // Random password
      createdBy: req.user._id
    });

    await customer.save();

    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ message: "Failed to create customer" });
  }
};

module.exports = {
  searchCustomers,
  getCustomerById,
  createCustomer
}; 