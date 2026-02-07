"use client";

import WoodenPlatform from "@/components/WoodenPlatform";
import Lottie from "lottie-react";
import emptyAnimation from "@/components/lottie/ghosty.json";
import { useTheme } from "next-themes";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const { theme } = useTheme();
    return (
        <div className="min-h-dvh w-full flex flex-col items-center justify-center p-4">
            <WoodenPlatform
                className="w-fit max-w-2xl rounded-3xl drop-shadow-[0_0_30px_rgba(0,0,0,0.3)]"
                noScrews
            >
                <div className="md:px-12 px-6 md:py-16 py-10 flex flex-col items-center gap-8 border-8 border-background/0 relative z-10 rounded-3xl shadow-[inset_2px_2px_2px_rgba(0,0,0,1),inset_-2px_-2px_10px_rgba(0,0,0,1)]">
                    {theme !== "dark" && <div className="absolute inset-0 rounded-3xl bg-foreground"></div>}
                    <div className="absolute wooden inset-0 not-dark:opacity-70 opacity-100 shadow-[inset_2px_2px_2px_rgba(0,0,0,1),inset_-2px_-2px_10px_rgba(0,0,0,1)] rounded-3xl"></div>
                    <Lottie
                        animationData={emptyAnimation}
                        loop={true}
                        className="sm:size-40 size-24"
                        style={{ mixBlendMode: "screen" }}
                    />
                    <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-2xl relative z-10 font-bold">Maintenance Mode</p>
                        <p className="text-sm relative z-10 text-white/80 px-10 text-center">We're currently performing maintenance on the server. Please check back later.</p>
                    </div>
                </div>
            </WoodenPlatform>
        </div>
    );
}
