"use client";

import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { XIcon } from "@/components/animate-ui/icons/x";
import emptyAnimation from "@/components/lottie/ghosty.json";
import Loader from "@/components/Loader";
import CommentNoteCard from "@/components/ui/NoteCard/CommentCard";
import WoodenPlatform from "@/components/WoodenPlatform";
import { cn, luckyPick, numberShortForm } from "@/lib/utils";
import Lottie from "lottie-react";
import { MessageCircleDashedIcon } from "lucide-react";
import Link from "next/link";
import NoteCard from "@/components/ui/NoteCard";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetNoteQuery, useGetCommentsQuery, useCreateCommentMutation, useTrackViewMutation } from "@/store/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setComments, addComment, setHasMore, selectCommentsByNoteId } from "@/store/slices/commentsSlice";
import { incrementComments, incrementViews } from "@/store/slices/notesSlice";
import { backgroundColors } from "@/constants/notes";
import { ModerationLevel, quickModerate, WordSeverity } from "@useverse/profanity-guard";
import { toast } from "@/components/ui/toast";
import { NoteCardProps, NoteStyle } from "@/types/note";
import { ClipType } from "@/components/ui/Clip";
import { FontFamily } from "@/constants/fonts";
import { TextInputHandler, NewlineTrimmer } from "@/components/ui/NoteCard/actions";
import Masonry from "@/components/ui/Masonry";
import NeoButton from "@/components/neo-components/NeoButton";
import { SendIcon } from "@/components/animate-ui/icons/send";
import { LoaderCircleIcon } from "@/components/animate-ui/icons/loader-circle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function NotePage({ params }: { params: Promise<{ noteId: string }> }) {
    const [noteId, setNoteId] = useState<string>('');
    const dispatch = useAppDispatch();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

    // Unwrap params
    useEffect(() => {
        params.then((p) => setNoteId(p.noteId));
    }, [params]);

    // Track if we've already tracked the view for this note
    const [viewTracked, setViewTracked] = useState(false);
    const [commentsPage, setCommentsPage] = useState(1);
    const [hasMoreComments, setHasMoreComments] = useState(false);
    const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);

    // Fetch the note and its comments
    const { data: noteData, isLoading: isNoteLoading } = useGetNoteQuery(noteId || '', {
        skip: !noteId,
        pollingInterval: 0,
        refetchOnMountOrArgChange: 30,
    });

    const { data: commentsData, isLoading: isFetchingComments } = useGetCommentsQuery(
        { noteId: noteId || '', page: 1, limit: 20 },
        {
            skip: !noteId,
            pollingInterval: 0,
            refetchOnMountOrArgChange: 30,
        }
    );

    const [createComment, { isLoading: isSubmitting }] = useCreateCommentMutation();
    const [trackView] = useTrackViewMutation();

    // Get comments from Redux slice
    const comments = useAppSelector(state =>
        noteId ? selectCommentsByNoteId(state, noteId) : []
    );

    // Local cached note state
    const [cachedNote, setCachedNote] = useState<NoteCardProps | undefined>(noteData);
    const [newComment, setNewComment] = useState<string>("");

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
            setCommentsPage(1);
        }
    }, [commentsData, noteId, dispatch]);

    // Track view when page loads
    useEffect(() => {
        if (noteId && !viewTracked && cachedNote) {
            trackView(noteId)
                .unwrap()
                .then(() => {
                    dispatch(incrementViews(noteId));
                    setCachedNote(prev => prev ? { ...prev, viewsCount: prev.viewsCount + 1 } : prev);
                    setViewTracked(true);
                })
                .catch((error) => {
                    console.debug('View tracking failed:', error);
                });
        }
    }, [noteId, viewTracked, cachedNote, trackView, dispatch]);

    // Update container width
    useEffect(() => {
        if (containerRef.current) {
            setContainerWidth(containerRef.current.clientWidth);
        }
    }, []);

    // Load more comments
    const handleLoadMoreComments = useCallback(async () => {
        if (!noteId || !hasMoreComments || isLoadingMoreComments) return;

        setIsLoadingMoreComments(true);
        try {
            const nextPage = commentsPage + 1;
            const response = await fetch(`/api/v1/notes/${noteId}/comments?page=${nextPage}&limit=20`);
            const result = await response.json();

            if (result.success && result.data) {
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

    const handleCommentTap = () => {
        if (!textareaRef.current) return;
        textareaRef.current.focus();
    };

    const maxChars = 200;

    const newlineTrimmer = useMemo(() => new NewlineTrimmer(), []);
    const textInputHandler = useMemo(
        () => new TextInputHandler(maxChars, setNewComment),
        [maxChars]
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

            dispatch(addComment({
                noteId,
                comment: {
                    ...result,
                    isNew: true,
                }
            }));

            dispatch(incrementComments(noteId));
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
    }, [newComment, noteId, createComment, dispatch, setCachedNote]); // Added missing dependencies

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
        <div className="p-2 h-[calc(100dvh)] max-w-[100vw] relative flex flex-col max-sm:overflow-x-hidden">
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
                            <h3 className="text-start text-lg font-bold drop-shadow-[0_0_10px_rgba(0,0,0,0.25),0_0_1px_rgba(0,0,0,0.9)] flex items-center text-white">
                                <MessageCircleDashedIcon strokeWidth={2.5} className="size-6" />
                                <span className="px-3">Comments <span className="text-base opacity-75">({numberShortForm(commentsCount)})</span></span>
                            </h3>
                        </AnimateIcon>
                        <AnimateIcon
                            animateOnHover="wiggle"
                            loop={true}
                            className="translate-y-0.5"
                        >
                            <Link href="/" className="cursor-pointer">
                                <XIcon strokeWidth={4} className="size-5 text-white hover:text-destructive" />
                            </Link>
                        </AnimateIcon>
                    </div>
                </div>
            </WoodenPlatform>

            {/* Hinge */}
            <div className="flex gap-10 justify-around absolute top-11 translate-y-2 z-30 w-full">
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
            <WoodenPlatform className="w-full flex-1 mt-3 flex flex-col rounded-2xl overflow-hidden" noScrews>
                <div className="p-1 flex h-full border-4 border-background/0 gap-3 relative z-10 rounded-2xl shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)] overflow-hidden">
                    <div className={cn(
                        "wooden rounded-2xl w-full flex flex-col"
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
                                    maxWidth="100%"
                                    onCommentTap={handleCommentTap}
                                />
                            ) : (
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
                            )}
                        </div>
                        <div className="h-2 w-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_-2px_2px_rgba(0,0,0,0.4)] my-3" />
                        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto relative flex flex-col gap-10 pl-2 pr-3">
                            {showLoading ? (
                                <div className="flex flex-col items-center justify-center h-60 gap-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full mix-blend-screen">
                                    <Loader>
                                        <h4 className="md:text-base sm:text-sm text-xs text-white/80 font-bold animate-bounce">
                                            Loading comments...
                                        </h4>
                                    </Loader>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="flex flex-col items-center justify-center gap-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full mix-blend-screen">
                                    <Lottie
                                        animationData={emptyAnimation}
                                        loop={true}
                                        className="size-20"
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
                                        minWidth={400}
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
                        </div>

                        <div className="p-1 mt-4">
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
                                            className="w-full min-h-16 resize-none field-sizing-content border-none outline-none max-h-20 text-sm p-3 text-white"
                                            placeholder="Add a comment"
                                            rows={10}
                                            ref={textareaRef}
                                            value={newComment}
                                            onChange={handleTextareaChange}
                                            onPaste={handlePaste}
                                            disabled={isSubmitting}
                                        />
                                        <Tooltip>
                                            <TooltipTrigger asChild className="p-3">
                                                <AnimateIcon animateOnHover="wiggle" loop={true}>
                                                    <NeoButton
                                                        element="div"
                                                        onClick={handleAddComment}
                                                        className="grid rel place-items-center md:py-3 aspect-square md:px-5 px-3"
                                                        disabled={isSubmitting}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {isSubmitting ? (
                                                                <LoaderCircleIcon
                                                                    animate="path-loop"
                                                                    strokeWidth={2.5}
                                                                    speed={0.05}
                                                                    className="text-black w-5 h-5 scale-125"
                                                                />
                                                            ) : (
                                                                <SendIcon
                                                                    strokeWidth={2.5} className="text-black w-5 h-5 scale-125" />
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
                        </div>
                    </div>
                </div>
            </WoodenPlatform>
        </div>
    );
}
