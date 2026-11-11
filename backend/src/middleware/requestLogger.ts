import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (env.isTest) {
    return next();
  }

  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    // Log method, path (without query tokens), status, and duration — never log bodies, cookies, or auth headers
    console.info(`${req.method} ${req.baseUrl}${req.path} ${res.statusCode} ${duration}ms`);
  });
  next();
}

