"use client";
import { cn, luckyPick, numberShortForm, removeSearchParam } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import WoodenPlatform from "./WoodenPlatform";
import { AnimateIcon } from "./animate-ui/icons/icon";
import { XIcon } from "./animate-ui/icons/x";
import { MessageCircleDashedIcon } from "./animate-ui/icons/message-circle-dashed";
import Lottie from "lottie-react";
import notes from "@/constants/mock/notes";
import CommentNoteCard from "./ui/NoteCard/CommentCard";
import emptyAnimation from "./lottie/ghosty.json";
import Loader from "./Loader";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import NeoButton from "./neo-components/NeoButton";
import { SendIcon } from "./animate-ui/icons/send";
import Masonry from "./ui/Masonry";
import { NoteCardProps, NoteStyle } from "@/types/note";
import { TextInputHandler, NewlineTrimmer } from "./ui/NoteCard/actions";
import NoteCard from "./ui/NoteCard";
import useShortcuts, { KeyboardKey } from "@useverse/useshortcuts";
import { backgroundColors } from "@/constants/notes";
import { ModerationLevel, quickModerate } from "@/lib/moderator";
import { toast } from "./ui/toast";

export default function ViewNoteModal() {
    const searchParams = useSearchParams();
    const [comments, setComments] = useState<NoteCardProps[]>(() =>
        notes.slice(15, 20).map((note, index) => ({
            ...note,
            tilt: 0,
            noteStyle: NoteStyle.SPIRAL_LEFT,
            index,
            isNew: false,
            id: `comment_${Date.now()}_${index}`
        }))
    );
    const [newComment, setNewComment] = useState<string>("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const isViewingNote = useMemo(() => Boolean(searchParams.get("note")), [searchParams]);

    const handleCommentTap = () => {
        if (!textareaRef.current) return;
        textareaRef.current.focus();
    }

    const maxChars = 200; // Maximum characters allowed

    /**
     * Classes for handling text input
     * - NewlineTrimmer: Handles newlines in the text input
     * - TextInputHandler: Handles text input and limits the number of characters
     */
    const newlineTrimmer = useMemo(() => new NewlineTrimmer(), []);
    const textInputHandler = useMemo(
        () => new TextInputHandler(maxChars, setNewComment),
        [maxChars, setNewComment]
    );

    const handleTextareaChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            textInputHandler.handleTextareaChange(e);
        },
        [textInputHandler]
    );

    const handlePaste = useCallback(
        (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
            textInputHandler.handlePaste(e);
        },
        [textInputHandler]
    );

    const handleAddComment = useCallback(async () => {
        if (!scrollAreaRef.current) return;


        if (!newComment.trim()) return;
        const trimmedComment = newlineTrimmer.trimStrict(newComment);
        const noteId = `comment_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const randomPaperColor = backgroundColors[luckyPick(0, backgroundColors.length - 1)];

        const moderationResult = quickModerate(trimmedComment, ModerationLevel.STRICT);

        if (moderationResult.isWTF) {
            toast.error({
                title: "What's wrong with you?",
                description: "You can't say that here, or to anyone else for that matter!",
                communityNote: `Found ${moderationResult.matches.length} words: ${moderationResult.matches.map(match => match.word).join(", ")}`,
            });

            return;
        }

        const scrollTimeout = setTimeout(() => {
            if (scrollAreaRef.current) {
                scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 100);

        await new Promise(resolve => setTimeout(resolve, 100));

        const note = {
            ...notes[77],
            id: noteId,
            content: moderationResult.sanitized,
            tilt: 0,
            noteStyle: NoteStyle.SPIRAL_LEFT,
            index: comments.length,
            backgroundColor: randomPaperColor,
            timestamp: new Date().toISOString(),
            isNew: true
        };


        setComments(prev => [...prev.map(comment => ({ ...comment })), note]);
        setNewComment("");

        return () => clearTimeout(scrollTimeout);
    }, [newComment, comments, newlineTrimmer]);

    useShortcuts({
        shortcuts: [
            {
                key: KeyboardKey.Enter,
                ctrlKey: true,
                platformAware: true,
                enabled: isViewingNote,
            }
        ],
        onTrigger: (key) => {
            switch (key.key) {
                case KeyboardKey.Enter:
                    handleAddComment();
                    break;
                default:
                    break;
            }
        }
    }, [isViewingNote, handleAddComment]);

    const containerRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.clientWidth);
        }
    }, [isViewingNote]);

    const sortedComments = useMemo(() => {
        return [...comments].sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB.getTime() - dateA.getTime();
        });
    }, [comments]);

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
                {/* Note Content */}
                <WoodenPlatform className="w-full h-full flex flex-col rounded-2xl overflow-hidden -mt-1" noScrews>
                    <div className="p-1 flex h-full border-4 border-background/0 gap-3 relative z-10 rounded-2xl shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)] overflow-hidden">
                        <div className={cn(
                            "wooden rounded-2xl w-full min-h-[70dvh] max-h-[80dvh] flex flex-col"
                        )}>
                            <div className="mt-4 px-2 pr-3">
                                <NoteCard
                                    {...notes[77]}
                                    tilt={0}
                                    onCommentTap={handleCommentTap}
                                    maxWidth="100%"
                                />
                            </div>
                            <div className="h-2 w-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_-2px_2px_rgba(0,0,0,0.4)] mt-3" />
                            <div ref={scrollAreaRef} className="flex-1 overflow-y-auto flex flex-col gap-10 pl-2 pr-3">
                                <div className="h-3 w-32 bg-white" />
                                {comments.length === 0 && (<div className="flex flex-col items-center justify-center h-60 gap-2">
                                    <Lottie
                                        animationData={emptyAnimation}
                                        loop={true}
                                        className="size-40"
                                        style={{ mixBlendMode: "screen" }}
                                    />

                                    <p className="text-sm font-bold">No comments yet</p>
                                    <p className="text-sm -mt-2 text-white/60">Be the first to leave a comment!</p>
                                </div>)}
                                {comments.length === 0 && <div className="flex flex-col items-center justify-center h-60 gap-2 mix-blend-screen">
                                    <Loader>
                                        <h4 className="md:text-base sm:text-sm text-xs dark:text-slate-400 font-bold animate-bounce">
                                            Loading comments...
                                        </h4>
                                    </Loader>
                                </div>}
                                <Masonry
                                    items={sortedComments}
                                    width={containerWidth}
                                    key={"comments"}
                                    Child={CommentNoteCard}
                                    minWidth={400}
                                    gap={12}
                                    padding={3}
                                />
                                <div className="h-3" />
                            </div>

                            <div className="p-1">
                                <WoodenPlatform
                                    className="h-fit w-full rounded-lg drop-shadow-[-10px_-10px_5px_rgba(0,0,0,0.0.25),0_0_1px_rgba(0,0,0,0.0.5)]"
                                    style={{ transition: "all 0.3s ease-in-out" }}
                                    noScrews
                                >
                                    <div className="wooden p-0.5 flex border-2 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                        <div
                                            className={cn(
                                                "rounded-sm bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex items-start justify-between gap-1"
                                            )}
                                        >
                                            <textarea
                                                className="w-full min-h-16 resize-none field-sizing-content border-none outline-none max-h-20 text-sm p-3"
                                                placeholder="Add a comment"
                                                rows={10}
                                                ref={textareaRef}
                                                value={newComment}
                                                onChange={handleTextareaChange}
                                                onPaste={handlePaste}
                                                autoFocus
                                            />
                                            <Tooltip>
                                                <TooltipTrigger asChild className="p-3">
                                                    <AnimateIcon animateOnHover="wiggle" loop={true}>
                                                        <NeoButton
                                                            element="div"
                                                            onClick={handleAddComment}
                                                            className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <SendIcon
                                                                    strokeWidth={2.5} className="sm:w-4 text-black sm:h-4 w-3 h-3 scale-125" />
                                                                <span className="sr-only">Pin to wall</span>
                                                            </div>
                                                        </NeoButton>
                                                    </AnimateIcon>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Pin to wall</p>

                                                </TooltipContent>
                                            </Tooltip>
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