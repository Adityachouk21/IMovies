import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { seedInitialData } from '../services/dbSeeder.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/imovies';

async function runSeed() {
  console.log(`\n======================================================`);
  console.log(`🌱 iMovies Database Seeder`);
  console.log(`📡 Connecting to: ${MONGODB_URI}`);
  console.log(`======================================================\n`);

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`[Seeder] Connected to MongoDB host: ${mongoose.connection.host}/${mongoose.connection.name}`);

    const result = await seedInitialData({ force: true });
    console.log('[Seeder] Finished successfully:', result);

    await mongoose.connection.close();
    console.log('[Seeder] MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ [Seeder Error] Failed to complete database seed:');
    console.error(`Reason: ${error.message}`);
    if (error.message.includes('ECONNREFUSED') || error.message.includes('buffering timed out')) {
      console.info(`\n💡 Tip: Please check your MONGODB_URI in backend/.env:`);
      console.info(`   - For MongoDB Atlas: MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/imovies?retryWrites=true&w=majority`);
      console.info(`   - Make sure your current IP address is whitelisted in MongoDB Atlas Network Access (or set to 0.0.0.0/0).`);
    }
    process.exit(1);
  }
}

runSeed();
