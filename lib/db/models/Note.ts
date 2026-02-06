import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INote extends Document {
    userId: string;
    content: string;
    backgroundColor: string;
    noteStyle: string;
    clipType: string;
    tilt: number;
    selectedFont: string;
    timestamp: Date;
    likesCount: number;
    commentsCount: number;
    viewsCount: number;
    isDeleted: boolean;
    isTakenDown: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
    {
        userId: {
            type: String,
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
            maxlength: 500,
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
        tilt: {
            type: Number,
            required: true,
            min: -4,
            max: 4,
        },
        selectedFont: {
            type: String,
            required: true,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
        likesCount: {
            type: Number,
            default: 0,
        },
        commentsCount: {
            type: Number,
            default: 0,
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        isTakenDown: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
NoteSchema.index({ createdAt: -1 });
NoteSchema.index({ likesCount: -1 });
NoteSchema.index({ isDeleted: 1, isTakenDown: 1 });

const Note: Model<INote> = mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);

export default Note;
