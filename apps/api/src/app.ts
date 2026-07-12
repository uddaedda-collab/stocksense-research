import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env, isProduction } from './config/env';
import { stocksRouter } from './routes/stocks';
import { marketRouter } from './routes/market';
import { screenerRouter } from './routes/screener';
import { compareRouter } from './routes/compare';
import { calculatorsRouter } from './routes/calculators';
import { watchlistRouter } from './routes/watchlist';
import { portfolioRouter } from './routes/portfolio';
import { alertsRouter } from './routes/alerts';
import { chatbotRouter } from './routes/chatbot';
import { adminRouter } from './routes/admin';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiMonitoringMiddleware } from './services/requestLogger';

export function createApp() {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS - restricted to configured origin(s); credentials not required since
  // auth uses Bearer tokens (Firebase ID tokens) rather than cookies.
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'DELETE', 'PUT'],
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(morgan(isProduction ? 'combined' : 'dev'));
  app.use(apiMonitoringMiddleware);

  // Rate limiting - protects free-tier upstream data sources and the server
  // itself from abuse. Applies to all /api routes.
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please slow down and try again shortly.' },
  });
  app.use('/api', limiter);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/stocks', stocksRouter);
  app.use('/api/market', marketRouter);
  app.use('/api/screener', screenerRouter);
  app.use('/api/compare', compareRouter);
  app.use('/api/calculators', calculatorsRouter);
  app.use('/api/watchlist', watchlistRouter);
  app.use('/api/portfolio', portfolioRouter);
  app.use('/api/alerts', alertsRouter);
  app.use('/api/chatbot', chatbotRouter);
  app.use('/api/admin', adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
