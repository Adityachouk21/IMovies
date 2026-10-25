import { Router } from 'express';
import healthRoutes from './health.routes.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const router = Router();

// Health check endpoint
router.use('/', healthRoutes);

// Root API welcome endpoint
router.get('/', (req, res) => {
  res.json(new ApiResponse(200, {
    service: 'iMovies API Gateway',
    version: '1.0.0',
    documentation: '/api/docs',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      movies: '/api/movies',
      theaters: '/api/theaters',
      shows: '/api/shows',
      seats: '/api/shows/:showId/seats',
      bookings: '/api/bookings',
      payments: '/api/payments',
      admin: '/api/admin'
    }
  }, 'Welcome to iMovies REST API'));
});

export default router;
