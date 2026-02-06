import { configureStore } from '@reduxjs/toolkit';
import { api } from './api';
import notesReducer from './slices/notesSlice';
import commentsReducer from './slices/commentsSlice';
import appReducer from './slices/appSlice';
import userReducer from './slices/userSlice';

export const makeStore = () => {
    return configureStore({
        reducer: {
            [api.reducerPath]: api.reducer,
            notes: notesReducer,
            comments: commentsReducer,
            app: appReducer,
            user: userReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(api.middleware),
    });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
