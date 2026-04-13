/**
 * Cart Model
 * Manages in-memory shopping cart with add, update, remove, and clear operations.
 */

const ProductModel = require('./products');

// In-memory cart storage: { items: [{ productId, quantity, product }] }
let cart = { items: [] };

/**
 * Get the current cart with computed totals.
 */
function getCart() {
  const items = cart.items.map(item => {
    const product = ProductModel.getById(item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      product: product,
      subtotal: product ? +(product.price * item.quantity).toFixed(2) : 0
    };
  }).filter(item => item.product !== null);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = +items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2);

  return { items, totalItems, totalPrice };
}

/**
 * Add a product to the cart. If already exists, increment quantity.
 */
function addItem(productId, quantity = 1) {
  const product = ProductModel.getById(productId);
  if (!product) {
    return { success: false, message: 'Product not found' };
  }
  if (!product.inStock) {
    return { success: false, message: 'Product is out of stock' };
  }

  const existing = cart.items.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ productId, quantity });
  }

  return { success: true, cart: getCart() };
}

/**
 * Update the quantity of an item in the cart.
 */
function updateItem(productId, quantity) {
  const itemIndex = cart.items.findIndex(item => item.productId === productId);
  if (itemIndex === -1) {
    return { success: false, message: 'Item not in cart' };
  }

  if (quantity <= 0) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity = quantity;
  }

  return { success: true, cart: getCart() };
}

/**
 * Remove an item from the cart entirely.
 */
function removeItem(productId) {
  const itemIndex = cart.items.findIndex(item => item.productId === productId);
  if (itemIndex === -1) {
    return { success: false, message: 'Item not in cart' };
  }

  cart.items.splice(itemIndex, 1);
  return { success: true, cart: getCart() };
}

/**
 * Clear all items from the cart.
 */
function clearCart() {
  cart.items = [];
  return { success: true, cart: getCart() };
}

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
