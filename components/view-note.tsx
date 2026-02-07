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
import CommentNoteCard from "./ui/NoteCard/CommentCard";
import emptyAnimation from "./lottie/ghosty.json";
import Loader from "./Loader";
import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";
import NeoButton from "./neo-components/NeoButton";
import { SendIcon } from "./animate-ui/icons/send";
import { LoaderCircleIcon } from "./animate-ui/icons/loader-circle";
import Masonry from "./ui/Masonry";
import { NoteCardProps, NoteStyle } from "@/types/note";
import { TextInputHandler, NewlineTrimmer } from "./ui/NoteCard/actions";
import NoteCard from "./ui/NoteCard";
import useShortcuts, { KeyboardKey } from "@useverse/useshortcuts";
import { backgroundColors } from "@/constants/notes";
import { ModerationLevel, quickModerate, WordSeverity } from "@useverse/profanity-guard";
import { toast } from "./ui/toast";
import { useGetNoteQuery, useGetCommentsQuery, useCreateCommentMutation, useTrackViewMutation } from "@/store/api";
import { ClipType } from "./ui/Clip";
import { FontFamily } from "@/constants/fonts";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setComments, addComment, setHasMore, selectCommentsByNoteId, selectIsLoadingComments } from "@/store/slices/commentsSlice";
import { incrementComments, incrementViews } from "@/store/slices/notesSlice";
import useSoundEffect from "@useverse/usesoundeffect";

export default function ViewNoteModal() {
    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const noteId = searchParams.get("note");
    const isViewingNote = Boolean(noteId);

    const clickSound = useSoundEffect("/sayit-wiki-sound/click-v1.mp3", {
        volume: 0.5
    });
    const modalOpen = useSoundEffect("/sayit-wiki-sound/modal-v2.mp3", {
        volume: 0.15
    });
    const modalClose = useSoundEffect("/sayit-wiki-sound/modal.mp3", {
        volume: 0.05
    });
    const wtfSound = useSoundEffect("/sayit-wiki-sound/wtf.mp3", {
        volume: 0.5
    });

    // Track if we've already tracked the view for this note
    const [viewTracked, setViewTracked] = useState(false);
    const [commentsPage, setCommentsPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(false);
    const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);

    // Fetch the note and its comments with caching
    const { data: noteData, isLoading: isNoteLoading } = useGetNoteQuery(
        noteId || '',
        {
            skip: !noteId,
            // Cache for 5 minutes, refetch in background if data is older than 30 seconds
            pollingInterval: 0, // No auto-polling
            refetchOnMountOrArgChange: 30, // Soft refetch if data is older than 30 seconds
        }
    );

    const { data: commentsData, isLoading: isFetchingComments, refetch: refetchComments } = useGetCommentsQuery(
        { noteId: noteId || '', page: 1, limit: 10 },
        {
            skip: !noteId,
            // Cache comments, soft refetch if data is older than 30 seconds
            pollingInterval: 0,
            refetchOnMountOrArgChange: 30,
        }
    );

    useEffect(() => {
        if (noteId) {
            refetchComments();
            setCommentsPage(1);
        }
    }, [noteId, refetchComments]);

    const [createComment, { isLoading: isSubmitting }] = useCreateCommentMutation();
    const [trackView] = useTrackViewMutation();

    // Get comments from Redux slice using memoized selectors
    const comments = useAppSelector(
        useMemo(() => (state: any) =>
            noteId ? selectCommentsByNoteId(state, noteId) : []
            , [noteId])
    );
    const isLoadingComments = useAppSelector(
        useMemo(() => (state: any) =>
            noteId ? selectIsLoadingComments(state, noteId) : false
            , [noteId])
    );

    // Local cached note state (syncs with API data)
    const [cachedNote, setCachedNote] = useState<NoteCardProps | undefined>(noteData);

    const [newComment, setNewComment] = useState<string>("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Update cached note when API data changes
    useEffect(() => {
        if (noteData) {
            setCachedNote(noteData);
        }
    }, [noteData]);

    // Sync API data to Redux slice
    useEffect(() => {
        if (commentsData && noteId) {
            dispatch(setComments({
                noteId,
                comments: commentsData.comments
            }));
            dispatch(setHasMore({
                noteId,
                hasMore: commentsData.pagination.hasMore
            }));
            setHasMoreComments(commentsData.pagination.hasMore);
        }
    }, [commentsData, noteId, dispatch]);

    // Load more comments
    const handleLoadMoreComments = useCallback(async () => {
        if (!noteId || !hasMoreComments || isLoadingMoreComments) return;
        clickSound.play();

        setIsLoadingMoreComments(true);
        try {
            const nextPage = commentsPage + 1;
            const response = await fetch(`/api/v1/notes/${noteId}/comments?page=${nextPage}&limit=20`);
            const result = await response.json();

            if (result.success && result.data) {
                // Get existing comments and append new ones
                const currentComments = comments;
                const newComments = result.data.comments.filter(
                    (newComment: any) => !currentComments.find((c) => c.id === newComment.id)
                );

                dispatch(setComments({
                    noteId,
                    comments: [...currentComments, ...newComments]
                }));
                setHasMoreComments(result.data.pagination.hasMore);
                setCommentsPage(nextPage);
            }
        } catch (error) {
            console.error('Error loading more comments:', error);
        } finally {
            setIsLoadingMoreComments(false);
        }
    }, [noteId, hasMoreComments, isLoadingMoreComments, commentsPage, comments, dispatch]);

    // Track view when modal opens (once per note)
    useEffect(() => {
        if (noteId && isViewingNote && !viewTracked && cachedNote) {
            trackView(noteId)
                .unwrap()
                .then(() => {
                    // Update local note state
                    dispatch(incrementViews(noteId));
                    setCachedNote(prev => prev ? { ...prev, viewsCount: prev.viewsCount + 1 } : prev);
                    setViewTracked(true);
                })
                .catch((error) => {
                    // Silently fail - view tracking is not critical
                    console.debug('View tracking failed:', error);
                });
        }
    }, [noteId, isViewingNote, viewTracked, cachedNote, trackView, dispatch]);

    // Reset view tracked when modal closes
    useEffect(() => {
        if (!isViewingNote) {
            setViewTracked(false);
        }else{
            modalOpen.play();
        }
    }, [isViewingNote]);

    const handleCommentTap = () => {
        if (!textareaRef.current) return;
        clickSound.play();
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
            textInputHandler.handleTextareaChange(e, () => wtfSound.play());
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
        clickSound.play();
        if (!noteId) return;
        if (!newComment.trim()) return;

        const trimmedComment = newlineTrimmer.trimStrict(newComment);
        const randomPaperColor = backgroundColors[luckyPick(0, backgroundColors.length - 1)];

        const moderationResult = quickModerate(trimmedComment, ModerationLevel.STRICT);

        if (moderationResult.severity === WordSeverity.WTF) {
            toast.error({
                title: "What's wrong with you?",
                description: "You can't say that here, or to anyone else for that matter!",
                communityNote: `Found ${moderationResult.matches.length} words: ${moderationResult.matches.map(match => match.word).join(", ")}`,
            });
            return;
        }

        try {
            const result = await createComment({
                noteId,
                comment: {
                    content: moderationResult.sanitized,
                    backgroundColor: randomPaperColor,
                    noteStyle: NoteStyle.SPIRAL_LEFT,
                    clipType: ClipType.Staple,
                    tilt: 0,
                    selectedFont: FontFamily.Schoolbell,
                }
            }).unwrap();

            // Add comment to Redux slice immediately
            dispatch(addComment({
                noteId,
                comment: {
                    ...result,
                    isNew: true,
                }
            }));

            // Increment comment count on the note
            dispatch(incrementComments(noteId));

            // Update cached note's comment count
            setCachedNote(prev => prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev);

            setNewComment("");

            setTimeout(() => {
                if (scrollAreaRef.current) {
                    scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 100);

            toast.success({
                title: "Comment added!",
                description: "Your comment has been posted",
            });
        } catch (error: any) {
            console.error('Error creating comment:', error);
            toast.error({
                title: "Failed to post comment",
                description: error?.data?.error?.message || "Please try again later",
            });
        }
    }, [newComment, noteId, newlineTrimmer, createComment, dispatch, incrementComments]);

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

    const commentsCount = comments.length;

    const sortedComments = useMemo(() => {
        return [...comments].sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB.getTime() - dateA.getTime();
        });
    }, [comments]);

    const showLoading = isFetchingComments && comments.length === 0;

    return (
        <Dialog
            open={isViewingNote}
            onOpenChange={(open) => {
                if (!open) {
                    modalClose.play();
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
                                    animate={isNoteLoading}
                                    loop={true}
                                    className="flex-1"
                                >
                                    <DialogTitle className="text-start text-lg font-bold drop-shadow-[0_0_10px_rgba(0,0,0,0.25),0_0_1px_rgba(0,0,0,0.9)] flex items-center">
                                        <MessageCircleDashedIcon strokeWidth={2.5} className={cn("size-6",)} />
                                        {isNoteLoading && <span className="px-3">Loading Notes</span>}
                                        {!isNoteLoading && <>
                                            {cachedNote ? <span className="px-3">Comments <span className="text-base opacity-75">({numberShortForm(commentsCount)})</span></span> : <span className="text-red-600 ml-3">404</span>}
                                        </>}
                                    </DialogTitle>
                                </AnimateIcon>
                                <AnimateIcon
                                    animateOnHover="wiggle"
                                    loop={true}
                                    className="translate-y-0.5"
                                >
                                    <DialogClose className="cursor-pointer active:scale-95 transition-all duration-150 ease-in-out" onClick={() => {
                                        clickSound.play();
                                    }}>
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
                            "wooden rounded-2xl w-full max-h-[80dvh] flex flex-col",
                            cachedNote ? "min-h-[70dvh]" : ""
                        )}>
                            <div className="mt-4 px-2 pr-3" ref={containerRef}>
                                {isNoteLoading && !cachedNote ? (
                                    <div className="flex items-center justify-center h-40">
                                        <Loader>
                                            <h4 className="md:text-base sm:text-sm text-xs text-white/80 font-bold animate-bounce">
                                                Loading note...
                                            </h4>
                                        </Loader>
                                    </div>
                                ) : cachedNote ? (
                                    <NoteCard
                                        {...cachedNote}
                                        tilt={0}
                                        onCommentTap={handleCommentTap}
                                        maxWidth="100%"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-60 gap-2">
                                        <Lottie
                                            animationData={emptyAnimation}
                                            loop={true}
                                            className="size-32"
                                            style={{ mixBlendMode: "screen" }}
                                        />
                                        <p className="text-sm font-bold text-shadow-2xs text-red-200">Note not doesn't exist</p>
                                    </div>
                                )}
                            </div>
                            <div className="h-2 w-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_-2px_2px_rgba(0,0,0,0.4)] mt-3" />
                            {cachedNote && <div ref={scrollAreaRef} className="flex-1 overflow-y-auto flex flex-col gap-10 pl-2 pr-3">
                                {showLoading ? (
                                    <div className="flex flex-col items-center justify-center h-60 gap-2 mix-blend-screen">
                                        <Loader>
                                            <h4 className="md:text-base sm:text-sm text-xs text-white/80 font-bold animate-bounce">
                                                Loading comments...
                                            </h4>
                                        </Loader>
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-60 gap-2">
                                        <Lottie
                                            animationData={emptyAnimation}
                                            loop={true}
                                            className="size-40"
                                            style={{ mixBlendMode: "screen" }}
                                        />
                                        <p className="text-sm font-bold">No comments yet</p>
                                        <p className="text-sm -mt-2 text-white/60">Be the first to leave a comment!</p>
                                    </div>
                                ) : (
                                    <>
                                        <Masonry
                                            items={sortedComments}
                                            width={containerWidth}
                                            key={"comments"}
                                            Child={CommentNoteCard}
                                            minWidth={380}
                                            gap={12}
                                            padding={3}
                                        />
                                        {hasMoreComments && (
                                            <div className="flex items-center justify-center py-4">
                                                <button
                                                    onClick={handleLoadMoreComments}
                                                    disabled={isLoadingMoreComments}
                                                    className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 disabled:opacity-50 transition-all duration-200 text-sm font-semibold"
                                                >
                                                    {isLoadingMoreComments ? 'Loading...' : 'Load more comments'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                                <div className="h-3" />
                            </div>}

                            {cachedNote && <div className="p-1">
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
                                                disabled={isSubmitting}
                                            />
                                            <Tooltip>
                                                <TooltipTrigger asChild className="p-3">
                                                    <AnimateIcon animateOnHover="wiggle" loop={true}>
                                                        <NeoButton
                                                            element="div"
                                                            onClick={handleAddComment}
                                                            className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3"
                                                            disabled={isSubmitting}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {isSubmitting ? (
                                                                    <LoaderCircleIcon
                                                                        animate="path-loop"
                                                                        strokeWidth={2.5}
                                                                        speed={0.05}
                                                                        className="sm:w-4 text-black sm:h-4 w-3 h-3 scale-125"
                                                                    />
                                                                ) : (
                                                                    <SendIcon
                                                                        strokeWidth={2.5} className="sm:w-4 text-black sm:h-4 w-3 h-3 scale-125" />
                                                                )}
                                                                <span className="sr-only">{isSubmitting ? 'Posting...' : 'Post comment'}</span>
                                                            </div>
                                                        </NeoButton>
                                                    </AnimateIcon>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{isSubmitting ? 'Posting...' : 'Post comment'}</p>

                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </div>
                                </WoodenPlatform>
                            </div>}
                        </div>
                    </div>
                </WoodenPlatform>
            </DialogContent>
        </Dialog>
    )
}
