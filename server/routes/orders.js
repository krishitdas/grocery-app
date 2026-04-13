/**
 * Order Routes
 * POST /api/orders      - Place a new order from current cart
 * GET  /api/orders      - List all orders
 * GET  /api/orders/:id  - Get single order by ID
 */

const express = require('express');
const router = express.Router();
const OrderModel = require('../models/orders');
const CartModel = require('../models/cart');

// POST place order
router.post('/', (req, res) => {
  const cart = CartModel.getCart();

  if (cart.items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  const { name, address, phone } = req.body;
  if (!name || !address) {
    return res.status(400).json({ success: false, message: 'Name and address are required' });
  }

  const order = OrderModel.createOrder(cart, { name, address, phone });

  // Clear the cart after successful order
  CartModel.clearCart();

  res.status(201).json({ success: true, order });
});

// GET all orders
router.get('/', (req, res) => {
  const orders = OrderModel.getAll();
  res.json({ success: true, count: orders.length, orders });
});

// GET single order
router.get('/:id', (req, res) => {
  const order = OrderModel.getById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  res.json({ success: true, order });
});

module.exports = router;
