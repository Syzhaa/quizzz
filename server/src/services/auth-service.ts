import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { Admin, AdminDocument } from '../models/admin.js';
import { Env } from '../config/env.js';

const SALT_ROUNDS = 12;

interface TokenPayload {
  adminId: string;
  email: string;
}

function expiresIn(value: string): SignOptions['expiresIn'] {
  // Zod-validated env values like "15m", "7d" are compatible with StringValue
  return value as StringValue | number;
}

export class AuthError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
  ) {
    super(message);
  }
}

export function generateAccessToken(admin: AdminDocument, env: Env): string {
  const payload: TokenPayload = { adminId: admin._id.toString(), email: admin.email };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: expiresIn(env.JWT_EXPIRES_IN) });
}

export function generateRefreshToken(admin: AdminDocument, env: Env): string {
  const payload: TokenPayload = { adminId: admin._id.toString(), email: admin.email };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: expiresIn(env.JWT_REFRESH_EXPIRES_IN) });
}

export function verifyAccessToken(token: string, env: Env): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function verifyRefreshToken(token: string, env: Env): TokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
}

export async function registerAdmin(
  name: string,
  email: string,
  password: string,
  env: Env,
) {
  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new AuthError('AUTH_EMAIL_EXISTS', 'Email already registered', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const admin = await Admin.create({ name, email: email.toLowerCase(), passwordHash });

  const accessToken = generateAccessToken(admin, env);
  const refreshToken = generateRefreshToken(admin, env);

  return {
    admin: { id: admin._id.toString(), name: admin.name, email: admin.email },
    accessToken,
    refreshToken,
  };
}

export async function loginAdmin(email: string, password: string, env: Env) {
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    throw new AuthError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    throw new AuthError('AUTH_INVALID_CREDENTIALS', 'Invalid email or password', 401);
  }

  const accessToken = generateAccessToken(admin, env);
  const refreshToken = generateRefreshToken(admin, env);

  return {
    admin: { id: admin._id.toString(), name: admin.name, email: admin.email },
    accessToken,
    refreshToken,
  };
}

export async function refreshAdminTokens(refreshToken: string, env: Env) {
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken, env);
  } catch {
    throw new AuthError('AUTH_REFRESH_FAILED', 'Invalid or expired refresh token', 401);
  }

  const admin = await Admin.findById(payload.adminId);
  if (!admin) {
    throw new AuthError('AUTH_REFRESH_FAILED', 'Admin not found', 401);
  }

  const newAccessToken = generateAccessToken(admin, env);
  const newRefreshToken = generateRefreshToken(admin, env);

  return {
    admin: { id: admin._id.toString(), name: admin.name, email: admin.email },
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}
