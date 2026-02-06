import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Comment from '@/lib/db/models/Comment';
import Like from '@/lib/db/models/Like';
import mongoose from 'mongoose';
import { validateAndExtractUserId } from '@/lib/middleware/validateUserId';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ noteId: string }> }
) {
    try {
        await connectDB();
        const { noteId } = await params;
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        
        // Decrypt userId from header
        const userIdResult = validateAndExtractUserId(request);
        const userId = userIdResult.userId;

        // Validate noteId
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

        // Fetch comments with pagination
        const comments = await Comment.find({
            noteId: new mongoose.Types.ObjectId(noteId),
            isDeleted: false,
        })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Get total count for pagination
        const total = await Comment.countDocuments({
            noteId: new mongoose.Types.ObjectId(noteId),
            isDeleted: false,
        });

        // Get liked status for each comment if userId is provided
        let likedCommentIds: Set<string> = new Set();
        if (userId && comments.length > 0) {
            const commentIds = comments.map((c) => c._id);
            const likes = await Like.find({
                userId,
                targetId: { $in: commentIds },
                targetType: 'comment',
            }).lean();
            likedCommentIds = new Set(likes.map((l) => l.targetId.toString()));
        }

        // Transform comments to match frontend format
        const transformedComments = comments.map((comment: any) => ({
            id: comment._id.toString(),
            noteId: comment.noteId.toString(),
            userId: comment.userId,
            content: comment.content,
            backgroundColor: comment.backgroundColor,
            noteStyle: comment.noteStyle,
            clipType: comment.clipType,
            selectedFont: comment.selectedFont,
            tilt: comment.tilt,
            timestamp: comment.timestamp,
            likesCount: comment.likesCount,
            isLiked: likedCommentIds.has(comment._id.toString()),
            createdAt: comment.createdAt,
        }));

        return NextResponse.json({
            success: true,
            data: {
                comments: transformedComments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch comments',
                },
            },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ noteId: string }> }
) {
    try {
        await connectDB();
        const { noteId } = await params;
        
        // Decrypt userId from header
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

        // Validate noteId
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

        const body = await request.json();

        // Validate required fields
        if (!body.content || typeof body.content !== 'string') {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Content is required',
                    },
                },
                { status: 400 }
            );
        }

        if (body.content.length > 300) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Content must be 300 characters or less',
                    },
                },
                { status: 400 }
            );
        }

        // Create comment
        const comment = await Comment.create({
            noteId: new mongoose.Types.ObjectId(noteId),
            userId,
            content: body.content,
            backgroundColor: body.backgroundColor || '#fff',
            noteStyle: body.noteStyle || 'spiral-left',
            selectedFont: body.selectedFont || 'arial',
            tilt: body.tilt || 0,
            clipType: body.clipType || 'staple',
            timestamp: new Date(),
        });

        // Increment note's commentsCount
        const Note = (await import('@/lib/db/models/Note')).default;
        await Note.findByIdAndUpdate(noteId, {
            $inc: { commentsCount: 1 },
        });

        // Transform to frontend format
        const transformedComment = {
            id: comment._id.toString(),
            noteId: comment.noteId.toString(),
            userId: comment.userId,
            content: comment.content,
            backgroundColor: comment.backgroundColor,
            noteStyle: comment.noteStyle,
            selectedFont: comment.selectedFont,
            tilt: comment.tilt,
            clipType: body.clipType,
            timestamp: comment.timestamp,
            likesCount: comment.likesCount,
            isLiked: false,
            createdAt: comment.createdAt,
        };

        return NextResponse.json(
            {
                success: true,
                data: transformedComment,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create comment',
                },
            },
            { status: 500 }
        );
    }
}
