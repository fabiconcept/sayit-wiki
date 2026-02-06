import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Report from '@/lib/db/models/Report';
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
        
        // Update report status to 'ignored'
        const report = await Report.findByIdAndUpdate(
            reportId,
            {
                status: 'ignored',
                reviewedAt: new Date(),
            },
            { new: true }
        );
        
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

        return NextResponse.json({
            success: true,
            message: 'Report ignored successfully',
        });
    } catch (error) {
        console.error('Error ignoring report:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to ignore report',
                },
            },
            { status: 500 }
        );
    }
}
