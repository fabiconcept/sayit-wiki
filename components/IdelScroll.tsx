'use client';

import { useEffect, useRef } from 'react';

export default function IdelScroll() {
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isScrollingRef = useRef(false);

    useEffect(() => {
        const IDLE_DELAY = 10000; // 3 seconds of inactivity
        const SCROLL_INTERVAL = 5000; // milliseconds

        const startAutoScroll = () => {
            if (isScrollingRef.current) return;

            isScrollingRef.current = true;
            scrollIntervalRef.current = setInterval(() => {
                window.scrollBy({
                    top: window.innerHeight,
                    behavior: 'smooth'
                });
            }, SCROLL_INTERVAL);
        };

        const stopAutoScroll = () => {
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
            }
            isScrollingRef.current = false;
        };

        const resetIdleTimer = () => {
            stopAutoScroll();

            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }

            idleTimerRef.current = setTimeout(() => {
                startAutoScroll();
            }, IDLE_DELAY);
        };

        // Events that indicate user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

        events.forEach(event => {
            document.addEventListener(event, resetIdleTimer, { passive: true });
        });

        // Start the idle timer initially
        resetIdleTimer();

        // Cleanup
        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetIdleTimer);
            });
            stopAutoScroll();
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
        };
    }, []);

    return null; // This component doesn't render anything
}