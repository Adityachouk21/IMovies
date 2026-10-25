import { Router } from 'express';
import { getDBStatus } from '../config/db.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

router.get('/health', (req, res) => {
  const dbStatus = getDBStatus();
  
  const healthData = {
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: {
      status: dbStatus.state,
      host: dbStatus.host,
      database: dbStatus.name
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsageMB: Math.round(process.memoryUsage().rss / 1024 / 1024)
    }
  };

  const statusCode = dbStatus.state === 'connected' ? 200 : 200; // Return 200 with DB status payload
  return res.status(statusCode).json(new ApiResponse(statusCode, healthData, 'iMovies Service is running'));
});

export default router;
