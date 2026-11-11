import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { CandidateProfile } from '../models/CandidateProfile';
import { AppError } from '../utils/AppError';
import { signAuthToken } from '../middleware/auth';

const BCRYPT_ROUNDS = 12;

export async function registerCandidate(input: {
  name: string;
  email: string;
  password: string;
}) {
  const existing = await User.findOne({ email: input.email.toLowerCase() }).lean();
  if (existing) {
    throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  // Use a MongoDB transaction when supported (replica sets / Atlas); fall back cleanly on standalone instances.
  let createdUserId = '';
  const session = await mongoose.startSession();
  try {
    try {
      await session.withTransaction(async () => {
        const [user] = await User.create(
          [
            {
              name: input.name,
              email: input.email.toLowerCase(),
              passwordHash,
              role: 'candidate', // Always enforce candidate role on public registration
            },
          ],
          { session }
        );
        await CandidateProfile.create(
          [
            {
              userId: user._id,
              profileCompletion: 10,
            },
          ],
          { session }
        );
        createdUserId = user._id.toString();
      });
    } catch (txErr: unknown) {
      const msg = txErr instanceof Error ? txErr.message : '';
      const isUnsupportedTx =
        msg.includes('Transaction numbers are only allowed on a replica set member') ||
        msg.includes('transactions are not supported');

      if (!isUnsupportedTx) {
        throw txErr;
      }

      const user = await User.create({
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash,
        role: 'candidate',
      });
      await CandidateProfile.create({
        userId: user._id,
        profileCompletion: 10,
      });
      createdUserId = user._id.toString();
    }
  } finally {
    await session.endSession();
  }

  const user = await User.findById(createdUserId);
  if (!user) {
    throw new AppError('Registration failed.', 500, 'REGISTRATION_FAILED');
  }

  const token = signAuthToken(user.id, user.role);
  return { user: user.toJSON(), token };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select('+passwordHash');
  if (!user) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
  }

  const token = signAuthToken(user.id, user.role);
  return { user: user.toJSON(), token };
}

export async function getCurrentUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) {
    throw new AppError('User account not found.', 404, 'USER_NOT_FOUND');
  }
  return user.toJSON();
}

