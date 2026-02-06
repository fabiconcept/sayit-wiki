import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReport extends Document {
    userId: string;
    targetId: mongoose.Types.ObjectId;
    targetType: 'note' | 'comment';
    reason?: string;
    status: 'pending' | 'reviewed' | 'ignored' | 'taken_down';
    reviewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        targetId: {
            type: Schema.Types.ObjectId,
            required: true,
            index: true,
        },
        targetType: {
            type: String,
            required: true,
            enum: ['note', 'comment'],
        },
        reason: {
            type: String,
            maxlength: 200,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'reviewed', 'ignored', 'taken_down'],
            default: 'pending',
            index: true,
        },
        reviewedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Compound unique index to prevent duplicate reports
ReportSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
ReportSchema.index({ status: 1, createdAt: -1 });

const Report: Model<IReport> = mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export default Report;
