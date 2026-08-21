import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/authenticate';
import { env } from './config/env';

import authRoutes from './modules/auth/authRoutes';
import orderRoutes from './modules/orders/orderRoutes';
import analyticsRoutes from './modules/analytics/analyticsRoutes';
import archiveRoutes from './modules/archive/archiveRoutes';
import storeRoutes from './modules/stores/storeRoutes';
import productRoutes from './modules/products/productRoutes';

const app = express();

// CORS — must allow Authorization header for JWT
const allowedOrigins = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(',') : ['http://localhost:3000'];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

// Health check — public
app.get('/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// ── Public routes (no auth required) ────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ── Protected routes (valid JWT required) ───────────────────────────────────
app.use('/api/orders', authenticate, orderRoutes);
app.use('/api/products', productRoutes);

// Analytics & Archive
app.use('/api/stores', storeRoutes);
app.use('/api/analytics', authenticate, analyticsRoutes);
app.use('/api/archive', authenticate, archiveRoutes);

app.use(errorHandler);

export { app };
