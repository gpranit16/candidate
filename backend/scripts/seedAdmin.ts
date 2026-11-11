import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB, disconnectDB } from '../src/config/db';
import { User } from '../src/models/User';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || 'Jobs Territory Recruiter';

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env');
    process.exit(1);
  }

  await connectDB();

  const shouldReset = process.argv.includes('--reset');
  const existing = await User.findOne({ email });
  if (existing) {
    let updated = false;
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      updated = true;
    }
    if (shouldReset) {
      existing.passwordHash = await bcrypt.hash(password, 12);
      updated = true;
    }
    if (updated) {
      await existing.save();
      console.info(`Updated existing admin account ${email}.`);
    } else {
      console.info(`Admin account ${email} already exists. Skipping creation.`);
    }
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.create({
      name,
      email,
      passwordHash,
      role: 'admin',
    });
    console.info(`Created admin account for ${email}.`);
  }

  await disconnectDB();
}

seedAdmin().catch(async (err) => {
  console.error('Admin seed failed:', err instanceof Error ? err.message : err);
  await disconnectDB();
  process.exit(1);
});

