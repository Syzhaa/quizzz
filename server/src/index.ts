import './bootstrap.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { connectMongoDB } from './config/mongodb.js';
import { connectRedis } from './config/redis.js';
import { loadEnv } from './config/env.js';
import healthRouter from './routes/health.js';
import authRouter from './routes/auth.js';
import quizRouter from './routes/quiz.js';
import { errorHandler } from './middleware/error-handler.js';
import { createNamespace } from './socket/namespace.js';

const env = loadEnv();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: env.CORS_ORIGIN },
});

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

app.use('/api/v1', healthRouter);
app.use('/api/v1', authRouter);
app.use('/api/v1', quizRouter);

app.use(errorHandler);

createNamespace(io, '/host');
createNamespace(io, '/player');

async function start() {
  try {
    await connectMongoDB(env.MONGODB_URI);
    console.log('[DB] MongoDB connected');
  } catch (err) {
    console.error('[DB] MongoDB connection failed:', err);
    process.exit(1);
  }

  try {
    await connectRedis(env.REDIS_URL);
    console.log('[DB] Redis connected');
  } catch (err) {
    console.error('[DB] Redis connection failed:', err);
    process.exit(1);
  }

  httpServer.listen(env.PORT, () => {
    console.log(`[Server] running on port ${env.PORT}`);
  });
}

start();
