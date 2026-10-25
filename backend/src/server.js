import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSeatSocket } from './sockets/seat.socket.js';

const server = http.createServer(app);

// Socket.io initialization with CORS matching Express
const io = new SocketIOServer(server, {
  cors: {
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Attach io instance to express app for use in controllers
app.set('io', io);

// Initialize real-time seat socket events
initSeatSocket(io);

// Start server and connect to MongoDB
const startServer = async () => {
  await connectDB();

  server.listen(env.PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 iMovies Backend Server running on port ${env.PORT}`);
    console.log(`📡 Health Check: http://localhost:${env.PORT}/api/health`);
    console.log(`🌐 API Gateway:  http://localhost:${env.PORT}/api`);
    console.log(`🔒 Environment:  ${env.NODE_ENV}`);
    console.log(`==================================================\n`);
  });
};

// Graceful shutdown
const shutdown = () => {
  console.log('\n[Process] Received termination signal. Closing server...');
  server.close(() => {
    console.log('[Process] HTTP and Socket.io server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

startServer();
