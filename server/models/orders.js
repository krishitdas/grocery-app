/**
 * Order Model
 * Manages order creation and retrieval from in-memory storage.
 */

const { v4: uuidv4 } = require('uuid');

// In-memory order storage
let orders = [];

/**
 * Create a new order from cart data.
 */
function createOrder(cartData, customerInfo) {
  const order = {
    id: uuidv4().slice(0, 8).toUpperCase(),
    items: cartData.items.map(item => ({
      productId: item.productId,
      name: item.product.name,
      image: item.product.image,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.subtotal
    })),
    totalItems: cartData.totalItems,
    totalPrice: cartData.totalPrice,
    deliveryFee: cartData.totalPrice >= 35 ? 0 : 4.99,
    grandTotal: +(cartData.totalPrice + (cartData.totalPrice >= 35 ? 0 : 4.99)).toFixed(2),
    customerInfo: {
      name: customerInfo.name || 'Guest',
      address: customerInfo.address || '',
      phone: customerInfo.phone || ''
    },
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  orders.unshift(order);
  return order;
}

/**
 * Get all orders.
 */
function getAll() {
  return orders;
}

/**
 * Get a single order by ID.
 */
function getById(id) {
  return orders.find(o => o.id === id) || null;
}

module.exports = { createOrder, getAll, getById };
