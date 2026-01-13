import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ModerationLevel } from '@/lib/moderator';

interface AppState {
    moderationLevel: ModerationLevel;
    isPrivacySettingsOpen: boolean;
    isReportModalOpen: boolean;
    isShareModalOpen: boolean;
    isViewNoteModalOpen: boolean;
    activeNoteId: string | null;
    reportingNoteId: string | null;
    sharingNoteId: string | null;
}

const getInitialModerationLevel = (): ModerationLevel => {
    if (typeof window === 'undefined') return ModerationLevel.MODERATE;
    
    try {
        const stored = localStorage.getItem('moderation-level');
        const valid = Object.values(ModerationLevel).includes(stored as ModerationLevel);
        if (stored && valid) {
            return stored as ModerationLevel;
        }

        throw new Error('No moderation level found in localStorage');
    } catch (error) {
        localStorage.setItem("moderation-level", ModerationLevel.STRICT);
        console.error('Error loading moderation level from localStorage:', error);
        return ModerationLevel.STRICT;
    }
    
    return ModerationLevel.MODERATE;
};

const initialState: AppState = {
    moderationLevel: getInitialModerationLevel(),
    isPrivacySettingsOpen: false,
    isReportModalOpen: false,
    isShareModalOpen: false,
    isViewNoteModalOpen: false,
    activeNoteId: null,
    reportingNoteId: null,
    sharingNoteId: null,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setModerationLevel: (state, action: PayloadAction<ModerationLevel>) => {
            state.moderationLevel = action.payload;
        },
        openPrivacySettings: (state) => {
            state.isPrivacySettingsOpen = true;
        },
        closePrivacySettings: (state) => {
            state.isPrivacySettingsOpen = false;
        },
        openReportModal: (state, action: PayloadAction<string>) => {
            state.isReportModalOpen = true;
            state.reportingNoteId = action.payload;
        },
        closeReportModal: (state) => {
            state.isReportModalOpen = false;
            state.reportingNoteId = null;
        },
        openShareModal: (state, action: PayloadAction<string>) => {
            state.isShareModalOpen = true;
            state.sharingNoteId = action.payload;
        },
        closeShareModal: (state) => {
            state.isShareModalOpen = false;
            state.sharingNoteId = null;
        },
        openViewNoteModal: (state, action: PayloadAction<string>) => {
            state.isViewNoteModalOpen = true;
            state.activeNoteId = action.payload;
        },
        closeViewNoteModal: (state) => {
            state.isViewNoteModalOpen = false;
            state.activeNoteId = null;
        },
        closeAllModals: (state) => {
            state.isPrivacySettingsOpen = false;
            state.isReportModalOpen = false;
            state.isShareModalOpen = false;
            state.isViewNoteModalOpen = false;
            state.activeNoteId = null;
            state.reportingNoteId = null;
            state.sharingNoteId = null;
        },
    },
});

export const {
    setModerationLevel,
    openPrivacySettings,
    closePrivacySettings,
    openReportModal,
    closeReportModal,
    openShareModal,
    closeShareModal,
    openViewNoteModal,
    closeViewNoteModal,
    closeAllModals,
} = appSlice.actions;

export default appSlice.reducer;
