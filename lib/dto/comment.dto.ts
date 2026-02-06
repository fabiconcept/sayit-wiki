import { z } from 'zod';

export const CreateCommentDTO = z.object({
    content: z.string().min(1, 'Content is required').max(300, 'Content must be less than 300 characters'),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
    noteStyle: z.string().min(1, 'Note style is required'),
    selectedFont: z.string().min(1, 'Font is required'),
    tilt: z.number().min(-4, 'Tilt must be >= -4').max(4, 'Tilt must be <= 4'),
});

export const GetCommentsQueryDTO = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(50).default(20),
});

export type CreateCommentInput = z.infer<typeof CreateCommentDTO>;
export type GetCommentsQuery = z.infer<typeof GetCommentsQueryDTO>;
