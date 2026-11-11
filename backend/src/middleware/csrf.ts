import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Origin / CSRF verification for cookie-authenticated state-changing requests.
 * Allows requests from configured CLIENT_URL origins or non-browser test clients
 * when Origin/Referer is absent in development/test, while blocking untrusted cross-site origins.
 */
export function csrfOriginProtection(req: Request, _res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    return next();
  }

  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (origin) {
    if (!env.clientUrls.includes(origin)) {
      return next(new AppError('Cross-origin request blocked by CSRF policy.', 403, 'CSRF_BLOCKED'));
    }
    return next();
  }

  if (referer) {
    const matchesAllowed = env.clientUrls.some((allowed) => referer.startsWith(allowed));
    if (!matchesAllowed) {
      return next(new AppError('Referer blocked by CSRF policy.', 403, 'CSRF_BLOCKED'));
    }
    return next();
  }

  // In production browser requests carrying cookies without Origin/Referer, require custom X-Requested-With header
  if (env.isProd && req.cookies?.jt_token && req.headers['x-requested-with'] !== 'XMLHttpRequest') {
    return next(new AppError('Missing CSRF protection header.', 403, 'CSRF_HEADER_REQUIRED'));
  }

  next();
}

