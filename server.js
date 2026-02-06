require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Import routes
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const campaignRoutes = require('./routes/campaigns');
const automationRoutes = require('./routes/automation');
const analyticsRoutes = require('./routes/analytics');
const userRoutes = require('./routes/user');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/user', userRoutes);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: 'Route not found' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════╗
  ║                                        ║
  ║   🚀 xlomxe Server Running!           ║
  ║                                        ║
  ║   Server: http://localhost:${PORT}      ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
  ║                                        ║
  ╚════════════════════════════════════════╝
  `);
});

module.exports = app;
