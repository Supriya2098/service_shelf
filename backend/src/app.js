require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');

const { globalLimiter, authLimiter, paymentLimiter } = require('./middleware/rateLimit');
const { sanitizeInput, securityHeaders } = require('./middleware/security');
const { cache } = require('./cache');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

function createApp() {
  const app = express();

  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';

  app.use(compression());
  app.use(securityHeaders);
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || origin === allowedOrigin) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));
  app.use(express.json({ limit: '10kb' }));
  app.use(sanitizeInput);

  if (process.env.NODE_ENV !== 'test') {
    app.use(globalLimiter);
  }

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      platform: 'SERVICE SHELF',
      version: '1.0.0',
      cache: cache.stats(),
    });
  });

  if (process.env.NODE_ENV !== 'test') {
    app.use('/api/auth', authLimiter, authRoutes);
    app.use('/api/payments', paymentLimiter, paymentRoutes);
  } else {
    app.use('/api/auth', authRoutes);
    app.use('/api/payments', paymentRoutes);
  }
  app.use('/api/users', userRoutes);
  app.use('/api/services', serviceRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/admin', adminRoutes);

  app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
      return res.status(403).json({ error: 'CORS policy violation' });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}

module.exports = { createApp };
