const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate limiting - configured based on environment
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: process.env.RATE_LIMIT_MAX || 500, // configurable via env, default 500 req/min
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  // Skip rate limiting for health checks and test endpoints
  skip: (req) => req.path === '/api/health' || req.path === '/api/test',
  // Log when rate limit is hit
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit exceeded for IP: ${req.ip} on ${req.path}`);
    res.status(429).json({ 
      error: 'Too many requests, please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Health endpoint - no rate limiting (used for monitoring)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    rateLimit: {
      max: process.env.RATE_LIMIT_MAX || 500,
      window: '1 minute'
    }
  });
});

// Test endpoint for frontend connection
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Backend API is working!',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const clientRoutes = require('./routes/clients');
const contactRoutes = require('../routes/contacts');
const remoteRoutes = require('./routes/remote');
const videoRoutes = require('./routes/video');
const assetRoutes = require('./routes/assets');
const rustdeskRoutes = require('../routes/rustdesk');

// Apply rate limiting to API routes (but not health endpoint)
app.use('/api/v1/', limiter);
app.use('/api/rustdesk/', limiter);

// Use routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/remote', remoteRoutes);
app.use('/api/v1/video', videoRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/rustdesk', rustdeskRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: {
      code: 'SERVER_ERROR',
      message: 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { details: err.message })
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`HKMSP Backend API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
