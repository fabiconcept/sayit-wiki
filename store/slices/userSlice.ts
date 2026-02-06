import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getUserId, hasUserId } from '@/lib/userId';

interface UserState {
    userId: string | null;
    isInitialized: boolean;
}

const initialState: UserState = {
    userId: null,
    isInitialized: false,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        initializeUser: (state) => {
            if (typeof window !== 'undefined') {
                const id = getUserId();
                state.userId = id;
                state.isInitialized = true;
            }
        },
        setUserId: (state, action: PayloadAction<string>) => {
            state.userId = action.payload;
            state.isInitialized = true;
        },
    },
});

export const { initializeUser, setUserId } = userSlice.actions;
export default userSlice.reducer;
