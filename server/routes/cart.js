/**
 * Cart Routes
 * GET    /api/cart              - Get current cart
 * POST   /api/cart/add          - Add item to cart  { productId, quantity }
 * PUT    /api/cart/update        - Update item qty   { productId, quantity }
 * DELETE /api/cart/remove/:id   - Remove item from cart
 * DELETE /api/cart/clear        - Clear entire cart
 */

const express = require('express');
const router = express.Router();
const CartModel = require('../models/cart');

// GET cart
router.get('/', (req, res) => {
  const cart = CartModel.getCart();
  res.json({ success: true, cart });
});

// POST add item
router.post('/add', (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId) {
    return res.status(400).json({ success: false, message: 'productId is required' });
  }
  const result = CartModel.addItem(productId, quantity || 1);
  if (!result.success) {
    return res.status(400).json(result);
  }
  res.json(result);
});

// PUT update item quantity
router.put('/update', (req, res) => {
  const { productId, quantity } = req.body;
  if (!productId || quantity === undefined) {
    return res.status(400).json({ success: false, message: 'productId and quantity are required' });
  }
  const result = CartModel.updateItem(productId, quantity);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// DELETE remove item
router.delete('/remove/:id', (req, res) => {
  const result = CartModel.removeItem(req.params.id);
  if (!result.success) {
    return res.status(404).json(result);
  }
  res.json(result);
});

// DELETE clear cart
router.delete('/clear', (req, res) => {
  const result = CartModel.clearCart();
  res.json(result);
});

module.exports = router;
