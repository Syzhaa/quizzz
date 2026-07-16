import { Socket } from 'socket.io';
import { verifyAccessToken } from '../services/auth-service.js';
import { loadEnv } from '../config/env.js';

const env = loadEnv();

export interface AuthenticatedSocket extends Socket {
  admin?: { adminId: string; email: string };
}

export function authenticateSocket(socket: Socket, next: (err?: Error) => void) {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('AUTH_REQUIRED'));
    }

    const payload = verifyAccessToken(token, env);
    (socket as AuthenticatedSocket).admin = payload;
    next();
  } catch (error) {
    next(new Error('AUTH_TOKEN_EXPIRED'));
  }
}

export function requireHostAuth(socket: AuthenticatedSocket, callback: (error?: string) => void) {
  if (!socket.admin) {
    callback('HOST_ONLY');
    return false;
  }
  return true;
}