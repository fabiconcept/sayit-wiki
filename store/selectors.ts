import { RootState } from './store';

// Notes selectors
export const selectAllNotes = (state: RootState) => state.notes.notes;
export const selectNotesLoading = (state: RootState) => state.notes.isLoading;
export const selectNotesHasMore = (state: RootState) => state.notes.hasMore;
export const selectNoteById = (state: RootState, noteId: string) => 
    state.notes.notes.find(note => note.id === noteId);

// Comments selectors
export const selectCommentsByNoteId = (state: RootState, noteId: string) => 
    state.comments.commentsByNoteId[noteId] || [];
export const selectCommentsLoading = (state: RootState, noteId: string) => 
    state.comments.isLoading[noteId] || false;
export const selectCommentsHasMore = (state: RootState, noteId: string) => 
    state.comments.hasMore[noteId] || false;

// App selectors
export const selectModerationLevel = (state: RootState) => state.app.moderationLevel;
export const selectIsPrivacySettingsOpen = (state: RootState) => state.app.isPrivacySettingsOpen;
export const selectIsReportModalOpen = (state: RootState) => state.app.isReportModalOpen;
export const selectIsShareModalOpen = (state: RootState) => state.app.isShareModalOpen;
export const selectIsViewNoteModalOpen = (state: RootState) => state.app.isViewNoteModalOpen;
export const selectActiveNoteId = (state: RootState) => state.app.activeNoteId;
export const selectReportingNoteId = (state: RootState) => state.app.reportingNoteId;
export const selectSharingNoteId = (state: RootState) => state.app.sharingNoteId;
