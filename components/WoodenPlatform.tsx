import { cn } from "@/lib/utils";

export default function WoodenPlatform({ children, className, style, noScrews = false }: { children: React.ReactNode, className?: string, style?: React.CSSProperties, noScrews?: boolean }) {
    return (
        <div className={cn("w-fit h-full relative rounded-full overflow-hidden group", className)} style={style}>
            <div className="absolute top-0 left-0 h-full w-full z-0">
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
    )
}