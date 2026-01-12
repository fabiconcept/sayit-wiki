"use client";
import { cn, removeSearchParam } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { useMemo } from "react";
import WoodenPlatform from "./WoodenPlatform";
import { AnimateIcon } from "./animate-ui/icons/icon";
import { XIcon } from "./animate-ui/icons/x";
import notes from "@/constants/mock/notes";
import NoteCard from "./ui/NoteCard";
import useShortcuts, { KeyboardKey } from "@useverse/useshortcuts";
import { MessageCircleWarningIcon } from "./animate-ui/icons/message-circle-warning";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import NeoButton from "./neo-components/NeoButton";
import { PinOffIcon } from "./animate-ui/icons/pin-off";
import { ResponsiveModal } from "./ui/responsive-modal";
import searchParamsKeys from "@/constants/search-params";

export default function ReportNoteModal() {
    const searchParams = useSearchParams();
    const isReportingNote = useMemo(() => Boolean(searchParams.get(searchParamsKeys.NOTE_TO_REPORT)), [searchParams]);

    useShortcuts({
        shortcuts: [
            {
                key: KeyboardKey.Enter,
                ctrlKey: true,
                platformAware: true,
                enabled: isReportingNote,
            }
        ],
        onTrigger: (key) => {
            switch (key.key) {
                case KeyboardKey.Enter:
                    break;
            }
        }
    }, [isReportingNote]);

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
                                            <MessageCircleWarningIcon strokeWidth={2.5} className="size-6 text-destructive" />
                                            <span className="px-3">Wanna report this note?</span>
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
            open={isReportingNote}
            onOpenChange={(open) => {
                if (!open) {
                    removeSearchParam(searchParamsKeys.NOTE_TO_REPORT);
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
                        <div className="mt-4 px-2 pr-3">
                            <NoteCard
                                {...notes[55]}
                                tilt={0}
                                onCommentTap={() => { }}
                                canReact={false}
                                maxWidth="100%"
                            />
                        </div>
                        <div className="h-2 w-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_-2px_2px_rgba(0,0,0,0.4)] mt-3" />

                        <div className="p-3">
                            <WoodenPlatform
                                className="h-fit w-full rounded-lg drop-shadow-[-10px_-10px_5px_rgba(0,0,0,0.0.25),0_0_1px_rgba(0,0,0,0.0.5)]"
                                noScrews
                            >
                                <div className="wooden p-1 flex border-2 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                    <div
                                        className={cn(
                                            "rounded-sm px-4 py-2 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex sm:items-center items-start sm:gap-2 gap-3"
                                        )}
                                    >
                                        <AnimateIcon
                                            animateOnHover="wiggle"
                                            loop={true}
                                            className="max-sm:mt-1.5"
                                        >
                                            <MessageCircleWarningIcon strokeWidth={2} className="sm:size-9 size-7 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />
                                        </AnimateIcon>
                                        <span className={cn("text-white py-1 md:text-sm text-xs")}>
                                            See something off? Report inappropriate content to help keep our wall clean.
                                        </span>
                                    </div>
                                </div>
                            </WoodenPlatform>
                        </div>

                        <div className="w-full px-2">
                            <WoodenPlatform noScrews className="w-full h-fit rounded-3xl drop-shadow-[0_0_20px_rgba(0,0,0,0.0.5),0_0_5px_rgba(0,0,0,0.0.75)]">
                                <div className="px-2 py-2 flex items-center border-8 border-background/0 gap-2 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                    <div className="absolute wooden inset-0 rounded-full m-0 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <AnimateIcon animateOnHover="wiggle" loop={true}>
                                                <NeoButton
                                                    element="div"
                                                    className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3"
                                                    onClick={() => { }}
                                                >
                                                    <div className="flex items-center py-1 gap-2">
                                                        <XIcon
                                                            strokeWidth={2.5} className="w-4 text-black h-4 scale-125" />
                                                    </div>
                                                </NeoButton>
                                            </AnimateIcon>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Cancel report</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger className="flex-1" asChild>
                                            <AnimateIcon animateOnHover="wiggle" loop={true}>
                                                <NeoButton
                                                    element="div"
                                                    className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3"
                                                    onClick={() => { }}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <PinOffIcon
                                                            strokeWidth={2.5} className="sm:w-4 text-black sm:h-4 w-3 h-3 scale-125" />
                                                        <p className="font-semibold text-black">Report note</p>
                                                    </div>
                                                </NeoButton>
                                            </AnimateIcon>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Report note to wall admins</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </WoodenPlatform>
                            <div className="h-6 sm:hidden" />
                        </div>
                    </div>
                </div>
            </WoodenPlatform>
        </ResponsiveModal>
    )
}