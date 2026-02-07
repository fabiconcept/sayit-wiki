"use client";

import { useEffect } from "react";
import WoodenPlatform from "@/components/WoodenPlatform";
import useSoundEffect from "@useverse/usesoundeffect";
import { useTheme } from "next-themes";

export default function NotFound() {
    const { theme } = useTheme();
    useEffect(() => {
        document.title = "404 - Page Not Found | SayIt Wiki";
    }, []);
    const notFoundSound = useSoundEffect("/sayit-wiki-sound/404.mp3", {
        volume: 0.6,
        loop: true
    });

    useEffect(() => {
        if (notFoundSound) {
            notFoundSound.play();
        }
    }, [notFoundSound]);

    return (
        <div className="min-h-dvh w-full flex flex-col items-center justify-center p-4">
            <WoodenPlatform
                className="w-fit max-w-2xl rounded-3xl drop-shadow-[0_0_10px_rgba(0,0,0,0.7)]"
                noScrews
            >
                <div className="md:px-12 px-6 md:py-16 py-10 flex flex-col items-center gap-8 border-8 border-background/0 relative z-10 rounded-3xl shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]">
                    {theme !== "dark" && <div className="absolute inset-0 rounded-3xl bg-foreground"></div>}
                    <div className="absolute wooden inset-0 rounded-3xl not-dark:opacity-70 opacity-100 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]" />

                    {/* Loader Animation */}
                    <div id="loader" className="loader mix-blend-screen max-sm:scale-75 animate-bounce" />

                    {/* 404 Message */}
                    <div className="relative z-10 text-center space-y-4">
                        <h1 className="md:text-6xl text-4xl font-bold text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                            404
                        </h1>
                        <h2 className="md:text-3xl text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                            Page Not Found
                        </h2>
                        <br />
                        <p className="md:text-sm text-xs text-white/80 max-w-sm drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                            🎵 Did you hear that? That's the sound of a missing page! 🎵
                            <br />
                            Maybe it was blown away by the wind?
                        </p>
                    </div>
                </div>
            </WoodenPlatform>
        </div>
    );
}
