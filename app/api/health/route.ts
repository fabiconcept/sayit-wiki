import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { checkRedisConnection } from '@/lib/redis';
import mongoose from 'mongoose';

export async function GET() {
    const timestamp = new Date().toISOString();
    const checks: Record<string, any> = {
        database: { status: 'unknown', details: null },
        redis: { status: 'unknown', details: null },
    };

    // Check MongoDB connection
    try {
        await connectDB();
        const dbState = mongoose.connection.readyState;
        
        checks.database = {
            status: dbState === 1 ? 'connected' : 'disconnected',
            details: {
                state: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown',
                host: mongoose.connection.host || 'unknown',
                name: mongoose.connection.name || 'unknown',
            }
        };
    } catch (error: any) {
        checks.database = {
            status: 'error',
            details: {
                message: error.message || 'Database connection failed',
            }
        };
    }

    // Check Redis connection
    try {
        const isRedisConnected = await checkRedisConnection();
        checks.redis = {
            status: isRedisConnected ? 'connected' : 'disabled',
            details: isRedisConnected 
                ? { message: 'Redis is connected and rate limiting is enabled' }
                : { message: 'Redis is not available. Rate limiting is disabled (OK for development)' }
        };
    } catch (error: any) {
        checks.redis = {
            status: 'disabled',
            details: {
                message: 'Redis is not available. Rate limiting is disabled.',
            }
        };
    }

    // Determine overall health
    const isHealthy = checks.database.status === 'connected';
    const statusCode = isHealthy ? 200 : 503;

    return NextResponse.json(
        {
            status: isHealthy ? 'healthy' : 'degraded',
            timestamp,
            checks,
            message: isHealthy 
                ? 'All critical services are operational' 
                : 'Some services are unavailable',
        },
        { status: statusCode }
    );
}