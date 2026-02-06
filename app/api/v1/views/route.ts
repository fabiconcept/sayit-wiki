import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import View from '@/lib/db/models/View';
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
        const rateLimitResult = await checkRateLimit(userId, ip, RATE_LIMITS.TRACK_VIEW);
        if (!rateLimitResult.allowed) {
            return rateLimitResponse(rateLimitResult.resetAt);
        }

        // Parse request body
        const body = await request.json();
        const { noteId } = body;

        if (!noteId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Missing noteId',
                    },
                },
                { status: 400 }
            );
        }

        // Validate noteId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(noteId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid note ID format',
                    },
                },
                { status: 400 }
            );
        }

        // Check if view already exists (use unique index to prevent duplicates)
        try {
            const view = await View.findOne({ userId, noteId });
            if (view) {
                return NextResponse.json({
                    success: true,
                    data: {
                        alreadyViewed: true,
                    },
                });
            }

            await View.create({
                userId,
                noteId,
            });

            // Only increment if new view was created
            const note = await Note.findByIdAndUpdate(
                noteId,
                { $inc: { viewsCount: 1 } },
                { new: true }
            );

            return NextResponse.json({
                success: true,
                data: {
                    viewsCount: note?.viewsCount || 1,
                },
            });
        } catch (error: any) {
            // Duplicate view - user already viewed this note
            if (error.code === 11000) {
                const note = await Note.findById(noteId);
                return NextResponse.json({
                    success: true,
                    data: {
                        viewsCount: note?.viewsCount || 0,
                        alreadyViewed: true, // Optional: inform client
                    },
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error tracking view:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to track view',
                },
            },
            { status: 500 }
        );
    }
}