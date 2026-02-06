import { z } from 'zod';

export const CreateNoteDTO = z.object({
    content: z.string().min(1, 'Content is required').max(500, 'Content must be less than 500 characters'),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
    noteStyle: z.string().min(1, 'Note style is required'),
    clipType: z.string().min(1, 'Clip type is required'),
    tilt: z.number().min(-4, 'Tilt must be >= -4').max(4, 'Tilt must be <= 4'),
    selectedFont: z.string().min(1, 'Font is required'),
});

export const UpdateNoteDTO = CreateNoteDTO.partial();

export const GetNotesQueryDTO = z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(50).default(20),
    sort: z.enum(['recent', 'popular', 'trending']).default('recent'),
});

export type CreateNoteInput = z.infer<typeof CreateNoteDTO>;
export type UpdateNoteInput = z.infer<typeof UpdateNoteDTO>;
export type GetNotesQuery = z.infer<typeof GetNotesQueryDTO>;
