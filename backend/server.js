import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Server as SocketIOServer } from 'socket.io';

// Load environment variables before anything else
dotenv.config();

import { connectDB } from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { notFound } from './middleware/notFoundMiddleware.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import theaterRoutes from './routes/theaterRoutes.js';
import showRoutes from './routes/showRoutes.js';
import seatRoutes from './routes/seatRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

import { ApiResponse } from './utils/ApiResponse.js';

const app = express();
const server = http.createServer(app);

// Configuration constants
const PORT = parseInt(process.env.PORT || '5000', 10);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Socket.io initialization
const io = new SocketIOServer(server, {
  cors: {
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST']
  }
});
app.set('io', io);

// Real-Time Socket Connection & Room Management
io.on('connection', (socket) => {
  // Join show-specific room for real-time seat sync
  socket.on('join_show', ({ showId }) => {
    if (showId) {
      socket.join(`show_${showId}`);
    }
  });

  socket.on('leave_show', ({ showId }) => {
    if (showId) {
      socket.leave(`show_${showId}`);
    }
  });
});

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
const allowedOrigins = [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body & Cookie Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Development Logger
if (NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Mount REST API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/theaters', theaterRoutes);
app.use('/api/shows', seatRoutes); // Mount seat routes with /:showId/seats & /:showId/seat-locks
app.use('/api/shows', showRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/bookings', bookingRoutes);

// Welcome & Documentation Gateway Route
app.get('/api', (req, res) => {
  res.json(new ApiResponse(200, {
    application: 'iMovies Ticket Booking API',
    version: '1.0.0',
    phase: 'Phase 7: Real-Time Seat Selection, Digital Bookings & Admin Operations',
    routes: {
      health: '/api/health',
      auth: '/api/auth',
      movies: '/api/movies',
      theaters: '/api/theaters',
      shows: '/api/shows',
      seats: {
        map: 'GET /api/shows/:showId/seats',
        lock: 'POST /api/shows/:showId/seat-locks',
        release: 'DELETE /api/shows/:showId/seat-locks'
      },
      bookings: {
        create: 'POST /api/bookings',
        my: 'GET /api/bookings/my',
        detail: 'GET /api/bookings/:id',
        cancel: 'POST /api/bookings/:id/cancel'
      },
      reviews: '/api/reviews'
    }
  }, 'iMovies API Gateway is Operational'));
});

// Root Redirect to API
app.get('/', (req, res) => {
  res.redirect('/api');
});

// 404 & Centralized Error Handlers
app.use(notFound);
app.use(errorHandler);

// Start Server after attempting MongoDB Connection
const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.error(`[Startup Notice] MongoDB startup check: ${error.message}`);
  }

  server.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🎬 iMovies Backend Server running on port ${PORT}`);
    console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`🎟️ Seat Engine:  http://localhost:${PORT}/api/shows/:showId/seats`);
    console.log(`🔒 Environment:  ${NODE_ENV}`);
    console.log(`======================================================\n`);
  });
};

// Graceful Shutdown
const gracefulShutdown = () => {
  console.log('\n[Process] Graceful shutdown initiated. Closing servers...');
  server.close(() => {
    console.log('[Process] HTTP and Socket.io servers closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

startServer();

export { app, server, io };
