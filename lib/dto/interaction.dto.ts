import { z } from 'zod';

export const ToggleLikeDTO = z.object({
    targetId: z.string().min(1, 'Target ID is required'),
    targetType: z.enum(['note', 'comment']),
});

export const TrackViewDTO = z.object({
    noteId: z.string().min(1, 'Note ID is required'),
});

export const ReportContentDTO = z.object({
    targetId: z.string().min(1, 'Target ID is required'),
    targetType: z.enum(['note', 'comment']),
    reason: z.string().max(200, 'Reason must be less than 200 characters').optional(),
});

export type ToggleLikeInput = z.infer<typeof ToggleLikeDTO>;
export type TrackViewInput = z.infer<typeof TrackViewDTO>;
export type ReportContentInput = z.infer<typeof ReportContentDTO>;
