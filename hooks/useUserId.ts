import { useEffect, useState } from 'react';
import { getUserId, hasUserId } from '@/lib/userId';

export function useUserId() {
    const [userId, setUserId] = useState<string>('');
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const id = getUserId();
        setUserId(id);
        setIsInitialized(true);
    }, []);

    return {
        userId,
        isInitialized,
        hasUserId: hasUserId(),
    };
}
