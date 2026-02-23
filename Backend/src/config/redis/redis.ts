import IORedis from 'ioredis';

export function createRedisConnection() {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    return new IORedis(redisUrl, {
      maxRetriesPerRequest: null
    });
  }

  return new IORedis({
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    db: Number(process.env.REDIS_DB || 0),
    maxRetriesPerRequest: null
  });
}
