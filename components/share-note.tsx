"use client";
import { cn, darkenHex, getOppositeColor, removeSearchParam } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { DialogClose, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WoodenPlatform from "./WoodenPlatform";
import { AnimateIcon } from "./animate-ui/icons/icon";
import { XIcon } from "./animate-ui/icons/x";
import notes from "@/constants/mock/notes";
import NoteCard from "./ui/NoteCard";
import useShortcuts, { KeyboardKey } from "@useverse/useshortcuts";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import NeoButton from "./neo-components/NeoButton";
import { ResponsiveModal } from "./ui/responsive-modal";
import searchParamsKeys from "@/constants/search-params";
import { UsersIcon } from "./animate-ui/icons/users";
import Lottie from "lottie-react";
import emptyAnimation from "./lottie/ghosty.json";
import { CloudDownloadIcon } from "./animate-ui/icons/cloud-download";
import { toPng } from "html-to-image";
import { Facebook, Linkedin, Loader2Icon, Twitter } from "lucide-react";
import { useSocialShare } from "@/hooks/use-social-share";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { LoaderCircleIcon } from "./animate-ui/icons/loader-circle";
import { toast } from "./ui/toast";

const DownloadedMap = new Map<string, boolean>();


export default function ShareNoteModal() {
    const isMobile = useIsMobile();
    const searchParams = useSearchParams();
    const isSharingNote = useMemo(() => Boolean(searchParams.get(searchParamsKeys.SHARE_NOTE)), [searchParams]);
    const [noteId, setNoteId] = useState<string | null>(null);

    const { openShareWindow } = useSocialShare();
    const noteForExportRef = useRef<HTMLDivElement>(null);
    const [isDownloadingNote, setIsDownloadingNote] = useState(false);

    const selectedNote = useMemo(() => {
        return notes.find((note) => note.id === noteId);
    }, [noteId]);

    useEffect(() => {
        const noteId = searchParams.get(searchParamsKeys.SHARE_NOTE);
        if (!noteId) return;
        setNoteId(noteId);
    }, [searchParams]);

    const isDownloaded = useMemo(() => {
        if (isDownloadingNote) return false;
        if (!noteId) return false;
        return DownloadedMap.get(noteId);
    }, [noteId, isDownloadingNote]);

    const handleDownloadNote = useCallback(async () => {
        if (!noteId) return;
        if (isDownloaded) return;
        if (isDownloadingNote) return;

        setIsDownloadingNote(true);
        await new Promise(resolve => setTimeout(resolve, 6000));
        if (noteForExportRef.current) {
            try {
                const dataUrl = await toPng(noteForExportRef.current, {
                    canvasHeight: noteForExportRef.current.scrollHeight + (isMobile ? 600 : 1000),
                    canvasWidth: noteForExportRef.current.scrollWidth + (isMobile ? 1400 : 1900),
                    cacheBust: true,
                });
                const link = document.createElement('a')
                link.download = `sayit-note-${Date.now()}.png`
                link.href = dataUrl
                link.click();
                DownloadedMap.set(noteId, true);

                toast.success({
                    title: "Note downloaded",
                    description: "Your note has been downloaded to your device",
                });
            } catch (err) {
                console.log(err);
            }finally {
                setIsDownloadingNote(false);
            }
        }
    }, [noteForExportRef, isMobile, isDownloadingNote, noteId, isDownloaded]);

    const handleShareOnFacebook = useCallback(async () => {
        if (isDownloadingNote) return;
        if (!selectedNote) return;
        await handleDownloadNote();
        openShareWindow("facebook", { text: selectedNote.content, url: window.location.href });
    }, [selectedNote, handleDownloadNote, isDownloadingNote, openShareWindow]);

    const handleShareOnTwitter = useCallback(async () => {
        if (isDownloadingNote) return;
        if (!selectedNote) return;
        await handleDownloadNote();

        openShareWindow("twitter", { text: selectedNote.content, url: window.location.href });
    }, [selectedNote, handleDownloadNote, isDownloadingNote, openShareWindow]);

    const handleShareOnLinkedIn = useCallback(async () => {
        if (isDownloadingNote) return;
        if (!selectedNote) return;
        await handleDownloadNote();
        openShareWindow("linkedin", { text: selectedNote.content, url: window.location.href });
    }, [selectedNote, handleDownloadNote, isDownloadingNote, openShareWindow]);

    useShortcuts({
        shortcuts: [
            {
                key: KeyboardKey.KeyS,
                ctrlKey: true,
                platformAware: true,
                enabled: isSharingNote,
            },
            {
                key: KeyboardKey.KeyN,
                ctrlKey: true,
                enabled: isSharingNote,
            },
        ],
        onTrigger: (key) => {
            switch (key.key) {
                case KeyboardKey.KeyS:
                    handleDownloadNote();
                    break;
                case KeyboardKey.KeyN:
                    removeSearchParam(searchParamsKeys.SHARE_NOTE);
                    break;
            }
        }
    }, [isSharingNote, handleDownloadNote]);

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
                                            <UsersIcon strokeWidth={2.5} className="size-6 text-blue-500" />
                                            <span className="px-3">Share with friends</span>
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
            open={isSharingNote}
            onOpenChange={(open) => {
                if (!open) {
                    removeSearchParam(searchParamsKeys.SHARE_NOTE);
                }
            }}
            className="max-h-[90dvh] sm:w-[90dvw] text-white group"
        >
            {/* Note Content */}
            <WoodenPlatform className="w-full h-full flex flex-col rounded-2xl overflow-hidden -mt-1" noScrews>
                <div className="p-1 flex h-full border-4 border-background/0 gap-3 relative z-10 rounded-2xl shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)] overflow-hidden">
                    <div className={cn(
                        "wooden rounded-md w-full max-h-[80dvh] overflow-y-auto flex flex-col"
                    )}>
                        {!selectedNote && <div className="flex flex-col items-center justify-center h-60 gap-2">
                            <Lottie
                                animationData={emptyAnimation}
                                loop={true}
                                className="size-40"
                                style={{ mixBlendMode: "screen" }}
                            />

                            <p className="text-sm font-bold">No comments yet</p>
                            <p className="text-sm -mt-2 text-white/60">Be the first to leave a comment!</p>
                        </div>}
                        {selectedNote && (
                            <>
                                <div
                                    className="grid place-items-center p-10 max-sm:p-5 relative"
                                    ref={noteForExportRef}
                                    style={{
                                        backgroundColor: getOppositeColor(selectedNote.backgroundColor, {
                                            brightness: -5
                                        }),
                                    }}
                                >
                                    <span
                                        className={cn(
                                            "absolute top-3 sm:left-10 left-6  text-sm font-semibold text-black max-sm:hidden",
                                            selectedNote.selectedFont,
                                        )}
                                        style={{
                                            color: darkenHex(getOppositeColor(selectedNote.backgroundColor, {
                                                brightness: -5
                                            }), 70)
                                        }}
                                    >https://sayit.wiki</span>
                                    <span
                                        className={cn(
                                            "absolute sm:bottom-3 bottom-[unset] sm:top-[unset] top-8 z-20 sm:right-10 right-10  text-sm font-semibold text-black",
                                            selectedNote.selectedFont,
                                        )}
                                        style={{
                                            color: darkenHex(getOppositeColor(selectedNote.backgroundColor, {
                                                brightness: -5
                                            }), 70)
                                        }}
                                    >https://sayit.wiki</span>
                                    <div className="drop-shadow-[10px_20px_10px_rgba(0,0,0,0.1)]">
                                        <NoteCard
                                            {...selectedNote}
                                            tilt={0}
                                            onCommentTap={() => { }}
                                            canReact={false}
                                            maxWidth="100%"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
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
                                        <span className={cn("text-white py-1 md:text-sm text-xs")}>
                                            Share this note with your friends via!
                                        </span>
                                    </div>
                                </div>
                            </WoodenPlatform>
                        </div>

                        {selectedNote && <div className="w-full px-2">
                            <WoodenPlatform noScrews className="w-full h-fit rounded-3xl drop-shadow-[0_0_20px_rgba(0,0,0,0.0.5),0_0_5px_rgba(0,0,0,0.0.75)]">
                                <div className="px-2 py-2 flex items-center border-8 border-background/0 gap-2 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                    <div className="absolute wooden inset-0 rounded-full m-0 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                                    {!isDownloaded && <Tooltip>
                                        <TooltipTrigger className="flex-1" asChild>
                                            <AnimateIcon animateOnHover={isDownloadingNote ? "undefined" : "wiggle"} className="flex-1" loop={true}>
                                                <NeoButton
                                                    element="div"
                                                    className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3 w-full"
                                                    onClick={handleDownloadNote}
                                                    disabled={isDownloadingNote}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {isDownloadingNote ? <LoaderCircleIcon
                                                            animate="path-loop"
                                                            strokeWidth={2.5}
                                                            className="sm:w-6 text-black sm:h-6 w-4 h-4 scale-125"
                                                        /> : <CloudDownloadIcon
                                                            strokeWidth={2.5}
                                                            className="sm:w-6 text-black sm:h-6 w-4 h-4 scale-125"
                                                        />}
                                                        <p className="text-black max-sm:hidden font-semibold base-font text-sm">{isDownloadingNote ? "Downloading note..." : "Download note"}</p>
                                                    </div>
                                                </NeoButton>
                                            </AnimateIcon>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {isDownloadingNote ? <p>Downloading note...</p> : <p>Download note to your device</p>}
                                        </TooltipContent>
                                    </Tooltip>}
                                    <Tooltip>
                                        <TooltipTrigger className={cn("max-sm:flex-1", isDownloaded && "flex-1")} asChild>
                                            <div className="w-fit">
                                                <NeoButton
                                                    element="div"
                                                    className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3"
                                                    onClick={handleShareOnFacebook}
                                                    disabled={isDownloadingNote}
                                                >
                                                    <div className={cn("flex items-center gap-2", isDownloadingNote ? "animate-spin" : "")}>
                                                        {isDownloadingNote ? <Loader2Icon className="sm:w-6 duration-1000 text-black sm:h-6 w-4 h-4 scale-125" /> : <Facebook
                                                            strokeWidth={2.5} className="sm:w-6 text-black sm:h-6 w-4 h-4 scale-125" />}
                                                    </div>
                                                </NeoButton>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {isDownloadingNote ? <p>Downloading note...</p> : <p>Share on Facebook</p>}
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger className={cn("max-sm:flex-1", isDownloaded && "flex-1")} asChild>
                                            <div className="w-fit">
                                                <NeoButton
                                                    element="div"
                                                    className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3"
                                                    onClick={handleShareOnTwitter}
                                                    disabled={isDownloadingNote}
                                                >
                                                    <div className={cn("flex items-center gap-2", isDownloadingNote ? "animate-spin" : "")}>
                                                        {isDownloadingNote ? <Loader2Icon className="sm:w-6 duration-1000 text-black sm:h-6 w-4 h-4 scale-125" /> : <Twitter
                                                            strokeWidth={2.5} className="sm:w-6 text-black sm:h-6 w-4 h-4 scale-125" />}
                                                    </div>
                                                </NeoButton>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {isDownloadingNote ? <p>Downloading note...</p> : <p>Share on Twitter</p>}
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger className={cn("max-sm:flex-1", isDownloaded && "flex-1")} asChild>
                                            <div className="w-fit">
                                                <NeoButton
                                                    element="div"
                                                    className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3"
                                                    onClick={handleShareOnLinkedIn}
                                                    disabled={isDownloadingNote}
                                                >
                                                    <div className={cn("flex items-center gap-2", isDownloadingNote ? "animate-spin" : "")}>
                                                        {isDownloadingNote ? <Loader2Icon className="sm:w-6 duration-1000 text-black sm:h-6 w-4 h-4 scale-125" /> : <Linkedin
                                                            strokeWidth={2.5} className="sm:w-6 text-black sm:h-6 w-4 h-4 scale-125" />}
                                                    </div>
                                                </NeoButton>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {isDownloadingNote ? <p>Downloading note...</p> : <p>Share on LinkedIn</p>}
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            </WoodenPlatform>
                            <div className="h-6 sm:hidden" />
                        </div>}
                    </div>
                </div>
            </WoodenPlatform>
        </ResponsiveModal>
    )
}