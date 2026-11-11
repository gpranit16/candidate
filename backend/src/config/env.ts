import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const DEFAULT_DEV_JWT = 'dev_only_fallback_secret_change_in_production_32chars';

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  mongodbUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : DEFAULT_DEV_JWT),
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:3000')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean),
  dbName: 'jobs_territory_portal' as const,
};

if (env.isProd && !env.jwtSecret) {
  throw new Error('JWT_SECRET must be defined in production environment.');
}

