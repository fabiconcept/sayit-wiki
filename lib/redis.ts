import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const DISABLE_REDIS = process.env.DISABLE_REDIS === 'true';

let redis: Redis | null = null;
let redisConnected = false;

export function getRedisClient(): Redis | null {
    if (DISABLE_REDIS) {
        return null;
    }

    if (!redis) {
        redis = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 1,
            connectTimeout: 1000,
            lazyConnect: true,
            retryStrategy(times: number) {
                // Stop retrying after 3 attempts
                if (times > 3) {
                    console.warn('Redis connection failed after 3 attempts. Rate limiting disabled.');
                    return null;
                }
                return Math.min(times * 50, 1000);
            },
        });

        redis.on('error', (err: Error) => {
            if (!redisConnected) {
                // Only log once to avoid spam
                console.warn('⚠️  Redis not available - Rate limiting disabled (this is OK for development)');
                redisConnected = false;
            }
        });

        redis.on('connect', () => {
            console.log('✅ Redis connected - Rate limiting enabled');
            redisConnected = true;
        });

        // Try to connect
        redis.connect().catch(() => {
            console.warn('⚠️  Redis not available - Rate limiting disabled');
        });
    }

    return redis;
}

export async function checkRedisConnection(): Promise<boolean> {
    if (DISABLE_REDIS) {
        return false;
    }

    try {
        const client = getRedisClient();
        if (!client) return false;
        
        await client.ping();
        return true;
    } catch {
        return false;
    }
}

export default getRedisClient;
