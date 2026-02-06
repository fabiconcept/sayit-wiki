"use client";

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { initializeUser } from '@/store/slices/userSlice';
import { selectUserIsInitialized } from '@/store/selectors';

export default function UserIdInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const isInitialized = useAppSelector(selectUserIsInitialized);

    useEffect(() => {
        if (!isInitialized) {
            dispatch(initializeUser());
        }
    }, [dispatch, isInitialized]);

    return <>{children}</>;
}
