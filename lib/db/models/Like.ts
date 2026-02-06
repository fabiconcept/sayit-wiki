import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILike extends Document {
    userId: string;
    targetId: mongoose.Types.ObjectId;
    targetType: 'note' | 'comment';
    createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
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
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Compound unique index to prevent duplicate likes
LikeSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

const Like: Model<ILike> = mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema);

export default Like;
