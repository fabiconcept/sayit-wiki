import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Like from '@/lib/db/models/Like';
import Note from '@/lib/db/models/Note';
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
        const rateLimitResult = await checkRateLimit(userId, ip, RATE_LIMITS.TOGGLE_LIKE);
        if (!rateLimitResult.allowed) {
            return rateLimitResponse(rateLimitResult.resetAt);
        }
        
        // Parse request body
        const body = await request.json();
        const { targetId, targetType } = body;
        
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
        
        // Check if like already exists
        const existingLike = await Like.findOne({
            userId,
            targetId,
            targetType,
        });
        
        let isLiked: boolean;
        let likesCount: number;
        
        if (existingLike) {
            // Unlike - remove the like
            await Like.deleteOne({ _id: existingLike._id });
            isLiked = false;
            
            // Decrement like count on the target
            if (targetType === 'note') {
                await Note.findByIdAndUpdate(targetId, {
                    $inc: { likesCount: -1 },
                });
                const note = await Note.findById(targetId);
                likesCount = note?.likesCount || 0;
            } else {
                // TODO: Handle comment likes when Comment model is ready
                likesCount = 0;
            }
        } else {
            // Like - create new like
            await Like.create({
                userId,
                targetId,
                targetType,
            });
            isLiked = true;
            
            // Increment like count on the target
            if (targetType === 'note') {
                await Note.findByIdAndUpdate(targetId, {
                    $inc: { likesCount: 1 },
                });
                const note = await Note.findById(targetId);
                likesCount = note?.likesCount || 1;
            } else {
                // TODO: Handle comment likes when Comment model is ready
                likesCount = 1;
            }
        }
        
        return NextResponse.json({
            success: true,
            data: {
                isLiked,
                likesCount,
            },
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to toggle like',
                },
            },
            { status: 500 }
        );
    }
}
