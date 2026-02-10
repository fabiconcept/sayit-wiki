import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IView extends Document {
    userId: string;
    noteId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const ViewSchema = new Schema<IView>(
    {
        userId: {
            type: String,
            required: true,
        },
        noteId: {
            type: Schema.Types.ObjectId,
            ref: 'Note',
            required: true,
        },
    },
    {
        timestamps: { createdAt: true, updatedAt: false },
    }
);

// Compound unique index to prevent duplicate views (userId + noteId combination must be unique)
ViewSchema.index({ userId: 1, noteId: 1 }, { unique: true });

const View: Model<IView> = mongoose.models.View || mongoose.model<IView>('View', ViewSchema);

export default View;
