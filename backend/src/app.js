import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { requireAuth } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/error.js';
import authRoutes from './modules/auth/routes.js';
import chatRoutes from './modules/chat/routes.js';
import aiRoutes from './modules/ai/routes.js';
import paymentRoutes from './modules/payment/routes.js';
import campaignRoutes from './modules/campaign/routes.js';
import workflowRoutes from './modules/workflow/routes.js';
import analyticsRoutes from './modules/analytics/routes.js';
import whatsappRoutes from './modules/whatsapp/routes.js';
import crmRoutes from './modules/crm/routes.js';
import ticketRoutes from './modules/tickets/routes.js';
import { env } from './config/env.js';

export function createApp(io) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.frontendUrl === '*' ? true : env.frontendUrl }));
  app.use(express.json({ limit: '2mb' }));
  app.use(morgan('dev'));

  app.use((req, _res, next) => {
    req.io = io;
    next();
  });

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/auth', authRoutes);
  app.use('/whatsapp', whatsappRoutes);

  app.use(requireAuth);
  app.use('/chat', chatRoutes);
  app.use('/ai', aiRoutes);
  app.use('/payment', paymentRoutes);
  app.use('/campaign', campaignRoutes);
  app.use('/workflow', workflowRoutes);
  app.use('/analytics', analyticsRoutes);
  app.use('/crm', crmRoutes);
  app.use('/tickets', ticketRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
