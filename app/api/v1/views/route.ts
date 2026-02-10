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

        console.log('[DEBUG] Extracted userId from request:', { 
            userId, 
            userIdResult,
            headers: {
                authorization: request.headers.get('authorization') ? 'present' : 'missing',
                'x-user-id': request.headers.get('x-user-id')
            }
        });

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

        console.log('[DEBUG] Request body:', { noteId, userId });

        if (!noteId) {
            console.log('[DEBUG] Missing noteId - returning 400');
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
            console.log('[DEBUG] Invalid noteId format:', noteId);
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
            console.log('[DEBUG] Checking for existing view:', { userId, noteId, found: !!view });
            
            if (view) {
                console.log('[DEBUG] View already exists - returning alreadyViewed:', { 
                    viewId: view._id, 
                    userId, 
                    noteId,
                    createdAt: view.createdAt 
                });
                return NextResponse.json({
                    success: true,
                    data: {
                        alreadyViewed: true,
                    },
                });
            }

            console.log('[DEBUG] Creating new view:', { userId, noteId });
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

            console.log('[DEBUG] View created successfully - new viewsCount:', { 
                noteId, 
                viewsCount: note?.viewsCount,
                userId 
            });

            return NextResponse.json({
                success: true,
                data: {
                    viewsCount: note?.viewsCount || 1,
                },
            });
        } catch (error: unknown) {
            // Duplicate view - user already viewed this note
            if ((error as { code: number }).code === 11000) {
                console.log('[DEBUG] Duplicate key error (11000) - view already exists:', { 
                    userId, 
                    noteId,
                    error: (error as Error).message 
                });
                const note = await Note.findById(noteId);
                return NextResponse.json({
                    success: true,
                    data: {
                        viewsCount: note?.viewsCount || 0,
                        alreadyViewed: true, // Optional: inform client
                    },
                });
            }
            console.log('[DEBUG] Unexpected error in view creation:', error);
            throw error;
        }
    } catch (error) {
        console.error('[DEBUG] Error tracking view:', {
            error,
            message: (error as Error).message,
            stack: (error as Error).stack
        });
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