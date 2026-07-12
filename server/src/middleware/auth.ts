import { Request, Response, NextFunction } from 'express';
import { loadEnv } from '../config/env.js';
import { verifyAccessToken } from '../services/auth-service.js';

const env = loadEnv();

export interface AuthRequest extends Request {
  admin?: { adminId: string; email: string };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      code: 'AUTH_REQUIRED',
      message: 'Authentication token is required',
    });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token, env);
    req.admin = payload;
    next();
  } catch {
    res.status(401).json({
      success: false,
      code: 'AUTH_TOKEN_EXPIRED',
      message: 'Access token has expired',
    });
  }
}
