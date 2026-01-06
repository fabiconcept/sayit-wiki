"use client";
import { useState, useEffect } from "react";

export function useResized() {
    const [windowSize, setWindowSize] = useState({
        width: 0,
        height: 0,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        // Set initial size on mount
        handleResize();

        // Listen for resize events
        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowSize;
}