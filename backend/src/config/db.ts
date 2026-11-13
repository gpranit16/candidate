import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(uriOverride?: string): Promise<typeof mongoose> {
  const uri = uriOverride || env.mongodbUri;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured in backend/.env');
  }

  if (uri.toLowerCase().includes('pricepilot')) {
    throw new Error('Forbidden database reference: must connect to jobs_territory_portal, not pricepilot.');
  }

  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(uri, {
    dbName: env.dbName,
    autoIndex: true,
  } as mongoose.ConnectOptions);

  if (conn.connection.name !== env.dbName) {
    throw new Error(`Connected to unexpected database "${conn.connection.name}". Expected "${env.dbName}".`);
  }

  return conn;
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
}

