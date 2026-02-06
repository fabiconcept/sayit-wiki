'use client';

import { useState } from 'react';
import { Provider } from 'react-redux';
import { makeStore } from './store';
import UserIdInitializer from '@/components/UserIdInitializer';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
    const [store] = useState(() => makeStore());

    return (
        <Provider store={store}>
            <UserIdInitializer>
                {children}
            </UserIdInitializer>
        </Provider>
    );
}