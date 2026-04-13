/**
 * FreshCart API Client
 * Handles all HTTP requests to the backend.
 */

const API_BASE = '/api';

const api = {
  // ─── Products ───
  async getProducts(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${API_BASE}/products?${query}` : `${API_BASE}/products`;
    const res = await fetch(url);
    return res.json();
  },

  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`);
    return res.json();
  },

  async getCategories() {
    const res = await fetch(`${API_BASE}/products/categories`);
    return res.json();
  },

  // ─── Cart ───
  async getCart() {
    const res = await fetch(`${API_BASE}/cart`);
    return res.json();
  },

  async addToCart(productId, quantity = 1) {
    const res = await fetch(`${API_BASE}/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });
    return res.json();
  },

  async updateCartItem(productId, quantity) {
    const res = await fetch(`${API_BASE}/cart/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });
    return res.json();
  },

  async removeFromCart(productId) {
    const res = await fetch(`${API_BASE}/cart/remove/${productId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async clearCart() {
    const res = await fetch(`${API_BASE}/cart/clear`, {
      method: 'DELETE'
    });
    return res.json();
  },

  // ─── Orders ───
  async placeOrder(customerInfo) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerInfo)
    });
    return res.json();
  },

  async getOrders() {
    const res = await fetch(`${API_BASE}/orders`);
    return res.json();
  },

  async getOrder(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`);
    return res.json();
  }
};
