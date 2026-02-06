import {  NextResponse } from 'next/server';
import { getRedisClient } from '../redis';

interface RateLimitConfig {
    maxRequests: number;
    windowSeconds: number;
    keyPrefix: string;
}

export async function checkRateLimit(
    userId: string,
    ip: string,
    config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
    const redis = getRedisClient();
    const now = Date.now();
    const resetAt = now + (config.windowSeconds * 1000);
    
    // If Redis is not available, skip rate limiting
    if (!redis) {
        return {
            allowed: true,
            remaining: config.maxRequests,
            resetAt,
        };
    }
    
    // Create composite key: userId + IP for stronger rate limiting
    const userKey = `${config.keyPrefix}:user:${userId}`;
    const ipKey = `${config.keyPrefix}:ip:${ip}`;
    
    const windowStart = now - (config.windowSeconds * 1000);
    
    try {
        // Check both userId and IP rate limits
        const [userCount, ipCount] = await Promise.all([
            redis.zcount(userKey, windowStart, now),
            redis.zcount(ipKey, windowStart, now),
        ]);
        
        // If either limit is exceeded, deny request
        if (userCount >= config.maxRequests || ipCount >= config.maxRequests) {
            return {
                allowed: false,
                remaining: 0,
                resetAt,
            };
        }
        
        // Add current request to both counters
        const requestId = `${now}:${Math.random()}`;
        await Promise.all([
            redis.zadd(userKey, now, requestId),
            redis.zadd(ipKey, now, requestId),
            redis.expire(userKey, config.windowSeconds),
            redis.expire(ipKey, config.windowSeconds),
            // Clean up old entries
            redis.zremrangebyscore(userKey, 0, windowStart),
            redis.zremrangebyscore(ipKey, 0, windowStart),
        ]);
        
        const remaining = config.maxRequests - Math.max(userCount, ipCount) - 1;
        
        return {
            allowed: true,
            remaining: Math.max(0, remaining),
            resetAt,
        };
    } catch (error) {
        // On Redis error, allow request but log the error
        return {
            allowed: true,
            remaining: config.maxRequests,
            resetAt,
        };
    }
}

export function rateLimitResponse(resetAt: number): NextResponse {
    const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
    
    return NextResponse.json(
        {
            success: false,
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Please try again later.',
                retryAfter,
            },
        },
        {
            status: 429,
            headers: {
                'Retry-After': retryAfter.toString(),
                'X-RateLimit-Reset': new Date(resetAt).toISOString(),
            },
        }
    );
}

// Rate limit configurations
export const RATE_LIMITS = {
    CREATE_NOTE: {
        maxRequests: 10,
        windowSeconds: 3600, // 1 hour
        keyPrefix: 'ratelimit:create_note',
    },
    CREATE_COMMENT: {
        maxRequests: 20,
        windowSeconds: 3600,
        keyPrefix: 'ratelimit:create_comment',
    },
    TOGGLE_LIKE: {
        maxRequests: 100,
        windowSeconds: 3600,
        keyPrefix: 'ratelimit:toggle_like',
    },
    TRACK_VIEW: {
        maxRequests: 500,
        windowSeconds: 1800, // 30 minutes
        keyPrefix: 'ratelimit:track_view',
    },
    REPORT_CONTENT: {
        maxRequests: 5,
        windowSeconds: 3600,
        keyPrefix: 'ratelimit:report_content',
    },
};
