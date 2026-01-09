"use client";
import { cn, numberShortForm, removeSearchParam, updateSearchParam } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { useMemo } from "react";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import WoodenPlatform from "./WoodenPlatform";
import { AnimateIcon } from "./animate-ui/icons/icon";
import { XIcon } from "./animate-ui/icons/x";
import { MessageCircleDashedIcon } from "./animate-ui/icons/message-circle-dashed";
import Lottie from "lottie-react";
import notes from "@/constants/mock/notes";
import CommentNoteCard from "./ui/NoteCard/CommentCard";
import emptyAnimation from "./lottie/ghosty.json";
import Loader from "./Loader";

export default function ViewNoteModal() {
    const searchParams = useSearchParams();

    const isViewingNote = useMemo(() => Boolean(searchParams.get("note")), [searchParams]);

    return (
        <Dialog
            open={isViewingNote}
            onOpenChange={(open) => {
                if (!open) {
                    removeSearchParam("note");
                }
            }}
        >
            <DialogContent showCloseButton={false} className="max-h-[90dvh] w-[90dvw] text-white group">
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
                                        <MessageCircleDashedIcon strokeWidth={2.5} className="size-6" />
                                        <span className="px-3">Comments <span className="text-base opacity-75">({numberShortForm(100000)})</span></span>
                                    </DialogTitle>
                                </AnimateIcon>
                                <AnimateIcon
                                    animateOnHover="wiggle"
                                    loop={true}
                                    className="translate-y-0.5"
                                >
                                    <DialogClose className="cursor-pointer">
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
                {/* Note Content */}
                <WoodenPlatform className="w-full h-full flex flex-col rounded-2xl overflow-hidden -mt-1" noScrews>
                    <div className="p-1 flex h-full border-4 border-background/0 gap-3 relative z-10 rounded-2xl shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)] overflow-hidden">
                        <div className={cn(
                            "wooden rounded-2xl w-full min-h-[70dvh] max-h-[80dvh] flex flex-col"
                        )}>
                            <div className="mt-4 px-2 pr-3">
                                <CommentNoteCard
                                    {...notes[77]}
                                />
                            </div>
                            <div className="h-2 w-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_-2px_2px_rgba(0,0,0,0.4)] my-3" />
                            <ScrollArea className="flex-1 overflow-y-auto flex flex-col gap-10 pl-2 pr-3">
                                <ScrollBar orientation="vertical" hidden />
                                {/* <div className="flex flex-col items-center justify-center h-60 gap-2">
                                    <Lottie
                                        animationData={emptyAnimation}
                                        loop={true}
                                        className="size-40"
                                        style={{ mixBlendMode: "screen" }}
                                    />

                                    <p className="text-sm font-bold">No comments yet</p>
                                    <p className="text-sm -mt-2 text-white/60">Be the first to leave a comment!</p>
                                </div> */}
                                {/* <div className="flex flex-col items-center justify-center h-60 gap-2">
                                    <Loader>
                                        <h4 className="md:text-base sm:text-sm text-xs dark:text-slate-400 font-bold animate-bounce">
                                            Loading comments...
                                        </h4>
                                    </Loader>
                                </div> */}
                                <div className="grid grid-cols-2 gap-4">
                                    <CommentNoteCard
                                        {...notes[17]}
                                        tilt={0}
                                    />
                                    <CommentNoteCard
                                        {...notes[17]}
                                        tilt={0}
                                    />
                                    <CommentNoteCard
                                        {...notes[17]}
                                        tilt={0}
                                    />
                                    <CommentNoteCard
                                        {...notes[17]}
                                        tilt={0}
                                    />
                                    <CommentNoteCard
                                        {...notes[17]}
                                        tilt={0}
                                    />
                                </div>
                            </ScrollArea>

                            <div className="p-1 mt-4">
                                <WoodenPlatform
                                    className="h-fit w-full rounded-lg drop-shadow-[-10px_-10px_5px_rgba(0,0,0,0.0.25),0_0_1px_rgba(0,0,0,0.0.5)]"
                                    style={{ transition: "all 0.3s ease-in-out" }}
                                    noScrews
                                >
                                    <div className="wooden p-0.5 flex border-2 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                        <div
                                            className={cn(
                                                "rounded-sm p-3 pr-5 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex items-center justify-between gap-1"
                                            )}
                                        >
                                            <textarea
                                                className="w-full resize-none field-sizing-content border-none outline-none max-h-20 text-sm"
                                                placeholder="Add a comment"
                                                rows={10}
                                            />
                                        </div>
                                    </div>
                                </WoodenPlatform>
                            </div>
                        </div>
                    </div>
                </WoodenPlatform>
            </DialogContent>
        </Dialog>
    )
}