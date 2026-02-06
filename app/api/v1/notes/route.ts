import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Note from '@/lib/db/models/Note';
import { CreateNoteDTO, GetNotesQueryDTO } from '@/lib/dto/note.dto';
import { validateAndExtractUserId, addUserIdHeader } from '@/lib/middleware/validateUserId';
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/middleware/rateLimit';
import { LikeService } from '@/lib/services/likeService';
import { ProfanityGuard, ModerationLevel, quickModerate } from '@useverse/profanity-guard';

const guard = new ProfanityGuard();

export async function GET(request: NextRequest) {
    try {
        await connectDB();
        
        // Validate and extract userId (optional for GET)
        const userIdResult = validateAndExtractUserId(request);
        const userId = userIdResult.userId;
        
        // Parse and validate query parameters
        const searchParams = request.nextUrl.searchParams;
        const queryParams = GetNotesQueryDTO.parse({
            page: parseInt(searchParams.get('page') || '1'),
            limit: parseInt(searchParams.get('limit') || '20'),
            sort: searchParams.get('sort') || 'recent',
        });
        
        const { page, limit, sort } = queryParams;
        const skip = (page - 1) * limit;
        
        // Build sort criteria
        const sortCriteria: any = sort === 'recent' 
            ? { createdAt: -1 } 
            : sort === 'popular'
            ? { likesCount: -1 }
            : { viewsCount: -1, likesCount: -1 }; // trending
        
        // Fetch notes from database
        const [notes, total] = await Promise.all([
            Note.find({ isDeleted: false, isTakenDown: false })
                .sort(sortCriteria)
                .skip(skip)
                .limit(limit)
                .lean(),
            Note.countDocuments({ isDeleted: false, isTakenDown: false }),
        ]);
        
        // Check which notes the user has liked
        let likedMap = new Map<string, boolean>();
        if (userId) {
            const noteIds = notes.map(note => note._id.toString());
            likedMap = await LikeService.checkUserLikes(userId, noteIds);
        }
        
        // Transform notes to response format
        const transformedNotes = notes.map(note => ({
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
            isLiked: likedMap.get(note._id.toString()) || false,
            isCommented: false, // TODO: Check if user has commented
            isViewed: false, // TODO: Check if user has viewed
        }));
        
        const response = NextResponse.json({
            success: true,
            data: {
                notes: transformedNotes,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasMore: page * limit < total,
                },
            },
        });
        
        // Add new userId header if it was regenerated
        if (userIdResult.wasRegenerated) {
            return addUserIdHeader(response, userIdResult.encryptedUserId);
        }
        
        return response;
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch notes',
                },
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();
        
        // Validate and extract userId (required for POST)
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
        
        // Check rate limit (userId + IP)
        const rateLimitResult = await checkRateLimit(userId, ip, RATE_LIMITS.CREATE_NOTE);
        if (!rateLimitResult.allowed) {
            return rateLimitResponse(rateLimitResult.resetAt);
        }
        
        // Parse and validate request body
        const body = await request.json();
        const validatedData = CreateNoteDTO.parse(body);
        
        // Apply content moderation
        const moderationResult = quickModerate(validatedData.content, ModerationLevel.RELAXED);
        if (!moderationResult.isClean) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'CONTENT_REJECTED',
                        message: 'Content contains inappropriate language',
                        details: {
                            violations: moderationResult.matches.map(match => match.word).join(', ') || [],
                        },
                    },
                },
                { status: 400 }
            );
        }
        
        // Create note in database
        const note = await Note.create({
            userId,
            content: validatedData.content,
            backgroundColor: validatedData.backgroundColor,
            noteStyle: validatedData.noteStyle,
            clipType: validatedData.clipType,
            tilt: validatedData.tilt,
            selectedFont: validatedData.selectedFont,
            timestamp: new Date(),
        });
        
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
            likesCount: 0,
            commentsCount: 0,
            viewsCount: 0,
            isLiked: false,
            isCommented: false,
            isViewed: false,
            createdAt: note.createdAt.toISOString(),
        };
        
        const response = NextResponse.json(
            {
                success: true,
                data: responseData,
            },
            { status: 201 }
        );
        
        // Add new userId header if it was regenerated
        if (userIdResult.wasRegenerated) {
            return addUserIdHeader(response, userIdResult.encryptedUserId);
        }
        
        return response;
    } catch (error: any) {
        console.error('Error creating note:', error);
        
        // Handle validation errors
        if (error.name === 'ZodError') {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid request data',
                        details: error.errors,
                    },
                },
                { status: 400 }
            );
        }
        
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to create note',
                },
            },
            { status: 500 }
        );
    }
}
