/**
 * FreshCart Main Application Logic
 * Handles UI rendering, user interactions, and state management.
 */

// ═══════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════
let currentCategory = 'All';
let cartOpen = false;
let currentCart = { items: [], totalItems: 0, totalPrice: 0 };

// ═══════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadProducts();
  loadCart();
  setupSearch();
  setupScrollHeader();
});

// ─── Header scroll effect ───
function setupScrollHeader() {
  const header = document.getElementById('main-header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}

// ─── Search debounce ───
function setupSearch() {
  const input = document.getElementById('search-input');
  let timeout;
  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      loadProducts({ search: input.value.trim() });
    }, 300);
  });
}

// ═══════════════════════════════════════════
// CATEGORIES
// ═══════════════════════════════════════════
const categoryEmojis = {
  'Fruits & Vegetables': '🥗',
  'Dairy & Eggs': '🧈',
  'Bakery': '🥖',
  'Beverages': '☕',
  'Snacks': '🍿',
  'Meat & Seafood': '🥩',
  'Pantry': '🏺'
};

async function loadCategories() {
  const data = await api.getCategories();
  if (!data.success) return;

  const bar = document.querySelector('.category-bar-inner');
  data.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-chip';
    btn.dataset.category = cat;
    btn.id = `cat-${cat.replace(/[^a-zA-Z]/g, '').toLowerCase()}`;
    btn.onclick = () => filterCategory(cat, btn);
    btn.innerHTML = `<span>${categoryEmojis[cat] || '📦'}</span> ${cat}`;
    bar.appendChild(btn);
  });
}

function filterCategory(category, btnEl) {
  currentCategory = category;

  // Update active chip
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  // Update title
  document.getElementById('products-title').textContent =
    category === 'All' ? 'All Products' : category;

  // Reload products
  const search = document.getElementById('search-input').value.trim();
  loadProducts({ category, search });
}

// ═══════════════════════════════════════════
// PRODUCTS
// ═══════════════════════════════════════════
async function loadProducts(params = {}) {
  if (currentCategory !== 'All' && !params.category) {
    params.category = currentCategory;
  }

  const grid = document.getElementById('products-grid');
  const empty = document.getElementById('products-empty');
  const count = document.getElementById('products-count');

  // Show skeletons
  grid.innerHTML = Array(8).fill('<div class="skeleton skeleton-card"></div>').join('');

  try {
    const data = await api.getProducts(params);
    if (!data || !data.success) {
      grid.innerHTML = '<div class="products-empty" style="display:block"><h3>Failed to load products</h3></div>';
      return;
    }

    count.textContent = `${data.count} items`;

    if (data.products.length === 0) {
      grid.innerHTML = '';
      empty.style.display = 'block';
      return;
    }

    empty.style.display = 'none';
    grid.innerHTML = data.products.map(product => renderProductCard(product)).join('');
  } catch (error) {
    console.error("Error loading products:", error);
    grid.innerHTML = '<div class="products-empty" style="display:block; grid-column: 1 / -1; text-align: center;"><h3>Failed to load products.</h3><p>Server may be offline or misconfigured.</p></div>';
  }
}

function renderProductCard(p) {
  const stars = renderStars(p.rating);
  return `
    <div class="product-card ${!p.inStock ? 'out-of-stock' : ''}" id="product-${p.id}">
      <div class="product-image-wrap">
        <img src="${p.image}" alt="${p.name}" class="product-image" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
        <div class="product-emoji-fallback">${p.emoji}</div>
        ${!p.inStock ? '<span class="product-out-badge">Out of Stock</span>' : ''}
      </div>
      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3 class="product-name">${p.name}</h3>
        <p class="product-desc">${p.description}</p>
        <div class="product-rating">
          ${stars}
          <span class="rating-value">${p.rating}</span>
        </div>
        <div class="product-footer">
          <div class="product-price-group">
            <span class="product-price">$${p.price.toFixed(2)}</span>
            <span class="product-unit">${p.unit}</span>
          </div>
          <button class="btn-add-cart" id="add-${p.id}"
                  onclick="addToCart('${p.id}')"
                  ${!p.inStock ? 'disabled' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderStars(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      html += '<span class="star">★</span>';
    } else if (i - 0.5 <= rating) {
      html += '<span class="star">★</span>';
    } else {
      html += '<span class="star empty">★</span>';
    }
  }
  return html;
}

// ═══════════════════════════════════════════
// CART
// ═══════════════════════════════════════════
async function loadCart() {
  const data = await api.getCart();
  if (data.success) {
    currentCart = data.cart;
    renderCart();
  }
}

function renderCart() {
  const badge = document.getElementById('cart-badge');
  const itemsContainer = document.getElementById('cart-items');
  const emptyEl = document.getElementById('cart-empty');
  const footerEl = document.getElementById('cart-footer');
  const subtotalEl = document.getElementById('cart-subtotal');
  const deliveryEl = document.getElementById('cart-delivery');
  const totalEl = document.getElementById('cart-total');
  const hintEl = document.getElementById('free-delivery-hint');
  const remainingEl = document.getElementById('free-delivery-remaining');

  // Badge
  badge.textContent = currentCart.totalItems;
  badge.classList.add('bounce');
  setTimeout(() => badge.classList.remove('bounce'), 400);

  if (currentCart.items.length === 0) {
    itemsContainer.style.display = 'none';
    emptyEl.style.display = 'flex';
    footerEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  itemsContainer.style.display = 'flex';
  footerEl.style.display = 'block';

  // Render items
  itemsContainer.innerHTML = currentCart.items.map(item => `
    <div class="cart-item" id="cart-item-${item.productId}">
      <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image" loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <span class="cart-item-emoji" style="display:none">${item.product.emoji}</span>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.product.name}</div>
        <div class="cart-item-price">$${item.product.price.toFixed(2)} ${item.product.unit}</div>
        <div class="cart-item-controls">
          <button class="qty-btn" onclick="updateQty('${item.productId}', ${item.quantity - 1})">−</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" onclick="updateQty('${item.productId}', ${item.quantity + 1})">+</button>
        </div>
      </div>
      <span class="cart-item-subtotal">$${item.subtotal.toFixed(2)}</span>
      <button class="cart-item-remove" onclick="removeItem('${item.productId}')" title="Remove">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `).join('');

  // Totals
  const deliveryFee = currentCart.totalPrice >= 35 ? 0 : 4.99;
  const total = (currentCart.totalPrice + deliveryFee).toFixed(2);

  subtotalEl.textContent = `$${currentCart.totalPrice.toFixed(2)}`;
  deliveryEl.textContent = deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`;
  deliveryEl.style.color = deliveryFee === 0 ? 'var(--primary-600)' : '';
  deliveryEl.style.fontWeight = deliveryFee === 0 ? '700' : '';
  totalEl.textContent = `$${total}`;

  if (currentCart.totalPrice >= 35) {
    hintEl.classList.add('hidden');
  } else {
    hintEl.classList.remove('hidden');
    remainingEl.textContent = `$${(35 - currentCart.totalPrice).toFixed(2)}`;
  }
}

async function addToCart(productId) {
  const btn = document.getElementById(`add-${productId}`);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" width="16" height="16"><polyline points="20 6 9 17 4 12"/></svg> <span>Added!</span>`;
  }

  const data = await api.addToCart(productId);
  if (data.success) {
    currentCart = data.cart;
    renderCart();
    showToast('✅', 'Added to cart!');
  } else {
    showToast('⚠️', data.message || 'Failed to add');
  }

  // Reset button after delay
  setTimeout(() => {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> <span>Add</span>`;
    }
  }, 1200);
}

async function updateQty(productId, quantity) {
  if (quantity <= 0) {
    return removeItem(productId);
  }
  const data = await api.updateCartItem(productId, quantity);
  if (data.success) {
    currentCart = data.cart;
    renderCart();
  }
}

async function removeItem(productId) {
  const data = await api.removeFromCart(productId);
  if (data.success) {
    currentCart = data.cart;
    renderCart();
    showToast('🗑️', 'Removed from cart');
  }
}

function toggleCart() {
  cartOpen = !cartOpen;
  document.getElementById('cart-drawer').classList.toggle('open', cartOpen);
  document.getElementById('cart-overlay').classList.toggle('open', cartOpen);
  document.body.style.overflow = cartOpen ? 'hidden' : '';
}

// ═══════════════════════════════════════════
// CHECKOUT
// ═══════════════════════════════════════════
function showCheckout() {
  // Close cart drawer first
  if (cartOpen) toggleCart();

  // Build summary
  const summary = document.getElementById('checkout-summary');
  const deliveryFee = currentCart.totalPrice >= 35 ? 0 : 4.99;
  const grandTotal = (currentCart.totalPrice + deliveryFee).toFixed(2);

  summary.innerHTML = `
    ${currentCart.items.map(item => `
      <div class="checkout-summary-item">
        <span class="item-name"><img src="${item.product.image}" alt="${item.product.name}" class="checkout-item-image" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='inline';"><span class="checkout-item-emoji" style="display:none">${item.product.emoji}</span> ${item.product.name} × ${item.quantity}</span>
        <span>$${item.subtotal.toFixed(2)}</span>
      </div>
    `).join('')}
    <div class="checkout-summary-item" style="color: ${deliveryFee === 0 ? 'var(--primary-600)' : ''}">
      <span>🚚 Delivery</span>
      <span>${deliveryFee === 0 ? 'FREE' : '$' + deliveryFee.toFixed(2)}</span>
    </div>
    <div class="checkout-summary-total">
      <span>Total</span>
      <span>$${grandTotal}</span>
    </div>
  `;

  openModal('checkout');
}

function closeCheckout() {
  closeModal('checkout');
}

async function placeOrder(e) {
  e.preventDefault();

  const btn = document.getElementById('place-order-btn');
  btn.disabled = true;
  btn.innerHTML = `<span>Placing Order...</span>`;

  const customerInfo = {
    name: document.getElementById('customer-name').value,
    address: document.getElementById('customer-address').value,
    phone: document.getElementById('customer-phone').value
  };

  const data = await api.placeOrder(customerInfo);

  if (data.success) {
    closeModal('checkout');
    currentCart = { items: [], totalItems: 0, totalPrice: 0 };
    renderCart();
    showConfirmation(data.order);

    // Reset form
    document.getElementById('checkout-form').reset();
  } else {
    showToast('⚠️', data.message || 'Order failed');
  }

  btn.disabled = false;
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Place Order`;
}

function showConfirmation(order) {
  const content = document.getElementById('confirmation-content');
  content.innerHTML = `
    <div class="confirmation-icon">✅</div>
    <h2>Order Placed!</h2>
    <p>Your groceries are on the way.</p>
    <div class="confirmation-order-id">Order #${order.id}</div>
    <div class="confirmation-details">
      ${order.items.map(item => `
        <div class="detail-row">
          <span><img src="${item.image}" alt="${item.name}" class="confirmation-item-image" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='inline';"><span class="confirmation-item-emoji" style="display:none">${item.emoji}</span> ${item.name} × ${item.quantity}</span>
          <span>$${item.subtotal.toFixed(2)}</span>
        </div>
      `).join('')}
      <div class="detail-row">
        <span>🚚 Delivery</span>
        <span>${order.deliveryFee === 0 ? 'FREE' : '$' + order.deliveryFee.toFixed(2)}</span>
      </div>
      <div class="detail-row detail-total">
        <span>Grand Total</span>
        <span>$${order.grandTotal.toFixed(2)}</span>
      </div>
    </div>
    <p style="font-size: 13px; color: var(--gray-400); margin-bottom: 20px;">
      📍 Delivering to: ${order.customerInfo.name}, ${order.customerInfo.address}
    </p>
    <button class="btn-continue-shopping" onclick="closeConfirmation()">
      Continue Shopping
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </button>
  `;
  openModal('confirmation');
}

function closeConfirmation() {
  closeModal('confirmation');
}

// ═══════════════════════════════════════════
// ORDERS
// ═══════════════════════════════════════════
async function showOrders() {
  const list = document.getElementById('orders-list');
  list.innerHTML = '<div class="skeleton" style="height:120px;margin-bottom:12px;"></div>'.repeat(2);

  openModal('orders');

  const data = await api.getOrders();
  if (!data.success) return;

  if (data.orders.length === 0) {
    list.innerHTML = `
      <div class="orders-empty">
        <span class="empty-emoji">📋</span>
        <h3>No orders yet</h3>
        <p>Your order history will appear here.</p>
      </div>
    `;
    return;
  }

  list.innerHTML = data.orders.map(order => `
    <div class="order-card">
      <div class="order-card-header">
        <span class="order-id">Order #${order.id}</span>
        <span class="order-status">${order.status}</span>
      </div>
      <div class="order-items-list">
        ${order.items.map(item => `
          <span class="order-item-tag"><img src="${item.image}" alt="${item.name}" class="order-item-image" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='inline';"><span class="order-item-emoji" style="display:none">${item.emoji}</span> ${item.name} × ${item.quantity}</span>
        `).join('')}
      </div>
      <div class="order-card-footer">
        <span>${new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        <span class="order-total">$${order.grandTotal.toFixed(2)}</span>
      </div>
    </div>
  `).join('');
}

function closeOrders() {
  closeModal('orders');
}

// ═══════════════════════════════════════════
// MODALS (generic open/close)
// ═══════════════════════════════════════════
function openModal(name) {
  document.getElementById(`${name}-overlay`).classList.add('open');
  document.getElementById(`${name}-modal`).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(name) {
  document.getElementById(`${name}-overlay`).classList.remove('open');
  document.getElementById(`${name}-modal`).classList.remove('open');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════════
function showToast(icon, message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span> ${message}`;
  container.appendChild(toast);

  // Remove after animation completes
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 3000);
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
function goHome() {
  // Reset to home
  document.getElementById('search-input').value = '';
  currentCategory = 'All';
  document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
  document.getElementById('cat-all').classList.add('active');
  document.getElementById('products-title').textContent = 'All Products';
  loadProducts();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
