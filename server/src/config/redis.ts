import Redis from 'ioredis';

let client: Redis | null = null;

export async function connectRedis(url: string): Promise<void> {
  client = new Redis(url, {
    maxRetriesPerRequest: 1,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });

  await client.ping();
}

export function getRedis(): Redis {
  if (!client) throw new Error('Redis not connected');
  return client;
}

export async function isRedisConnected(): Promise<boolean> {
  if (!client) return false;
  try {
    await client.ping();
    return true;
  } catch {
    return false;
  }
}
