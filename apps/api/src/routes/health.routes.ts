import { Router } from 'express';
import { isDBConnected } from '../config/database';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: isDBConnected() ? 'connected' : 'disconnected',
  });
});

export default router;
