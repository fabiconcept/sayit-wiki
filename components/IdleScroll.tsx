'use client';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { useEffect, useRef, useState } from 'react';

export default function IdleScroll() {
    const isMobile = useIsMobile();
    
    const IDLE_DELAY = isMobile ? 5000 : 10000;
    const INITIAL_DELAY = isMobile ? 2000 : 5000;
    const SCROLL_INTERVAL = isMobile ? 2000 : 5000;
    const COUNTDOWN_DURATION = IDLE_DELAY + (isMobile ? 7000 : 4000);
    const MAX_COUNTDOWN = COUNTDOWN_DURATION / 1000; 
    
    // Refs for timers and state
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const scrollDirectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hideCountdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const autoScrollStartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Refs for scroll state
    const isScrollingRef = useRef(false);
    const directionRef = useRef<'down' | 'up'>('down');
    const idleStartTimeRef = useRef<number>(0);

    // React state
    const [countdown, setCountdown] = useState<number>(0);
    const [isIdle, setIsIdle] = useState(false);

    useEffect(() => {

        // Cleanup all timers
        const cleanupAllTimers = () => {
            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
            if (scrollIntervalRef.current) {
                clearInterval(scrollIntervalRef.current);
                scrollIntervalRef.current = null;
            }
            if (countdownIntervalRef.current) {
                clearInterval(countdownIntervalRef.current);
                countdownIntervalRef.current = null;
            }
            if (scrollDirectionTimeoutRef.current) {
                clearTimeout(scrollDirectionTimeoutRef.current);
                scrollDirectionTimeoutRef.current = null;
            }
            if (hideCountdownTimeoutRef.current) {
                clearTimeout(hideCountdownTimeoutRef.current);
                hideCountdownTimeoutRef.current = null;
            }
            if (autoScrollStartTimeoutRef.current) {
                clearTimeout(autoScrollStartTimeoutRef.current);
                autoScrollStartTimeoutRef.current = null;
            }
        };

        const startCountdown = () => {
            idleStartTimeRef.current = Date.now();
            setIsIdle(true);

            countdownIntervalRef.current = setInterval(() => {
                const elapsed = Date.now() - idleStartTimeRef.current;
                const remaining = Math.max(0, COUNTDOWN_DURATION - elapsed);
                setCountdown(Math.ceil(remaining / 1000));

                if (remaining <= 0) {
                    if (countdownIntervalRef.current) {
                        clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                    }
                    hideCountdownTimeoutRef.current = setTimeout(() => {
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
            if (hideCountdownTimeoutRef.current) {
                clearTimeout(hideCountdownTimeoutRef.current);
                hideCountdownTimeoutRef.current = null;
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

                scrollDirectionTimeoutRef.current = setTimeout(() => {
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
            if (scrollDirectionTimeoutRef.current) {
                clearTimeout(scrollDirectionTimeoutRef.current);
                scrollDirectionTimeoutRef.current = null;
            }
            isScrollingRef.current = false;
        };

        const resetIdleTimer = () => {
            stopAutoScroll();
            stopCountdown();

            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
                idleTimerRef.current = null;
            }
            if (autoScrollStartTimeoutRef.current) {
                clearTimeout(autoScrollStartTimeoutRef.current);
                autoScrollStartTimeoutRef.current = null;
            }

            idleTimerRef.current = setTimeout(() => {
                startCountdown();
                
                autoScrollStartTimeoutRef.current = setTimeout(() => {
                    startAutoScroll();
                }, IDLE_DELAY);
            }, INITIAL_DELAY);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'] as const;
        
        events.forEach(event => {
            document.addEventListener(event, resetIdleTimer, { passive: true });
        });

        resetIdleTimer();

        return () => {
            events.forEach(event => {
                document.removeEventListener(event, resetIdleTimer);
            });
            cleanupAllTimers();
            isScrollingRef.current = false;
        };
    }, [isMobile, IDLE_DELAY, INITIAL_DELAY, SCROLL_INTERVAL, COUNTDOWN_DURATION]);

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
                    strokeDashoffset={2 * Math.PI * 25 * (1 - countdown / MAX_COUNTDOWN)}
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