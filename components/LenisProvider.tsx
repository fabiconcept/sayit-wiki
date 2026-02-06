'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

declare global {
    interface Window {
        lenis?: Lenis;
    }
}

export default function LenisProvider({ children }: { children: React.ReactNode }) {
    // useEffect(() => {
    //     const lenis = new Lenis({
    //         duration: 1.2,
    //         easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    //         orientation: 'vertical',
    //         gestureOrientation: 'vertical',
    //         smoothWheel: true,
    //         wheelMultiplier: 0.8,
    //         touchMultiplier: 1.5,
    //         infinite: false,
    //         autoResize: true,
    //         syncTouch: true,
    //         syncTouchLerp: 0.1,
    //         prevent: (node) => {
    //             return (
    //                 node.hasAttribute('data-lenis-prevent') ||
    //                 node.hasAttribute('data-slot') ||
    //                 node.closest('[data-lenis-prevent]') !== null ||
    //                 node.closest('[data-radix-scroll-area-viewport]') !== null ||
    //                 node.closest('[role="dialog"]') !== null ||
    //                 node.closest('[role="menu"]') !== null ||
    //                 node.closest('[data-radix-popper-content-wrapper]') !== null ||
    //                 node.closest('.overflow-y-auto') !== null ||
    //                 node.classList.contains('overflow-y-auto')
    //             );
    //         },
    //     });

    //     window.lenis = lenis;

    //     let rafId: number | null = null;
    //     let isActive = true; // ⭐ Flag to control the loop

    //     function raf(time: number) {
    //         if (!isActive) return; // ⭐ Stop if cleanup ran

    //         lenis.raf(time);
    //         rafId = requestAnimationFrame(raf);
    //     }

    //     rafId = requestAnimationFrame(raf);

    //     return () => {
    //         isActive = false; // ⭐ Set flag first

    //         if (rafId !== null) {
    //             cancelAnimationFrame(rafId); // ⭐ Cancel current frame
    //         }

    //         lenis.destroy();
    //         delete window.lenis; // ⭐ Use delete instead of undefined
    //     };
    // }, []);

    return <>{children}</>;
}