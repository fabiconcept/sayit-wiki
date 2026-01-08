import { cn } from "@/lib/utils";
import { NoteStyle } from "@/types/note";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export enum ClipType {
    PIN = "pin",
    Screw = "x-1",
    Screw2 = "x-2",
    Screw4 = "x-4",
    Staple = "staple",
}

interface ClipProps {
    type?: ClipType;
    className?: string;
}

interface SkewXProps extends ClipProps {
    type: ClipType.Screw | ClipType.Screw2 | ClipType.Screw4 | ClipType.Staple;
    init: 0 | 1;
    noteStyle: NoteStyle
}

type PropType = ClipProps | SkewXProps;

export default function Clip({ className, ...props }: PropType) {
    return (
        <TooltipProvider>
            {(() => {
                switch (props.type) {
                    case ClipType.PIN:
                        return <Pin className={className} />
                    case ClipType.Screw:
                        return <ScrewX {...props as SkewXProps} className={className} />
                    case ClipType.Screw2:
                        return <ScrewX2 {...props as SkewXProps} className={className} />
                    case ClipType.Screw4:
                        return <ScrewX4 {...props as SkewXProps} className={className} />
                    case ClipType.Staple:
                        return <Staple {...props as SkewXProps} className={className} />
                    default:
                        return null;
                }
            })()}
        </TooltipProvider>
    );
}

const Pin = ({ className }: { className?: string }) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className={cn("pin -top-5 right-1/3 -translate-x-1 h-16 w-14 scale-75", className)}>
                    <div className="shadow"></div>
                    <div className="metal"></div>
                    <div className="bottom-circle"></div>
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>📌 Classic & pointy</p>
            </TooltipContent>
        </Tooltip>
    )
}

const ScrewX2 = ({ className, init = 0, noteStyle }: { className?: string, init?: 0 | 1, noteStyle: NoteStyle }) => {
    return (
        <div className={cn("", className)}>
            {/* Top Left */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "group-hover:opacity-100 opacity-0 absolute left-1.5 z-20",
                        noteStyle === NoteStyle.CURVED_TOP ? init === 0 ? "opacity-100" : "opacity-0" : init === 1 ? "opacity-100" : "opacity-0",
                        noteStyle === NoteStyle.CURVED_TOP ? "bottom-2" : "top-2",
                        (noteStyle === NoteStyle.FOLDED_CORNER_TL || noteStyle === NoteStyle.TORN_TOP || noteStyle === NoteStyle.TORN_LEFT) ? "opacity-100" : ""
                    )}>
                        <div className={cn(
                            "drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)]",
                        )}>
                            <div className="nut relative z-20">
                                <div className="nut-outer">
                                    <div className="nut-inner h-3.5 w-3.5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>🔩 Left corner</p>
                </TooltipContent>
            </Tooltip>

            {/* Top Right */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "group-hover:opacity-100 opacity-0 absolute right-1.5 z-20",
                        noteStyle === NoteStyle.CURVED_TOP ? init === 1 ? "opacity-100" : "opacity-0" : init === 0 ? "opacity-100" : "opacity-0",
                        noteStyle === NoteStyle.CURVED_TOP ? "bottom-2" : "top-2",
                        (noteStyle === NoteStyle.FOLDED_CORNER_TL || noteStyle === NoteStyle.TORN_TOP || noteStyle === NoteStyle.TORN_LEFT) ? "opacity-100" : ""
                    )}>
                        <div className={cn(
                            "drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)]",
                        )}>
                            <div className="nut relative z-20">
                                <div className="nut-outer">
                                    <div className="nut-inner h-3.5 w-3.5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>🔩 Right corner</p>
                </TooltipContent>
            </Tooltip>
        </div>
    )
}

const ScrewX = ({ className, init = 0, noteStyle }: { className?: string, init?: 0 | 1, noteStyle: NoteStyle }) => {
    return (
        <div className={cn("", className)}>
            {/* Top Left */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "opacity-0 absolute left-1.5 z-20",
                        noteStyle === NoteStyle.CURVED_TOP ? init === 0 ? "opacity-100" : "opacity-0" : init === 1 ? "opacity-100" : "opacity-0",
                        noteStyle === NoteStyle.CURVED_TOP ? "bottom-2" : "top-2",
                        (noteStyle === NoteStyle.FOLDED_CORNER_TL || noteStyle === NoteStyle.TORN_TOP || noteStyle === NoteStyle.TORN_LEFT) ? "opacity-100" : ""
                    )}>
                        <div className={cn(
                            "drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)]",
                        )}>
                            <div className="nut relative z-20">
                                <div className="nut-outer">
                                    <div className="nut-inner h-3.5 w-3.5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>🔩 Solo left</p>
                </TooltipContent>
            </Tooltip>

            {/* Top Right */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "opacity-0 absolute right-1.5 z-20",
                        noteStyle === NoteStyle.CURVED_TOP ? init === 1 ? "opacity-100" : "opacity-0" : init === 0 ? "opacity-100" : "opacity-0",
                        noteStyle === NoteStyle.CURVED_TOP ? "bottom-2" : "top-2",
                        (noteStyle === NoteStyle.FOLDED_CORNER_TL || noteStyle === NoteStyle.TORN_TOP || noteStyle === NoteStyle.TORN_LEFT) ? "opacity-100" : ""
                    )}>
                        <div className={cn(
                            "drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)]",

                        )}>
                            <div className="nut relative z-20">
                                <div className="nut-outer">
                                    <div className="nut-inner h-3.5 w-3.5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>🔩 Solo right</p>
                </TooltipContent>
            </Tooltip>
        </div>
    )
}

const ScrewX4 = ({ className, init = 0, noteStyle }: { className?: string, init?: 0 | 1, noteStyle: NoteStyle }) => {
    return (
        <div className={cn("", className)}>
            {/* Top Left */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "group-hover:opacity-100 opacity-0 absolute top-2 left-1.5 z-20",
                        init === 0 ? "opacity-100" : "opacity-0",
                        (noteStyle === NoteStyle.CURVED_TOP || noteStyle === NoteStyle.FOLDED_CORNER_TL || noteStyle === NoteStyle.TORN_TOP || noteStyle === NoteStyle.TORN_LEFT) ? "opacity-100" : ""
                    )}>
                        <div className={cn(
                            "drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)]",
                        )}>
                            <div className="nut relative z-20">
                                <div className="nut-outer">
                                    <div className="nut-inner h-3.5 w-3.5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>🔩 Top-left</p>
                </TooltipContent>
            </Tooltip>

            {/* Bottom Left */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "group-hover:opacity-100 opacity-0 absolute bottom-2 left-1.5 z-20",
                        (noteStyle === NoteStyle.CURVED_BOTTOM || noteStyle === NoteStyle.FOLDED_CORNER_BL || noteStyle === NoteStyle.TORN_BOTTOM || noteStyle === NoteStyle.TORN_LEFT) ? "opacity-100" : "opacity-0"
                    )}>
                        <div className={cn(
                            "drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)]",
                        )}>
                            <div className="nut relative z-20">
                                <div className="nut-outer">
                                    <div className="nut-inner h-3.5 w-3.5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>🔩 Bottom-left</p>
                </TooltipContent>
            </Tooltip>

            {/* Bottom Right */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "group-hover:opacity-100 opacity-0 absolute bottom-2 right-1.5 z-20",
                        (noteStyle === NoteStyle.CURVED_BOTTOM || noteStyle === NoteStyle.FOLDED_CORNER_BR || noteStyle === NoteStyle.TORN_BOTTOM || noteStyle === NoteStyle.TORN_RIGHT) ? "opacity-100" : "opacity-0"
                    )}>
                        <div className={cn(
                            "drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)]",
                        )}>
                            <div className="nut relative z-20">
                                <div className="nut-outer">
                                    <div className="nut-inner h-3.5 w-3.5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>🔩 Bottom-right</p>
                </TooltipContent>
            </Tooltip>

            {/* Top Right */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={cn(
                        "group-hover:opacity-100 opacity-0 absolute top-2 right-1.5 z-20",
                        init === 1 ? "opacity-100" : "opacity-0",
                        (noteStyle === NoteStyle.CURVED_TOP || noteStyle === NoteStyle.FOLDED_CORNER_TR || noteStyle === NoteStyle.TORN_TOP || noteStyle === NoteStyle.TORN_RIGHT) ? "opacity-100" : ""
                    )}>
                        <div className={cn(
                            "drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)]",

                        )}>
                            <div className="nut relative z-20">
                                <div className="nut-outer">
                                    <div className="nut-inner h-3.5 w-3.5">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>🔩 Top-right</p>
                </TooltipContent>
            </Tooltip>
        </div>
    )
}

const Staple = ({ className, noteStyle }: { className?: string, noteStyle: NoteStyle }) => {
    if (noteStyle === NoteStyle.CURVED_TOP) {
        return (
            <div className={cn("", className)}>
                <Tooltip>
                    <TooltipTrigger className="-translate-x-3.5" asChild>
                        <div className="staple absolute top-4 left-1/2 -translate-x-1/2 z-20 flex z-30"></div>
                    </TooltipTrigger>
                    <TooltipContent className="translate-x-4">
                        <p>📎 Stapled!</p>
                    </TooltipContent>
                </Tooltip>
            </div>
        )
    }
    return (
        <div className={cn("", className)}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="staple absolute top-7 left-1.5 z-20 -rotate-[30deg]"></div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>📎 Tilted staple</p>
                </TooltipContent>
            </Tooltip>
        </div>
    )
}