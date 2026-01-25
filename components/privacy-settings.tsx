"use client";
import { cn, removeSearchParam } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { useMemo, useRef, useState } from "react";
import WoodenPlatform from "./WoodenPlatform";
import { AnimateIcon } from "./animate-ui/icons/icon";
import { XIcon } from "./animate-ui/icons/x";
import useShortcuts, { KeyboardKey } from "@useverse/useshortcuts";
import { ResponsiveModal } from "./ui/responsive-modal";
import searchParamsKeys from "@/constants/search-params";
import { SettingsIcon } from "./animate-ui/icons/settings";
import { ModerationLevel } from "@useverse/profanity-guard";
import Lottie, { LottieRefCurrentProps } from "lottie-react";
import strictAnimation from "./lottie/Kissing.json";
import moderateAnimation from "./lottie/Cowboy Hat Face.json";
import relaxedAnimation from "./lottie/Anxious Face with Sweat.json";
import offAnimation from "./lottie/Animated Clown Face.json";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setModerationLevel } from "@/store/slices/appSlice";
import { selectModerationLevel } from "@/store/selectors";
import { Kbd, KbdGroup } from "./ui/kbd";

export const ModerationInfo: Record<
    ModerationLevel,
    { desc: string; tooltip: string }
> = {
    [ModerationLevel.STRICT]: {
        desc: 'Words flagged as strong language, sexual references, harassment, or sensitive topics are hidden within notes. The note itself remains visible, but more words may be masked to reduce exposure to intense or explicit language.',
        tooltip: 'Maximum word filtering for a cleaner reading experience.'
    },

    [ModerationLevel.MODERATE]: {
        desc: 'Words associated with harassment, explicit sexual language, or disturbing themes are hidden. Most expressive writing remains readable while filtering out commonly unwanted terms.',
        tooltip: 'A balanced level of word filtering for most readers.'
    },

    [ModerationLevel.RELAXED]: {
        desc: 'Only words marked as extreme or clearly harmful are hidden. Casual profanity and emotional language are usually left untouched.',
        tooltip: 'Light filtering with minimal interruption.'
    },

    [ModerationLevel.OFF]: {
        desc: 'No word filtering is applied. All notes are shown exactly as written, without masking any language.',
        tooltip: 'Completely unfiltered text.'
    }
};



interface LottieCardProps {
    lottieRef: React.RefObject<LottieRefCurrentProps>;
    animationData: unknown;
    isSelected: boolean;
    onClick: () => void;
    className?: string;
    reverseOnExit?: boolean;
    playOnce?: boolean;
}

function LottieCard({
    lottieRef,
    animationData,
    isSelected,
    onClick,
    className,
    reverseOnExit = true,
    playOnce = false
}: LottieCardProps) {
    const [isActive, setIsActive] = useState(false);

    const handleInteractionStart = () => {
        if (!lottieRef.current) return;

        setIsActive(true);
        lottieRef.current.setDirection(1);
        lottieRef.current.play();
    };

    const handleInteractionEnd = () => {
        if (!lottieRef.current || playOnce || !reverseOnExit) return;

        setIsActive(false);
        lottieRef.current.setDirection(-1);
        lottieRef.current.play();
    };

    const shouldHandleHover = 'both';
    const shouldHandleTap = "both";

    const interactionProps = {
        ...(shouldHandleHover && {
            onMouseEnter: handleInteractionStart,
            onMouseLeave: handleInteractionEnd,
        }),
        ...(shouldHandleTap && {
            onClick: () => {
                if (isActive) {
                    handleInteractionEnd();
                } else {
                    handleInteractionStart();
                }
                onClick();
            },
        }),
    };

    // If not handling tap, pass onClick separately
    const finalProps = shouldHandleTap
        ? interactionProps
        : { ...interactionProps, onClick };

    return (
        <WoodenPlatform
            className={cn(
                "aspect-square cursor-pointer hover:saturate-150 hover:brightness-110 active:scale-95 rounded-full w-full drop-shadow-[-10px_-10px_5px_rgba(0,0,0,0.0.25),0_0_1px_rgba(0,0,0,0.0.5)]",
                isSelected ? "selected active saturate-150 brightness-110 grayscale-0" : "saturate-100 grayscale-75"
            )}
            {...finalProps}
            noScrews
        >
            <div className="wooden h-full p-1 flex border-2 border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                <div
                    className={cn(
                        "rounded-full p-1 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex sm:items-center items-start sm:gap-2 gap-3 overflow-hidden"
                    )}
                >
                    <div className={cn("w-full h-full bg-blue-600 rounded-full", className)}>
                        <Lottie
                            lottieRef={lottieRef}
                            animationData={animationData}
                            autoplay={isSelected}
                            loop={isSelected}
                            className="size-full"
                        />
                    </div>
                </div>
            </div>
        </WoodenPlatform>
    );
}

export default function PrivacySettings() {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const isPrivacySettingsOpen = useMemo(() => searchParams.get(searchParamsKeys.PRIVACY_SETTINGS) === "true", [searchParams]);
    const moderationLevel = useAppSelector(selectModerationLevel);

    const lottieOffRef = useRef<LottieRefCurrentProps>(null);
    const lottieRelaxedRef = useRef<LottieRefCurrentProps>(null);
    const lottieModerateRef = useRef<LottieRefCurrentProps>(null);
    const lottieStrictRef = useRef<LottieRefCurrentProps>(null);

    const handleModerationLevelChange = (level: ModerationLevel) => {
        localStorage.setItem("moderation-level", level);
        dispatch(setModerationLevel(level));
    };

    useShortcuts({
        shortcuts: [
            {
                key: KeyboardKey.KeyN,
                ctrlKey: true,
                enabled: isPrivacySettingsOpen,
            }
        ],
        onTrigger: (key) => {
            switch (key.key) {
                case KeyboardKey.KeyN:
                    removeSearchParam(searchParamsKeys.PRIVACY_SETTINGS);
                    break;
            }
        }
    }, [isPrivacySettingsOpen]);

    return (
        <ResponsiveModal
            desktopModalType="dialog"
            header={
                <>
                    {/* Note Header */}
                    <DialogHeader>
                        <WoodenPlatform
                            className="h-fit w-full mx-auto rounded-lg drop-shadow-[-10px_-10px_5px_rgba(0,0,0,0.0.25),0_0_1px_rgba(0,0,0,0.0.5)] group-hover:translate-x-2"
                            style={{ transition: "all 0.3s ease-in-out" }}
                            noScrews
                        >
                            <div className="wooden p-0.5 flex border-2 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                <div
                                    className={cn(
                                        "rounded-sm p-3 pr-5 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex items-center justify-between gap-1"
                                    )}
                                >
                                    <AnimateIcon
                                        animateOnHover="wiggle"
                                        loop={true}
                                        className="flex-1"
                                    >
                                        <DialogTitle className="text-start text-lg font-bold drop-shadow-[0_0_10px_rgba(0,0,0,0.25),0_0_1px_rgba(0,0,0,0.9)] flex items-center">
                                            <SettingsIcon strokeWidth={2.5} className="size-6 text-white" />
                                            <span className="px-3">Privacy Settings</span>
                                        </DialogTitle>
                                    </AnimateIcon>
                                    <AnimateIcon
                                        animateOnHover="wiggle"
                                        loop={true}
                                        className="translate-y-0.5"
                                    >
                                        <DialogClose className="cursor-pointer active:scale-95 transition-all duration-150 ease-in-out">
                                            <XIcon strokeWidth={4} className="size-5 text-white hover:text-destructive" />
                                        </DialogClose>
                                    </AnimateIcon>
                                </div>
                            </div>
                        </WoodenPlatform>
                        <DialogDescription>

                        </DialogDescription>
                    </DialogHeader>
                    {/* Hinge */}
                    <div className="flex gap-10 justify-around absolute top-11 translate-y-1 z-30 w-full">
                        <div
                            className="wooden origin-bottom group-hover:rotate-3 h-12 w-5 drop-shadow-[0_0_10px_rgba(0,0,0,0.25),0_0_1px_rgba(0,0,0,0.9)]"
                            style={{ transition: "all 0.3s ease-in-out" }}
                        >
                            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 z-20 perspective-distant">
                                <div style={{ transition: "all 0.3s ease-in-out" }} className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                                    <div className="nut relative z-20">
                                        <div className="nut-outer">
                                            <div className="nut-inner h-3.5 w-3.5 rough-texture">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 z-20 perspective-distant">
                                <div style={{ transition: "all 0.3s ease-in-out" }} className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                                    <div className="nut relative z-20">
                                        <div className="nut-outer">
                                            <div className="nut-inner h-3.5 w-3.5 rough-texture">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="wooden origin-bottom group-hover:rotate-3 h-12 w-5 drop-shadow-[0_0_10px_rgba(0,0,0,0.25),0_0_1px_rgba(0,0,0,0.9)]"
                            style={{ transition: "all 0.3s ease-in-out" }}
                        >
                            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 z-20 perspective-distant">
                                <div style={{ transition: "all 0.3s ease-in-out" }} className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                                    <div className="nut relative z-20">
                                        <div className="nut-outer">
                                            <div className="nut-inner h-3.5 w-3.5 rough-texture">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 z-20 perspective-distant">
                                <div style={{ transition: "all 0.3s ease-in-out" }} className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                                    <div className="nut relative z-20">
                                        <div className="nut-outer">
                                            <div className="nut-inner h-3.5 w-3.5 rough-texture">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            }
            open={isPrivacySettingsOpen}
            onOpenChange={(open) => {
                if (!open) {
                    removeSearchParam(searchParamsKeys.PRIVACY_SETTINGS);
                }
            }}
            className="max-h-[90dvh] sm:w-[90dvw] text-white group"
        >
            {/* Note Content */}
            <WoodenPlatform className="w-full h-full flex flex-col rounded-2xl overflow-hidden -mt-1" noScrews>
                <div className="p-1 flex h-full border-4 border-background/0 gap-3 relative z-10 rounded-2xl shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)] overflow-hidden">
                    <div className={cn(
                        "wooden rounded-2xl w-full max-h-[80dvh] overflow-y-auto flex flex-col"
                    )}>
                        {/* Card Content */}
                        <div className="grid md:grid-cols-4 grid-cols-2 gap-2 px-5 py-3 mt-3">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="relative w-full flex flex-col items-center gap-2">
                                        {moderationLevel === ModerationLevel.STRICT && (
                                            <div className="absolute animate-in slide-in-from-top-full -top-1 -translate-x-1/2 left-1/2 z-20 perspective-distant">
                                                <div className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                                                    <div className="nut relative z-20">
                                                        <div className="nut-outer">
                                                            <div className="nut-inner h-5 w-5 rough-texture" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <LottieCard
                                            lottieRef={lottieStrictRef as React.RefObject<LottieRefCurrentProps>}
                                            animationData={strictAnimation}
                                            isSelected={moderationLevel === ModerationLevel.STRICT}
                                            onClick={() => handleModerationLevelChange(ModerationLevel.STRICT)}
                                            reverseOnExit
                                        />
                                        <div className="w-full">
                                            <WoodenPlatform
                                                className={cn(
                                                    "h-fit w-full rounded-full drop-shadow-[-10px_-10px_5px_rgba(0,0,0,0.0.25),0_0_1px_rgba(0,0,0,0.0.5)]",
                                                    moderationLevel === ModerationLevel.STRICT ? "selected active saturate-150 brightness-110 grayscale-0" : ""
                                                )}
                                                noScrews
                                            >
                                                <div className="wooden h-full p-1 flex border border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                                    <div
                                                        className={cn(
                                                            "rounded-full px-2 py-1 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex items-center justify-center text-center"
                                                        )}
                                                    >
                                                        <span className={cn("text-white py-1 md:text-xs text-[12px] capitalize")}>
                                                            Strict mode <KbdGroup><Kbd className="bg-black/50 text-white">S</Kbd></KbdGroup>
                                                        </span>
                                                    </div>
                                                </div>
                                            </WoodenPlatform>
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-32">
                                    <p>{ModerationInfo[ModerationLevel.STRICT].tooltip}</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="relative w-full flex flex-col items-center gap-2">
                                        {moderationLevel === ModerationLevel.MODERATE && (
                                            <div className="absolute animate-in slide-in-from-top-full -top-1 -translate-x-1/2 left-1/2 z-20 perspective-distant">
                                                <div className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                                                    <div className="nut relative z-20">
                                                        <div className="nut-outer">
                                                            <div className="nut-inner h-5 w-5 rough-texture" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <LottieCard
                                            lottieRef={lottieModerateRef as React.RefObject<LottieRefCurrentProps>}
                                            animationData={moderateAnimation}
                                            className="p-2"
                                            isSelected={moderationLevel === ModerationLevel.MODERATE}
                                            onClick={() => handleModerationLevelChange(ModerationLevel.MODERATE)}
                                            reverseOnExit
                                        />
                                        <div className="w-full">
                                            <WoodenPlatform
                                                className={cn(
                                                    "h-fit w-full rounded-full drop-shadow-[-10px_-10px_5px_rgba(0,0,0,0.0.25),0_0_1px_rgba(0,0,0,0.0.5)]",
                                                    moderationLevel === ModerationLevel.MODERATE ? "selected active saturate-150 brightness-110 grayscale-0" : ""
                                                )}
                                                noScrews
                                            >
                                                <div className="wooden h-full p-1 flex border border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                                    <div
                                                        className={cn(
                                                            "rounded-full px-2 py-1 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex items-center justify-center text-center"
                                                        )}
                                                    >
                                                        <span className={cn("text-white py-1 md:text-xs text-[12px] capitalize")}>
                                                            Moderate Mode <KbdGroup><Kbd className="bg-black/50 text-white">M</Kbd></KbdGroup>
                                                        </span>
                                                    </div>
                                                </div>
                                            </WoodenPlatform>
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-32">
                                    <p>{ModerationInfo[ModerationLevel.MODERATE].tooltip}</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="relative w-full flex flex-col items-center gap-2">
                                        {moderationLevel === ModerationLevel.RELAXED && (
                                            <div className="absolute animate-in slide-in-from-top-full -top-1 -translate-x-1/2 left-1/2 z-20 perspective-distant">
                                                <div className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                                                    <div className="nut relative z-20">
                                                        <div className="nut-outer">
                                                            <div className="nut-inner h-5 w-5 rough-texture" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <LottieCard
                                            lottieRef={lottieRelaxedRef as React.RefObject<LottieRefCurrentProps>}
                                            animationData={relaxedAnimation}
                                            isSelected={moderationLevel === ModerationLevel.RELAXED}
                                            onClick={() => handleModerationLevelChange(ModerationLevel.RELAXED)}
                                            reverseOnExit
                                        />
                                        <div className="w-full">
                                            <WoodenPlatform
                                                className={cn(
                                                    "h-fit w-full rounded-full drop-shadow-[-10px_-10px_5px_rgba(0,0,0,0.0.25),0_0_1px_rgba(0,0,0,0.0.5)]",
                                                    moderationLevel === ModerationLevel.RELAXED ? "selected active saturate-150 brightness-110 grayscale-0" : ""
                                                )}
                                                noScrews
                                            >
                                                <div className="wooden h-full p-1 flex border border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                                    <div
                                                        className={cn(
                                                            "rounded-full px-2 py-1 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex items-center justify-center text-center"
                                                        )}
                                                    >
                                                        <span className={cn("text-white py-1 md:text-xs text-[12px] capitalize")}>
                                                            Relaxed Mode <KbdGroup><Kbd className="bg-black/50 text-white">R</Kbd></KbdGroup>
                                                        </span>
                                                    </div>
                                                </div>
                                            </WoodenPlatform>
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-32">
                                    <p>{ModerationInfo[ModerationLevel.RELAXED].tooltip}</p>
                                </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="relative w-full flex flex-col items-center gap-2">
                                        {moderationLevel === ModerationLevel.OFF && (
                                            <div className="absolute animate-in slide-in-from-top-full -top-1 -translate-x-1/2 left-1/2 z-20 perspective-distant">
                                                <div className="drop-shadow-[0_0_3px_rgba(0,0,0,0.0.5),0_0_1px_rgba(0,0,0,1)] group-hover:rotate-10">
                                                    <div className="nut relative z-20">
                                                        <div className="nut-outer">
                                                            <div className="nut-inner h-5 w-5 rough-texture" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <LottieCard
                                            lottieRef={lottieOffRef as React.RefObject<LottieRefCurrentProps>}
                                            animationData={offAnimation}
                                            isSelected={moderationLevel === ModerationLevel.OFF}
                                            onClick={() => handleModerationLevelChange(ModerationLevel.OFF)}
                                            reverseOnExit
                                        />
                                        <div className="w-full">
                                            <WoodenPlatform
                                                className={cn(
                                                    "h-fit w-full rounded-full drop-shadow-[-10px_-10px_5px_rgba(0,0,0,0.0.25),0_0_1px_rgba(0,0,0,0.0.5)]",
                                                    moderationLevel === ModerationLevel.OFF ? "selected active saturate-150 brightness-110 grayscale-0" : ""
                                                )}
                                                noScrews
                                            >
                                                <div className="wooden h-full p-1 flex border border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                                    <div
                                                        className={cn(
                                                            "rounded-full px-2 py-1 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex items-center justify-center text-center"
                                                        )}
                                                    >
                                                        <span className={cn("text-white py-1 md:text-xs text-[12px] capitalize")}>
                                                            Free For All <KbdGroup><Kbd className="bg-black/50 text-white">F</Kbd></KbdGroup>
                                                        </span>
                                                    </div>
                                                </div>
                                            </WoodenPlatform>
                                        </div>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-32">
                                    <p>{ModerationInfo[ModerationLevel.OFF].tooltip}</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        {/* Separator */}
                        <div className="h-2 w-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_-2px_2px_rgba(0,0,0,0.4)] my-3" />

                        {/* Full description */}
                        <div className="p-2">
                            <WoodenPlatform
                                className="h-fit w-full rounded-lg drop-shadow-[-10px_-10px_5px_rgba(0,0,0,0.0.25),0_0_1px_rgba(0,0,0,0.0.5)]"
                                noScrews
                            >
                                <div className="wooden h-full p-1 flex border-2 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                    <div
                                        className={cn(
                                            "rounded-sm px-4 py-2 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex sm:items-center items-start sm:gap-2 gap-3"
                                        )}
                                    >
                                        <span className={cn("text-white py-1 md:text-sm text-xs DarkerGrotesque")}>
                                            {ModerationInfo[moderationLevel].desc}
                                        </span>
                                    </div>
                                </div>
                            </WoodenPlatform>
                        </div>
                    </div>
                </div>
            </WoodenPlatform>
        </ResponsiveModal>
    )
}