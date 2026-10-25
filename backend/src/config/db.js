import mongoose from 'mongoose';
import { env } from './env.js';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) {
    console.log('[Database] Using existing MongoDB connection.');
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s if server unreachable
      autoIndex: true
    });

    isConnected = conn.connection.readyState === 1;
    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[Database Error]', err.message);
      isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB connection disconnected.');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database] MongoDB reconnected.');
      isConnected = true;
    });
  } catch (error) {
    console.error(`[Database Warning] Could not connect to MongoDB at ${env.MONGODB_URI}`);
    console.error(`Reason: ${error.message}`);
    console.info(`[Database Info] Server continues running. Set valid MONGODB_URI (e.g. MongoDB Atlas) in backend/.env`);
    isConnected = false;
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
  return {
    state: states[stateCode] || 'unknown',
    code: stateCode,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null
  };
};
