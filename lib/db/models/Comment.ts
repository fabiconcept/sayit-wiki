import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IComment extends Document {
    noteId: mongoose.Types.ObjectId;
    userId: string;
    content: string;
    backgroundColor: string;
    noteStyle: string;
    clipType: string;
    selectedFont: string;
    tilt: number;
    timestamp: Date;
    likesCount: number;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
    {
        noteId: {
            type: Schema.Types.ObjectId,
            ref: 'Note',
            required: true,
            index: true,
        },
        userId: {
            type: String,
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 300,
        },
        backgroundColor: {
            type: String,
            required: true,
        },
        noteStyle: {
            type: String,
            required: true,
        },
        clipType: {
            type: String,
            required: true,
        },
        selectedFont: {
            type: String,
            required: true,
        },
        tilt: {
            type: Number,
            required: true,
            min: -4,
            max: 4,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        likesCount: {
            type: Number,
            default: 0,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
CommentSchema.index({ noteId: 1, createdAt: 1 });

const Comment: Model<IComment> = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);

export default Comment;
