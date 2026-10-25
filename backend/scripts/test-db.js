import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { Movie } from '../models/Movie.js';
import { Theater } from '../models/Theater.js';
import { Screen } from '../models/Screen.js';
import { Seat } from '../models/Seat.js';
import { Show } from '../models/Show.js';
import { Booking } from '../models/Booking.js';
import { User } from '../models/User.js';

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';

// Mask password in URI for safe display
const maskedURI = mongoURI.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/, '$1******$3');

async function testConnection() {
  console.log('\n======================================================');
  console.log('🔍 iMovies Database Connection Diagnostics');
  console.log('======================================================');
  console.log(`Target URI:    ${maskedURI}`);
  console.log(`Type:          ${mongoURI.startsWith('mongodb+srv://') ? 'MongoDB Atlas (Cloud)' : 'MongoDB Local / Custom'}`);
  console.log('Initiating connection test (timeout: 10s)...\n');

  const start = Date.now();
  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 10000
    });

    const elapsed = Date.now() - start;
    console.log(`✅ MongoDB Connection SUCCESSFUL! (${elapsed}ms)`);
    console.log(`📡 Host:         ${conn.connection.host}`);
    console.log(`📁 Database:     ${conn.connection.name}`);
    console.log(`🔌 Ready State:  ${conn.connection.readyState} (Connected)`);

    console.log('\n--- Collection Record Counts ---');
    const [movieCount, theaterCount, screenCount, seatCount, showCount, bookingCount, userCount] = await Promise.all([
      Movie.countDocuments(),
      Theater.countDocuments(),
      Screen.countDocuments(),
      Seat.countDocuments(),
      Show.countDocuments(),
      Booking.countDocuments(),
      User.countDocuments()
    ]);

    console.log(`🎬 Movies:       ${movieCount}`);
    console.log(`🏢 Theaters:     ${theaterCount}`);
    console.log(`🖥️ Screens:      ${screenCount}`);
    console.log(`🪑 Seats:        ${seatCount}`);
    console.log(`🎟️ Shows:        ${showCount}`);
    console.log(`📑 Bookings:     ${bookingCount}`);
    console.log(`👤 Users:        ${userCount}`);

    if (movieCount === 0) {
      console.log('\n⚠️ Notice: Database connected, but movies collection is currently empty.');
      console.log('👉 Run `npm run seed` or restart the backend to automatically populate catalog!');
    } else {
      console.log('\n✨ Database is healthy and fully populated with cinema data!');
    }

    await mongoose.connection.close();
    console.log('\nConnection closed cleanly. Diagnostics complete.\n');
    process.exit(0);
  } catch (error) {
    const elapsed = Date.now() - start;
    console.error(`\n❌ MongoDB Connection FAILED after ${elapsed}ms:`);
    console.error(`Error Message: ${error.message}\n`);

    console.log('Troubleshooting Guide:');
    if (mongoURI.startsWith('mongodb+srv://')) {
      console.log('1. Check MongoDB Atlas credentials:');
      console.log('   Ensure username and password in MONGODB_URI are correct.');
      console.log('   (If password has special characters like @, #, $, URL-encode them: e.g. @ -> %40)');
      console.log('2. Check IP Whitelist in Atlas:');
      console.log('   Go to cloud.mongodb.com -> Security -> Network Access -> Add IP Address -> Allow Access from Anywhere (0.0.0.0/0).');
      console.log('3. Ensure database user has `readWriteAnyDatabase` or `dbAdmin` role.');
    } else {
      console.log('1. Make sure MongoDB service is running locally on port 27017.');
      console.log('2. Or paste your MongoDB Atlas URI in backend/.env under MONGODB_URI.');
    }
    console.log('======================================================\n');
    process.exit(1);
  }
}

testConnection();
