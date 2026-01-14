'use client';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useEffect, useRef, useState } from 'react';

export default function IdleScroll() {
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isScrollingRef = useRef(false);
    const directionRef = useRef<'down' | 'up'>('down');
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const idleStartTimeRef = useRef<number>(0);
    const isMobile = useIsMobile();

    const [countdown, setCountdown] = useState<number>(0);
    const [isIdle, setIsIdle] = useState(false);

    useEffect(() => {
        const IDLE_DELAY = isMobile ? 5000 : 10000; // 10 seconds of inactivity
        const INITIAL_DELAY = isMobile ? 2000 : 5000; // 5 seconds before countdown starts
        const SCROLL_INTERVAL = isMobile ? 2000 : 5000; // milliseconds

        const startCountdown = () => {
            idleStartTimeRef.current = Date.now();
            setIsIdle(true);

            countdownIntervalRef.current = setInterval(() => {
                const elapsed = Date.now() - idleStartTimeRef.current;
                const remaining = Math.max(0, (IDLE_DELAY + 4500) - elapsed);
                setCountdown(Math.ceil(remaining / 1000));

                if (remaining <= 0) {
                    if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                    }
                    // Hide the countdown indicator after reaching 0
                    setTimeout(() => {
                        setIsIdle(false);
                    }, 100);
                }
            }, 100);
        };

        const stopCountdown = () => {
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
            setIsIdle(false);
            setCountdown(0);
        };

        const startAutoScroll = () => {
            if (isScrollingRef.current) return;
            isScrollingRef.current = true;

            scrollIntervalRef.current = setInterval(() => {
                const windowHeight = window.innerHeight;
                const scrollAmount = directionRef.current === 'down' ? windowHeight : -windowHeight;

                window.scrollBy({
                    top: scrollAmount / (isMobile ? 3 : 2),
                    behavior: 'smooth'
                });

                setTimeout(() => {
                    const newScroll = window.scrollY;
                    const newMaxScroll = document.documentElement.scrollHeight - window.innerHeight;

                    if (directionRef.current === 'down' && newScroll >= newMaxScroll - 50) {
                        directionRef.current = 'up';
                    } else if (directionRef.current === 'up' && newScroll <= 50) {
                        directionRef.current = 'down';
                    }
                }, 1000);
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
            stopCountdown();

            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }

            // Wait 5 seconds before starting countdown
            idleTimerRef.current = setTimeout(() => {
                startCountdown();
                
                // Start auto-scroll after IDLE_DELAY from countdown start
                setTimeout(() => {
                    startAutoScroll();
                }, IDLE_DELAY);
            }, INITIAL_DELAY);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        events.forEach(event => {
            document.addEventListener(event, resetIdleTimer, { passive: true });
        });

        resetIdleTimer();

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetIdleTimer);
            });
            stopAutoScroll();
            stopCountdown();
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
        };
    }, [isMobile]);

    // Show countdown only when idle and countdown is active
    if (!isIdle || countdown === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            width: '60px',
            height: '60px',
            zIndex: 9999,
        }}>
            <svg width="60" height="60" style={{ transform: 'rotate(-90deg)' }}>
                <circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill="none"
                    className='stroke-background/50'
                    strokeWidth="12"
                />
                <circle
                    cx="30"
                    cy="30"
                    r="25"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.75)"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 25}
                    strokeDashoffset={2 * Math.PI * 25 * (1 - countdown / 14.5)}
                    strokeLinecap="round"
                    style={{
                        transition: 'stroke-dashoffset 0.1s linear'
                    }}
                />
            </svg>
            <div
                className='drop-shadow-2xl'
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#ffffff',
                    textAlign: 'center',
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
            >
                {Math.max(1, countdown - 1)}s
            </div>
        </div>
    );
}