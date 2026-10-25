import mongoose from 'mongoose';
import { seedInitialData } from '../services/dbSeeder.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('[Database] Using active MongoDB connection.');
    return mongoose.connection;
  }

  const rawURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';
  const mongoURI = rawURI.trim();
  const isAtlas = mongoURI.startsWith('mongodb+srv://');

  // Mask password for safe console logging
  const maskedURI = mongoURI.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');

  console.log(`[Database] Connecting to ${isAtlas ? 'MongoDB Atlas (Cloud)' : 'MongoDB'}: ${maskedURI}`);

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: isAtlas ? 12000 : 5000,
      autoIndex: true,
      maxPoolSize: 10
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`✅ [Database] MongoDB Connected Successfully: ${conn.connection.host}/${conn.connection.name}`);

    // Set up connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('[Database Error]', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB connection disconnected.');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 [Database] MongoDB reconnected successfully.');
      isConnected = true;
    });

    // Auto-seed initial catalog in background if database collections are empty
    seedInitialData({ force: false }).catch((err) => {
      console.warn('[Database] Auto-seed background notice:', err.message);
    });

    return conn.connection;
  } catch (error) {
    console.error(`\n⚠️ [Database Warning] Could not establish MongoDB connection.`);
    console.error(`Target: ${maskedURI}`);
    console.error(`Reason: ${error.message}`);

    if (isAtlas) {
      console.info(`\n💡 Atlas Tip: Please check:`);
      console.info(`   1. Atlas Network Access: Whitelist current IP or add 0.0.0.0/0 at cloud.mongodb.com`);
      console.info(`   2. Atlas Database Access: Verify username & password in backend/.env`);
    } else {
      console.info(`💡 Please configure your MongoDB Atlas URI in backend/.env under MONGODB_URI`);
    }

    console.info(`ℹ️ [Database Notice] Backend server will continue running with high-performance in-memory fallback.\n`);
    isConnected = false;

    if (process.env.NODE_ENV === 'production' && process.env.STRICT_DB === 'true') {
      throw error;
    }
  }
};

export const getDBStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const stateCode = mongoose.connection.readyState;
  const rawURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';
  const isAtlas = rawURI.trim().startsWith('mongodb+srv://');

  return {
    status: states[stateCode] || 'unknown',
    readyState: stateCode,
    isAtlas,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};
