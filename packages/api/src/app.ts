import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getPoolStats } from './db/index.js';
import {
  requestIdMiddleware,
  errorHandler,
  notFoundHandler,
} from './middleware/index.js';

const app = express();

// Request ID middleware (must be first to track all requests)
app.use(requestIdMiddleware);

// Security and parsing middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint (includes database pool stats)
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: getPoolStats(),
  });
});

// API routes placeholder
app.get('/api', (_req, res) => {
  res.json({ message: 'Sage API v0.1.0' });
});

// 404 handler for unmatched routes (after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export { app };
