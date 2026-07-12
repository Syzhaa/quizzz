import { Request, Response, NextFunction } from 'express';
import { getRedis } from '../config/redis.js';

export function rateLimit(keyPrefix: string, maxAttempts: number, windowSeconds: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `qz:rl:${keyPrefix}:${ip}`;

    try {
      const redis = getRedis();
      const current = await redis.incr(key);

      if (current === 1) {
        await redis.expire(key, windowSeconds);
      }

      if (current > maxAttempts) {
        res.status(429).json({
          success: false,
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
        });
        return;
      }

      next();
    } catch {
      next();
    }
  };
}
