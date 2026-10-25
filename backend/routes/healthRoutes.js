import { Router } from 'express';
import { getDBStatus } from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  
  const healthData = {
    status: dbStatus.status === 'connected' ? 'healthy' : 'degraded',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: {
      status: dbStatus.status,
      host: dbStatus.host,
      name: dbStatus.name
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
    }
  };

  return res.status(200).json(new ApiResponse(200, healthData, 'iMovies Service Status'));
});

export default router;
