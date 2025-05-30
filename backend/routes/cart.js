const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const auth = require('../middleware/auth');

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.json({ items: [], total: 0 });
    }
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const {
      productId,
      productName,
      productImage,
      quantity,
      color,
      material,
      sizeBreakdown,
      customDesign,
      notes,
      basePrice,
      dozenPrice,
      priceDetails
    } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({
        user: req.user.id,
        items: []
      });
    }

    // Validate required fields
    if (!productId || !quantity || !color || !material || !sizeBreakdown || !basePrice || !dozenPrice) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newItem = {
      product: productId,
      productName,
      productImage,
      quantity,
      color,
      material,
      sizeBreakdown,
      customDesign,
      notes,
      basePrice,
      dozenPrice,
      priceDetails
    };

    cart.items.push(newItem);
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update item quantity
router.put('/update/:itemId', auth, async (req, res) => {
  try {
    const { quantity, sizeBreakdown } = req.body;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === req.params.itemId);
    if (itemIndex > -1) {
      if (quantity) cart.items[itemIndex].quantity = quantity;
      if (sizeBreakdown) cart.items[itemIndex].sizeBreakdown = sizeBreakdown;
      
      // Recalculate price details
      const item = cart.items[itemIndex];
      const totalQuantity = item.sizeBreakdown.reduce((sum, size) => sum + size.quantity, 0);
      const hasDozenPrice = item.dozenPrice && totalQuantity >= 12;
      const totalDozens = Math.floor(totalQuantity / 12);
      const remainingUnits = totalQuantity % 12;
      
      let itemTotal = 0;
      if (hasDozenPrice) {
        itemTotal += totalDozens * item.dozenPrice * 12;
        itemTotal += remainingUnits * item.basePrice;
      } else {
        itemTotal = totalQuantity * item.basePrice;
      }
      
      // Add material additional price
      itemTotal += (item.material.additionalPrice || 0) * totalQuantity;
      
      // Add size additional prices
      item.sizeBreakdown.forEach(size => {
        itemTotal += (size.additionalPrice || 0) * size.quantity;
      });
      
      // Add custom design fee if exists
      if (item.customDesign) {
        itemTotal += (item.customDesign.customizationFee || 0) * totalQuantity;
      }
      
      cart.items[itemIndex].priceDetails = {
        total: itemTotal,
        basePrice: item.basePrice,
        dozenPrice: item.dozenPrice,
        totalQuantity,
        hasDozenPrice,
        totalDozens,
        remainingUnits
      };
      
      await cart.save();
      res.json(cart);
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 