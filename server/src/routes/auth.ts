import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { loadEnv } from '../config/env.js';
import { registerAdmin, loginAdmin, refreshAdminTokens, AuthError } from '../services/auth-service.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';

const env = loadEnv();
const router = Router();

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

router.post('/auth/register', rateLimit('register', 5, 300), async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
      errors: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const result = await registerAdmin(parsed.data.name, parsed.data.email, parsed.data.password, env);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    throw err;
  }
});

router.post('/auth/login', rateLimit('login', 10, 300), async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
    });
    return;
  }

  try {
    const result = await loginAdmin(parsed.data.email, parsed.data.password, env);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    throw err;
  }
});

router.post('/auth/refresh', async (req: Request, res: Response) => {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      code: 'VALIDATION_ERROR',
      message: 'Invalid input',
    });
    return;
  }

  try {
    const result = await refreshAdminTokens(parsed.data.refreshToken, env);
    res.json({ success: true, data: result });
  } catch (err) {
    if (err instanceof AuthError) {
      res.status(err.statusCode).json({ success: false, code: err.code, message: err.message });
      return;
    }
    throw err;
  }
});

router.post('/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/auth/me', authenticate, (req: AuthRequest, res: Response) => {
  res.json({ success: true, data: { admin: req.admin } });
});

export default router;
