import { Request, Response } from 'express';
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from '../middleware/auth';
import * as authService from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';
import { env } from '../config/env';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const { user, token } = await authService.registerCandidate({ name, email, password });

  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  res.status(201).json({
    success: true,
    data: { user },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser({ email, password });

  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());
  res.status(200).json({
    success: true,
    data: { user },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: env.isProd ? 'none' : 'lax',
    path: '/',
  });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.getCurrentUser(req.user!.id);
  res.status(200).json({
    success: true,
    data: { user },
  });
});

