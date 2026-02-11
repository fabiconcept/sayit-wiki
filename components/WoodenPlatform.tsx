import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";

export default function WoodenPlatform({ children, className, style, noScrews = false, onClick }: { children: React.ReactNode, className?: string, style?: React.CSSProperties, noScrews?: false | true | "two", onClick?: () => void }) {
    const isMobile = useIsMobile();
    
    return (
        <>
            <div className={cn("w-fit h-full relative rounded-full overflow-hidden group", className)} style={style} onClick={onClick}>
                <div className="absolute top-0 left-0 h-full w-full z-0">
                    {isMobile ? (
                        // Lightweight CSS background for mobile
                        <div 
                            className="w-full h-full"
                            style={{
                                background: `
                                    repeating-linear-gradient(
                                        90deg,
                                        transparent,
                                        transparent 3px,
                                        rgba(0, 0, 0, 0.02) 3px,
                                        rgba(0, 0, 0, 0.02) 6px
                                    ),
                                    repeating-linear-gradient(
                                        0deg,
                                        #BA8C63,
                                        #BA8C63 12px,
                                        #B8895F 12px,
                                        #B8895F 24px
                                    ),
                                    linear-gradient(
                                        135deg,
                                        rgba(0, 0, 0, 0.03) 0%,
                                        transparent 50%,
                                        rgba(255, 255, 255, 0.02) 100%
                                    )
                                `,
                                backgroundColor: '#BA8C63'
                            }}
                        />
                    ) : (
                        // Original SVG filter for desktop
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-[120%] object-contain">
                            <filter id="filter">
                                <feTurbulence baseFrequency=".002 .02" numOctaves="9" result="n" />
                                <feDiffuseLighting surfaceScale="9" lightingColor="#BA8C63">
                                    <feDistantLight elevation="60" azimuth="-90" />
                                </feDiffuseLighting>
                                <feDisplacementMap in2="n" scale="10" />
                            </filter>
                            <rect width="100%" height="100%" filter="url(#filter)" />
                        </svg>
                    )}
                </div>
                {!noScrews && <>
                    <div className="absolute top-2 left-1.5 z-20 perspective-distant">
                        <div className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                            <div className="nut relative z-20">
                                <div className="nut-outer">
                                    <div className="nut-inner h-3.5 w-3.5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-2 left-1.5 z-20 perspective-[50px]">
                        <div className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                            <div className="nut relative z-20">
                                <div className="nut-outer">
                                    <div className="nut-inner h-3.5 w-3.5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-2 right-1.5 z-20 perspective-[50px]">
                        <div className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                            <div className="nut relative z-20">
                                <div className="nut-outer">
                                    <div className="nut-inner h-3.5 w-3.5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-2 right-1.5 z-20 perspective-[50px]">
                        <div className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                            <div className="nut relative z-20">
                                <div className="nut-outer">
                                    <div className="nut-inner h-3.5 w-3.5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>}
                {children}
            </div>
            {!noScrews || noScrews === "two" && <>
                <div className="absolute top-1/2 -translate-y-1/2 -left-1 z-20 perspective-distant">
                    <div className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                        <div className="nut relative z-20">
                            <div className="nut-outer">
                                <div className="nut-inner h-3.5 w-3.5 rough-texture">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 z-20 perspective-[50px]">
                    <div className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                        <div className="nut relative z-20">
                            <div className="nut-outer">
                                <div className="nut-inner h-3.5 w-3.5 rough-texture">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>}
        </>
    )
}