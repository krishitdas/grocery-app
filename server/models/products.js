/**
 * Product Model
 * Manages in-memory product data with CRUD operations.
 */

const fs = require('fs');
const path = require('path');

// Load seed data using require so Vercel trace includes it
let products = require('../data/products.json');

/**
 * Get all products, optionally filtered by category or search query.
 */
function getAll({ category, search } = {}) {
  let result = [...products];

  if (category && category !== 'All') {
    result = result.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  }

  return result;
}

/**
 * Get a single product by ID.
 */
function getById(id) {
  return products.find(p => p.id === id) || null;
}

/**
 * Get all unique categories.
 */
function getCategories() {
  const cats = [...new Set(products.map(p => p.category))];
  return cats.sort();
}

module.exports = { getAll, getById, getCategories };
