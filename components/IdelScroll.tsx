'use client';

import { useEffect, useRef } from 'react';

export default function IdleScroll() {
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isScrollingRef = useRef(false);
    const directionRef = useRef<'down' | 'up'>('down');

    useEffect(() => {
        const IDLE_DELAY = 10000; // 10 seconds of inactivity
        const SCROLL_INTERVAL = 5000; // milliseconds

        const startAutoScroll = () => {
            if (isScrollingRef.current) return;

            isScrollingRef.current = true;
            scrollIntervalRef.current = setInterval(() => {
                const scrollHeight = document.documentElement.scrollHeight;
                const windowHeight = window.innerHeight / 2;
                const currentScroll = window.scrollY;
                const maxScroll = scrollHeight - windowHeight;

                // Check if we've reached the bottom
                if (directionRef.current === 'down' && currentScroll >= maxScroll - 10) {
                    directionRef.current = 'up';
                }
                // Check if we've reached the top
                else if (directionRef.current === 'up' && currentScroll <= 10) {
                    directionRef.current = 'down';
                }

                // Scroll in the current direction
                const scrollAmount = directionRef.current === 'down' ? windowHeight : -windowHeight;
                window.scrollBy({
                    top: scrollAmount,
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

    return null;
}