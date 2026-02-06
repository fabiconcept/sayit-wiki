import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Report from '@/lib/db/models/Report';
import { validateAndExtractUserId } from '@/lib/middleware/validateUserId';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/middleware/rateLimit';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        // Validate and extract userId (required)
        const userIdResult = validateAndExtractUserId(request);
        const userId = userIdResult.userId;
        
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'Missing or invalid user ID',
                    },
                },
                { status: 401 }
            );
        }
        
        // Get client IP for rate limiting
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') || 
                   'unknown';
        
        // Check rate limit
        const rateLimitResult = await checkRateLimit(userId, ip, RATE_LIMITS.REPORT_CONTENT);
        if (!rateLimitResult.allowed) {
            return rateLimitResponse(rateLimitResult.resetAt);
        }
        
        // Parse request body
        const body = await request.json();
        const { targetId, targetType, reason } = body;
        
        if (!targetId || !targetType) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Missing targetId or targetType',
                    },
                },
                { status: 400 }
            );
        }
        
        if (!['note', 'comment'].includes(targetType)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid targetType. Must be "note" or "comment"',
                    },
                },
                { status: 400 }
            );
        }
        
        // Validate targetId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(targetId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid target ID format',
                    },
                },
                { status: 400 }
            );
        }
        
        // Check if user already reported this content
        try {
            const report = await Report.create({
                userId,
                targetId,
                targetType,
                reason: reason || '',
                status: 'pending',
            });
            
            return NextResponse.json(
                {
                    success: true,
                    data: {
                        reportId: report._id.toString(),
                    },
                },
                { status: 201 }
            );
        } catch (error: any) {
            // If duplicate key error (user already reported this content)
            if (error.code === 11000) {
                return NextResponse.json(
                    {
                        success: false,
                        error: {
                            code: 'DUPLICATE_REPORT',
                            message: 'You have already reported this content',
                        },
                    },
                    { status: 409 }
                );
            }
            throw error;
        }
    } catch (error) {
        console.error('Error creating report:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create report',
                },
            },
            { status: 500 }
        );
    }
}
