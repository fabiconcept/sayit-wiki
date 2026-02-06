import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NoteCardProps } from '@/types/note';

interface CommentsState {
    commentsByNoteId: Record<string, NoteCardProps[]>;
    isLoading: Record<string, boolean>;
    hasMore: Record<string, boolean>;
}

const initialState: CommentsState = {
    commentsByNoteId: {},
    isLoading: {},
    hasMore: {},
};

const commentsSlice = createSlice({
    name: 'comments',
    initialState,
    reducers: {
        setComments: (state, action: PayloadAction<{ noteId: string; comments: NoteCardProps[] }>) => {
            const { noteId, comments } = action.payload;
            state.commentsByNoteId[noteId] = comments;
        },
        addComment: (state, action: PayloadAction<{ noteId: string; comment: NoteCardProps }>) => {
            const { noteId, comment } = action.payload;
            if (!state.commentsByNoteId[noteId]) {
                state.commentsByNoteId[noteId] = [];
            }
            state.commentsByNoteId[noteId].push(comment);
        },
        updateComment: (state, action: PayloadAction<{ noteId: string; commentId: string; updates: Partial<NoteCardProps> }>) => {
            const { noteId, commentId, updates } = action.payload;
            const comments = state.commentsByNoteId[noteId];
            if (comments) {
                const index = comments.findIndex(comment => comment.id === commentId);
                if (index !== -1) {
                    comments[index] = { ...comments[index], ...updates };
                }
            }
        },
        deleteComment: (state, action: PayloadAction<{ noteId: string; commentId: string }>) => {
            const { noteId, commentId } = action.payload;
            const comments = state.commentsByNoteId[noteId];
            if (comments) {
                state.commentsByNoteId[noteId] = comments.filter(comment => comment.id !== commentId);
            }
        },
        setLoading: (state, action: PayloadAction<{ noteId: string; isLoading: boolean }>) => {
            const { noteId, isLoading } = action.payload;
            state.isLoading[noteId] = isLoading;
        },
        setHasMore: (state, action: PayloadAction<{ noteId: string; hasMore: boolean }>) => {
            const { noteId, hasMore } = action.payload;
            state.hasMore[noteId] = hasMore;
        },
        clearComments: (state, action: PayloadAction<string>) => {
            const noteId = action.payload;
            delete state.commentsByNoteId[noteId];
            delete state.isLoading[noteId];
            delete state.hasMore[noteId];
        },
        clearAllComments: (state) => {
            state.commentsByNoteId = {};
            state.isLoading = {};
            state.hasMore = {};
        },
    },
});

export const {
    setComments,
    addComment,
    updateComment,
    deleteComment,
    setLoading,
    setHasMore,
    clearComments,
    clearAllComments,
} = commentsSlice.actions;

// Memoized selectors to prevent unnecessary rerenders
export const selectCommentsByNoteId = (state: { comments: CommentsState }, noteId: string) => 
    state.comments.commentsByNoteId[noteId] || [];

export const selectIsLoadingComments = (state: { comments: CommentsState }, noteId: string) => 
    state.comments.isLoading[noteId] || false;

export const selectHasMoreComments = (state: { comments: CommentsState }, noteId: string) => 
    state.comments.hasMore[noteId] || false;

export default commentsSlice.reducer;
