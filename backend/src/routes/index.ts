import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './authRoutes';
import profileRoutes from './profileRoutes';
import jobRoutes from './jobRoutes';
import applicationRoutes from './applicationRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.get('/health', (_req, res) => {
  const readyState = mongoose.connection.readyState;
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(readyState === 1 ? 200 : 503).json({
    success: readyState === 1,
    status: readyState === 1 ? 'healthy' : 'degraded',
    database: {
      name: mongoose.connection.name || 'jobs_territory_portal',
      state: states[readyState] || 'unknown',
    },
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/admin', adminRoutes);

export default router;

