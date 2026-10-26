import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import ridesRoutes from './routes/rides.routes';
import bookingsRoutes from './routes/bookings.routes';
import matchingRoutes from './routes/matching.routes';
import safetyRoutes from './routes/safety.routes';
import notificationsRoutes from './routes/notifications.routes';
import adminRoutes from './routes/admin.routes';
import { dataStoreManager } from './services/dataStore';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health & System Info
app.get('/api/health', async (_req: Request, res: Response) => {
  const store = await dataStoreManager.getStore();
  res.json({
    status: 'healthy',
    name: 'SAFAR AI API',
    tagline: 'Your Route. Your People. Your Journey.',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: {
      connected: !store.isDemoMode,
      mode: store.isDemoMode ? 'demo' : 'postgresql',
      notice: store.isDemoMode
        ? 'Demo Mode: Fictional sample data'
        : 'Production Mode: Connected to PostgreSQL',
    },
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/admin', adminRoutes);

import path from 'path';
import fs from 'fs';

// 404 Handler for undefined API routes
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint Not Found',
    message: `API route ${req.method} ${req.originalUrl} does not exist.`,
  });
});

// Serve frontend single-page application from client/dist if built
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[SAFAR AI]: Serving frontend client bundle from ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // Catch-all route for React client routing (e.g. /rides, /track/:ref, /trips/:id)
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[SAFAR AI Server Error]:', err);
  res.status(err.status || 500).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected server error occurred.',
  });
});

// Initialize database store and start server
async function startServer() {
  try {
    const store = await dataStoreManager.getStore();
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 SAFAR AI API Server running on http://localhost:${PORT}`);
      console.log(`🧭 Tagline: "Your Route. Your People. Your Journey."`);
      console.log(`📊 Mode: ${store.isDemoMode ? 'DEMO MODE (Fictional sample data)' : 'REAL POSTGRESQL'}`);
      console.log(`====================================================`);
    });
  } catch (err: any) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
