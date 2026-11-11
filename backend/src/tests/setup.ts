import dotenv from 'dotenv';
import path from 'path';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { createApp } from '../app';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_vitest_integration_32chars';

let mongod: MongoMemoryServer | null = null;
let usingAtlasTestDb = false;
export const app = createApp();

export async function setupTestDB() {
  if (process.env.USE_ATLAS_TEST_DB === 'true') {
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    const uri = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is required when USE_ATLAS_TEST_DB=true');
    }
    if (uri.toLowerCase().includes('pricepilot')) {
      throw new Error('Forbidden test database reference.');
    }
    usingAtlasTestDb = true;
    await mongoose.connect(uri, { dbName: 'jobs_territory_portal_test' });
    return;
  }

  mongod = await MongoMemoryServer.create({
    instance: {
      dbName: 'jobs_territory_portal',
    },
  });
  const uri = mongod.getUri('jobs_territory_portal');
  await mongoose.connect(uri, { dbName: 'jobs_territory_portal' });
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

export async function teardownTestDB() {
  if (usingAtlasTestDb && mongoose.connection.readyState === 1) {
    await mongoose.connection.dropDatabase();
  }
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
    mongod = null;
  }
}
