import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Note from '@/lib/db/models/Note';
import { validateAndExtractUserId, addUserIdHeader } from '@/lib/middleware/validateUserId';
import { LikeService } from '@/lib/services/likeService';
import mongoose from 'mongoose';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ noteId: string }> }
) {
    try {
        await connectDB();
        
        const { noteId } = await params;
        
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
        
        // Validate and extract userId (optional for GET)
        const userIdResult = validateAndExtractUserId(request);
        const userId = userIdResult.userId;
        
        // Fetch note from database
        const note = await Note.findOne({
            _id: noteId,
            isDeleted: false,
            isTakenDown: false,
        }).lean();
        
        if (!note) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Note not found',
                    },
                },
                { status: 404 }
            );
        }
        
        // Check if user has liked this note
        let isLiked = false;
        if (userId) {
            const likedMap = await LikeService.checkUserLikes(userId, [note._id.toString()]);
            isLiked = likedMap.get(note._id.toString()) || false;
        }
        
        // Transform to response format
        const responseData = {
            id: note._id.toString(),
            content: note.content,
            backgroundColor: note.backgroundColor,
            noteStyle: note.noteStyle,
            clipType: note.clipType,
            tilt: note.tilt,
            selectedFont: note.selectedFont,
            timestamp: note.timestamp.toISOString(),
            likesCount: note.likesCount,
            commentsCount: note.commentsCount,
            viewsCount: note.viewsCount,
            isLiked,
            isCommented: false, // TODO: Check if user has commented
            isViewed: false, // TODO: Check if user has viewed
        };
        
        const response = NextResponse.json({
            success: true,
            data: responseData,
        });
        
        // Add new userId header if it was regenerated
        if (userIdResult.wasRegenerated) {
            return addUserIdHeader(response, userIdResult.encryptedUserId);
        }
        
        return response;
    } catch (error) {
        console.error('Error fetching note:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch note',
                },
            },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ noteId: string }> }
) {
    try {
        await connectDB();
        
        const { noteId } = await params;
        
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
        
        // Validate and extract userId (required for DELETE)
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
        
        // Find note and verify ownership
        const note = await Note.findById(noteId);
        
        if (!note) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Note not found',
                    },
                },
                { status: 404 }
            );
        }
        
        // Verify user owns the note
        if (note.userId !== userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'You do not have permission to delete this note',
                    },
                },
                { status: 403 }
            );
        }
        
        // Soft delete the note
        await Note.findByIdAndUpdate(noteId, {
            isDeleted: true,
        });
        
        const response = NextResponse.json({
            success: true,
            message: 'Note deleted successfully',
        });
        
        // Add new userId header if it was regenerated
        if (userIdResult.wasRegenerated) {
            return addUserIdHeader(response, userIdResult.encryptedUserId);
        }
        
        return response;
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to delete note',
                },
            },
            { status: 500 }
        );
    }
}
