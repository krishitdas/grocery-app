/**
 * Product Routes
 * GET /api/products          - List all products (supports ?category= and ?search=)
 * GET /api/products/categories - Get unique category list
 * GET /api/products/:id      - Get single product by ID
 */

const express = require('express');
const router = express.Router();
const ProductModel = require('../models/products');

// GET all products
router.get('/', (req, res) => {
  const { category, search } = req.query;
  const products = ProductModel.getAll({ category, search });
  res.json({ success: true, count: products.length, products });
});

// GET categories (must be before /:id to avoid conflict)
router.get('/categories', (req, res) => {
  const categories = ProductModel.getCategories();
  res.json({ success: true, categories });
});

// GET single product
router.get('/:id', (req, res) => {
  const product = ProductModel.getById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, product });
});

module.exports = router;
