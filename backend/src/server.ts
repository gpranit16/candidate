import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function bootstrap() {
  try {
    await connectDB();
    console.info(`MongoDB connected to database: ${env.dbName}`);

    const app = createApp();
    app.listen(env.port, () => {
      console.info(`Jobs Territory API listening on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

bootstrap();

