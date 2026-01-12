import { Suspense, ReactNode } from 'react';

interface SuspenseWrapperProps {
    children: ReactNode;
    fallback?: ReactNode;
}

export default function SuspenseWrapper({ children, fallback = null }: SuspenseWrapperProps) {
    return <Suspense fallback={fallback}>{children}</Suspense>;
}
