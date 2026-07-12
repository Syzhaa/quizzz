import { Router, Request, Response } from 'express';
import { isMongoDBConnected } from '../config/mongodb.js';
import { isRedisConnected } from '../config/redis.js';

const router = Router();

router.get('/health', async (_req: Request, res: Response) => {
  const mongoOk = isMongoDBConnected();
  const redisOk = await isRedisConnected();

  const status = mongoOk && redisOk ? 'healthy' : 'degraded';
  const code = mongoOk && redisOk ? 200 : 503;

  res.status(code).json({
    success: true,
    status,
    timestamp: new Date().toISOString(),
    services: {
      api: 'healthy',
      mongodb: mongoOk ? 'healthy' : 'unhealthy',
      redis: redisOk ? 'healthy' : 'unhealthy',
    },
  });
});

export default router;
