/**
 * FreshCart Grocery App - Express Server
 * Serves the API and static frontend files.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback: serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`\n  🛒  FreshCart Grocery App`);
  console.log(`  ────────────────────────`);
  console.log(`  ✅  Server running at: http://localhost:${PORT}`);
  console.log(`  📦  API available at:  http://localhost:${PORT}/api`);
  console.log(`\n  Press Ctrl+C to stop.\n`);
});
