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

// Enable trust proxy for secure cookies and rate-limiting behind Render/Vercel/Cloudflare reverse proxies
app.set('trust proxy', 1);

// Configuration constants
const PORT = parseInt(process.env.PORT || '5000', 10);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Parse and normalize configured allowed origins (strip trailing slashes, handle comma-separated values)
const parseAllowedOrigins = () => {
  const customOrigins = (CLIENT_URL || '')
    .split(',')
    .map(url => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

  return Array.from(new Set([
    ...customOrigins,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000'
  ]));
};

const allowedOrigins = parseAllowedOrigins();

const isOriginAllowed = (origin) => {
  // Allow requests with no origin (curl, mobile apps, Postman, server-to-server)
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, '');

  // Exact match from allowed list
  if (allowedOrigins.includes(normalizedOrigin)) return true;

  // Allow Vercel and Render cloud deployments (*.vercel.app, *.onrender.com)
  if (
    /^https?:\/\/([a-zA-Z0-9-]+\.)*vercel\.app$/.test(normalizedOrigin) ||
    /^https?:\/\/([a-zA-Z0-9-]+\.)*onrender\.com$/.test(normalizedOrigin)
  ) {
    return true;
  }

  // In development, allow localhost, 127.0.0.1, and local private network IPs
  if (NODE_ENV !== 'production') {
    if (
      /^https?:\/\/localhost(:\d+)?$/.test(normalizedOrigin) ||
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(normalizedOrigin) ||
      /^https?:\/\/192\.168\.\d+\.\d+(:\d+)?$/.test(normalizedOrigin) ||
      /^https?:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/.test(normalizedOrigin) ||
      /^https?:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(:\d+)?$/.test(normalizedOrigin)
    ) {
      return true;
    }
  }

  return false;
};

// Socket.io initialization
const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
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
const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
