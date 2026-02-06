import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Report from '@/lib/db/models/Report';
import Note from '@/lib/db/models/Note';
import Comment from '@/lib/db/models/Comment';
import mongoose from 'mongoose';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ reportId: string }> }
) {
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
        
        const { reportId } = await params;
        
        // Validate reportId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(reportId)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'Invalid report ID format',
                    },
                },
                { status: 400 }
            );
        }
        
        // Get report details
        const report = await Report.findById(reportId);
        
        if (!report) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'NOT_FOUND',
                        message: 'Report not found',
                    },
                },
                { status: 404 }
            );
        }
        
        // Update report status to 'taken_down'
        await Report.findByIdAndUpdate(reportId, {
            status: 'taken_down',
            reviewedAt: new Date(),
        });
        
        // Mark target content as taken down
        if (report.targetType === 'note') {
            await Note.findByIdAndUpdate(report.targetId, {
                isTakenDown: true,
            });
        } else {
            await Comment.findByIdAndUpdate(report.targetId, {
                isDeleted: true,
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Content taken down successfully',
        });
    } catch (error) {
        console.error('Error taking down content:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to take down content',
                },
            },
            { status: 500 }
        );
    }
}
