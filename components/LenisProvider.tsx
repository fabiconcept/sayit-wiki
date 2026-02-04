'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

declare global {
    interface Window {
        lenis?: Lenis;
    }
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.8,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.8,
            infinite: false,
            autoResize: true,
            syncTouch: false,
            prevent: (node) => {
                return (
                    node.hasAttribute('data-lenis-prevent') ||
                    node.hasAttribute('data-slot') ||
                    node.closest('[data-lenis-prevent]') !== null ||
                    node.closest('[data-radix-scroll-area-viewport]') !== null ||
                    node.closest('[role="dialog"]') !== null ||
                    node.closest('[role="menu"]') !== null ||
                    node.closest('[data-radix-popper-content-wrapper]') !== null ||
                    node.closest('.overflow-y-auto') !== null ||
                    node.classList.contains('overflow-y-auto')
                );
            },
        });

        window.lenis = lenis;

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            window.lenis = undefined;
        };
    }, []);

    return <>{children}</>;
}
