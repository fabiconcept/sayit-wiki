import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NoteCardProps } from '@/types/note';

interface NotesState {
    notes: NoteCardProps[];
    isLoading: boolean;
    hasMore: boolean;
    currentPage: number;
}

const initialState: NotesState = {
    notes: [],
    isLoading: false,
    hasMore: true,
    currentPage: 0,
};

const notesSlice = createSlice({
    name: 'notes',
    initialState,
    reducers: {
        setNotes: (state, action: PayloadAction<NoteCardProps[]>) => {
            state.notes = action.payload;
            state.currentPage = 1;
        },
        addNote: (state, action: PayloadAction<NoteCardProps>) => {
            // Add new note at the beginning
            state.notes = [action.payload, ...state.notes];
        },
        addNotes: (state, action: PayloadAction<NoteCardProps[]>) => {
            state.notes.push(...action.payload);
        },
        removeNewFlag: (state, action: PayloadAction<string>) => {
            const note = state.notes.find(note => note.id === action.payload);
            if (note) {
                note.isNew = false;
            }
        },
        updateNote: (state, action: PayloadAction<{ id: string; updates: Partial<NoteCardProps> }>) => {
            const index = state.notes.findIndex(note => note.id === action.payload.id);
            if (index !== -1) {
                state.notes[index] = { ...state.notes[index], ...action.payload.updates };
            }
        },
        deleteNote: (state, action: PayloadAction<string>) => {
            state.notes = state.notes.filter(note => note.id !== action.payload);
        },
        toggleLike: (state, action: PayloadAction<string>) => {
            const note = state.notes.find(note => note.id === action.payload);
            if (note) {
                note.isLiked = !note.isLiked;
                note.likesCount += note.isLiked ? 1 : -1;
            }
        },
        incrementComments: (state, action: PayloadAction<string>) => {
            const note = state.notes.find(note => note.id === action.payload);
            if (note) {
                note.commentsCount += 1;
                note.isCommented = true;
            }
        },
        incrementViews: (state, action: PayloadAction<string>) => {
            const note = state.notes.find(note => note.id === action.payload);
            if (note) {
                note.viewsCount += 1;
                note.isViewed = true;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setHasMore: (state, action: PayloadAction<boolean>) => {
            state.hasMore = action.payload;
        },
        setCurrentPage: (state, action: PayloadAction<number>) => {
            state.currentPage = action.payload;
        },
        clearNotes: (state) => {
            state.notes = [];
            state.hasMore = true;
            state.currentPage = 0;
        },
    },
});

export const {
    setNotes,
    addNote,
    addNotes,
    updateNote,
    deleteNote,
    toggleLike,
    incrementComments,
    incrementViews,
    setLoading,
    setHasMore,
    setCurrentPage,
    clearNotes,
    removeNewFlag,
} = notesSlice.actions;

export default notesSlice.reducer;
