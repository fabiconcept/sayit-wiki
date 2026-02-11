import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getEncryptedUserId } from '@/lib/userId';
import type { NoteCardProps, NoteCardResponse } from '@/types/note';

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({ 
        baseUrl: '/api/v1',
        prepareHeaders: (headers) => {
            const userId = getEncryptedUserId();
            if (userId) {
                headers.set('X-User-Id', userId);
            }
            return headers;
        },
    }),
    // Keep cached data for 5 minutes after last use
    keepUnusedDataFor: 300,
    tagTypes: ['Notes', 'Comments', 'Reports'],
    endpoints: (builder) => ({
        // Notes endpoints
        getNotes: builder.query<{
            notes: NoteCardProps[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
                hasMore: boolean;
            };
        }, { page?: number; limit?: number; sort?: string }>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params.page) queryParams.set('page', params.page.toString());
                if (params.limit) queryParams.set('limit', params.limit.toString());
                if (params.sort) queryParams.set('sort', params.sort);
                return `/notes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            },
            transformResponse: (response: { success: boolean; data: any }) => response.data,
            providesTags: ['Notes'],
        }),
        
        getNote: builder.query<NoteCardProps, string>({
            query: (noteId) => `/notes/${noteId}`,
            transformResponse: (response: NoteCardResponse) => response.data,
            providesTags: (result, error, noteId) => [{ type: 'Notes', id: noteId }],
        }),
        
        createNote: builder.mutation<NoteCardProps, Partial<NoteCardProps>>({
            query: (note) => ({
                url: '/notes',
                method: 'POST',
                body: note,
            }),
            transformResponse: (response: { success: boolean; data: NoteCardProps }) => response.data,
            // Don't invalidate tags - we manually add to slice for immediate update
        }),
        
        deleteNote: builder.mutation<{ success: boolean }, string>({
            query: (noteId) => ({
                url: `/notes/${noteId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Notes'],
        }),
        
        // Comments endpoints
        getComments: builder.query<{
            comments: NoteCardProps[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
                hasMore: boolean;
            };
        }, { noteId: string; page?: number; limit?: number }>({
            query: ({ noteId, page, limit }) => {
                const queryParams = new URLSearchParams();
                if (page) queryParams.set('page', page.toString());
                if (limit) queryParams.set('limit', limit.toString());
                return `/notes/${noteId}/comments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            },
            transformResponse: (response: { success: boolean; data: any }) => response.data,
            providesTags: (result, error, { noteId }) => [{ type: 'Comments', id: noteId }],
        }),
        
        createComment: builder.mutation<NoteCardProps, { noteId: string; comment: Partial<NoteCardProps> }>({
            query: ({ noteId, comment }) => ({
                url: `/notes/${noteId}/comments`,
                method: 'POST',
                body: comment,
            }),
            transformResponse: (response: { success: boolean; data: NoteCardProps }) => response.data,
            // Don't invalidate - we manually manage slice for immediate updates
        }),
        
        // Interactions endpoints
        toggleLike: builder.mutation<{ isLiked: boolean; likesCount: number }, { targetId: string; targetType: 'note' | 'comment' }>({
            query: (body) => ({
                url: '/likes',
                method: 'POST',
                body,
            }),
            invalidatesTags: (result, error, { targetId, targetType }) => [
                targetType === 'note' ? { type: 'Notes', id: targetId } : { type: 'Comments', id: targetId },
            ],
        }),
        
        trackView: builder.mutation<{ viewsCount?: number; alreadyViewed?: boolean }, string>({
            query: (noteId) => ({
                url: '/views',
                method: 'POST',
                body: { noteId },
            }),
            transformResponse: (response: { success: boolean; data: { viewsCount?: number; alreadyViewed?: boolean } }) => response.data,
        }),
        
        reportContent: builder.mutation<{ reportId: string }, { targetId: string; targetType: 'note' | 'comment'; reason?: string }>({
            query: (body) => ({
                url: '/reports',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Reports'],
        }),
        
        // Admin endpoints
        getReports: builder.query<{
            reports: any[];
            pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
                hasMore: boolean;
            };
        }, { status?: string; type?: string; page?: number; limit?: number }>({
            query: (params) => {
                const queryParams = new URLSearchParams();
                if (params.status) queryParams.set('status', params.status);
                if (params.type) queryParams.set('type', params.type);
                if (params.page) queryParams.set('page', params.page.toString());
                if (params.limit) queryParams.set('limit', params.limit.toString());
                return `/admin/reports${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            },
            transformResponse: (response: { success: boolean; data: any }) => response.data,
            providesTags: ['Reports'],
        }),
        
        ignoreReport: builder.mutation<{ success: boolean }, string>({
            query: (reportId) => ({
                url: `/admin/reports/${reportId}/ignore`,
                method: 'POST',
            }),
            invalidatesTags: ['Reports'],
        }),
        
        takedownReport: builder.mutation<{ success: boolean }, string>({
            query: (reportId) => ({
                url: `/admin/reports/${reportId}/takedown`,
                method: 'POST',
            }),
            invalidatesTags: ['Reports'],
        }),
        
        reinstateReport: builder.mutation<{ success: boolean }, string>({
            query: (reportId) => ({
                url: `/admin/reports/${reportId}/reinstate`,
                method: 'POST',
            }),
            invalidatesTags: ['Reports'],
        }),
    }),
});

export const {
    useGetNotesQuery,
    useGetNoteQuery,
    useCreateNoteMutation,
    useDeleteNoteMutation,
    useGetCommentsQuery,
    useCreateCommentMutation,
    useToggleLikeMutation,
    useTrackViewMutation,
    useReportContentMutation,
    useGetReportsQuery,
    useIgnoreReportMutation,
    useTakedownReportMutation,
    useReinstateReportMutation,
} = api;
