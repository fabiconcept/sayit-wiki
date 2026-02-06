import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Report from '@/lib/db/models/Report';
import Note from '@/lib/db/models/Note';
import Comment from '@/lib/db/models/Comment';

export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'FORBIDDEN',
                    message: 'Admin endpoints only available in development mode',
                },
            },
            { status: 403 }
        );
    }

    try {
        await connectDB();
        
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status') || undefined;
        const type = searchParams.get('type') || undefined;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const skip = (page - 1) * limit;
        
        // Build query filter
        const filter: any = {};
        if (status) {
            filter.status = status;
        }
        if (type) {
            filter.targetType = type;
        }
        
        // Fetch reports from database
        const [reports, total] = await Promise.all([
            Report.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Report.countDocuments(filter),
        ]);
        
        // Fetch the actual content for each report
        const reportsWithContent = await Promise.all(
            reports.map(async (report) => {
                const content = report.targetType === 'note'
                    ? await Note.findById(report.targetId).lean()
                    : await Comment.findById(report.targetId).lean();
                
                return {
                    id: report._id.toString(),
                    targetId: report.targetId.toString(),
                    targetType: report.targetType,
                    reason: report.reason,
                    status: report.status,
                    createdAt: report.createdAt.toISOString(),
                    reviewedAt: report.reviewedAt?.toISOString(),
                    content: content ? {
                        id: content._id.toString(),
                        content: content.content,
                        backgroundColor: content.backgroundColor,
                        noteStyle: content.noteStyle,
                        clipType: (content as any).clipType,
                        tilt: content.tilt,
                        selectedFont: content.selectedFont,
                        timestamp: content.timestamp.toISOString(),
                        likesCount: content.likesCount,
                        commentsCount: (content as any).commentsCount || 0,
                        viewsCount: (content as any).viewsCount || 0,
                    } : null,
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: {
                reports: reportsWithContent,
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
        console.error('Error fetching reports:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to fetch reports',
                },
            },
            { status: 500 }
        );
    }
}
