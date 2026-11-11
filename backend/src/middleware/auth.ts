import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User, UserRole } from '../models/User';
import { AppError } from '../utils/AppError';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const AUTH_COOKIE_NAME = 'jt_token';

interface JwtPayload {
  sub: string;
  role: UserRole;
}

export function signAuthToken(userId: string, role: UserRole): string {
  return jwt.sign({ sub: userId, role }, env.jwtSecret, {
    expiresIn: '7d',
  });
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: env.isProd,
    sameSite: (env.isProd ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

async function resolveUserFromCookie(req: Request): Promise<AuthUser | null> {
  const token = req.cookies?.[AUTH_COOKIE_NAME];
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
    if (!decoded?.sub) return null;

    const user = await User.findById(decoded.sub).select('name email role').lean();
    if (!user) return null;

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await resolveUserFromCookie(req);
    if (!user) {
      return next(new AppError('Authentication required. Please log in.', 401, 'UNAUTHORIZED'));
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await resolveUserFromCookie(req);
    if (user) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
  }
  if (req.user.role !== 'admin') {
    return next(new AppError('Administrator access is required for this resource.', 403, 'FORBIDDEN'));
  }
  next();
}

