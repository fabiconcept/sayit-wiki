import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Report from '@/lib/db/models/Report';

export async function POST(
    request: NextRequest,
    { params }: { params: { reportId: string } }
) {
    try {
        // Only allow in development mode
        if (process.env.NODE_ENV !== 'development') {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: 'FORBIDDEN',
                        message: 'This endpoint is only available in development mode',
                    },
                },
                { status: 403 }
            );
        }

        await connectDB();

        const { reportId } = params;

        // Update report status back to pending
        const report = await Report.findByIdAndUpdate(
            reportId,
            { 
                status: 'pending',
                reviewedAt: null,
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
            data: {
                reportId: report._id,
                status: report.status,
            },
        });
    } catch (error) {
        console.error('Error reinstating report:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: 'Failed to reinstate report',
                },
            },
            { status: 500 }
        );
    }
}
