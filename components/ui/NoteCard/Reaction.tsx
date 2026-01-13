"use client";
import { Heart } from "@/components/animate-ui/icons/heart";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { cn, copyToClipboard, numberShortForm, removeSearchParam, updateSearchParam } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { MessageCircleMoreIcon } from "@/components/animate-ui/icons/message-circle-more";
import { useCallback, useEffect, useRef, useState } from "react";
import { EllipsisVerticalIcon } from "@/components/animate-ui/icons/ellipsis-vertical";
import { UserRoundIcon } from "@/components/animate-ui/icons/user-round";
import { motion, inView } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "../dropdown-menu";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "next/navigation";
import { toast } from "../toast";
import { FontFamily } from "@/constants/fonts";

interface ReactionStatistics {
    likes: number;
    comments: number;
    views: number;
    isLiked: boolean;
    isCommented: boolean;
    isViewed: boolean;
    noteId: string;
    canReact: boolean;
    content: string;
    onDropMenuOpen: (open: boolean) => void;
    onCommentTap: () => void;
    shareTrigger: (color: string) => void;
    selectedFont: FontFamily;
}

export default function ReactionCard({ statistics, className }: { statistics: ReactionStatistics, className: string }) {
    const isMobile = useIsMobile();
    const router = useRouter();

    const [likes, setLikes] = useState(statistics.likes);
    const [comments, setComments] = useState(statistics.comments);
    const [views, setViews] = useState(statistics.views);
    const [isLiked, setIsLiked] = useState(statistics.isLiked);
    const [isCommented, setIsCommented] = useState(statistics.isCommented);
    const [isViewed, setIsViewed] = useState(statistics.isViewed);

    const ref = useRef<HTMLDivElement>(null);

    const handleLike = useCallback(() => {
        if (!statistics.canReact) return;
        if (isLiked) {
            setLikes(likes - 1);
            setIsLiked(false);
            return;
        }

        setLikes(likes + 1);
        setIsLiked(!isLiked);
    }, [statistics.canReact, isLiked, likes]);

    const handleView = useCallback(() => {
        if (!statistics.canReact) return;
        if (!statistics.noteId) return;
        setIsViewed((prev) => {
            if (prev) return prev;
            setViews(views + 1);
            return true;
        });
    }, [statistics.canReact, statistics.noteId, views]);

    const handleCopy = useCallback(async () => {
        if (!statistics.canReact) return;
        if (!statistics.noteId) return;

        if (await copyToClipboard(statistics.content)) {
            toast.success({
                title: "Note copied",
                description: statistics.content.length > 100 ? statistics.content.slice(0, 100) + "..." : statistics.content,
                duration: 2000,
                selectedFont: statistics.selectedFont,
            });
        }
    }, [statistics.canReact, statistics.noteId, statistics.content, statistics.selectedFont]);

    const handleReport = useCallback(() => {
        if (!statistics.canReact) return;
        if (!statistics.noteId) return;

        removeSearchParam("note");
        updateSearchParam("note-to-report", statistics.noteId);
    }, [statistics.canReact, statistics.noteId]);

    useEffect(() => {
        if (!ref.current) return;
        inView(ref.current, handleView);
    }, [ref, handleView]);
    return (
        <motion.div
            className={cn("flex items-center gap-5", className)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            ref={ref}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center gap-5 flex-1">
                <Tooltip>
                    <TooltipTrigger disabled={!statistics.canReact} asChild className="cursor-pointer">
                        <AnimateIcon
                            animateOnTap={statistics.canReact ? isLiked ? undefined : "fill" : undefined}
                            animateOnHover={statistics.canReact ? isLiked ? undefined : "path" : undefined}
                            animate={statistics.canReact ? isLiked ? "fill" : undefined : undefined}
                            persistOnAnimateEnd={statistics.canReact ? isLiked ? true : false : false}
                            className={cn("cursor-pointer flex items-center gap-1 active:scale-95 transition-all duration-150 ease-in-out", !statistics.canReact ? "cursor-not-allowed opacity-50" : "")}
                            onClick={handleLike}
                        >
                            <Heart
                                strokeWidth={2}
                                className={cn("sm:w-4 text-black sm:h-4 w-3 h-3 scale-125 -rotate-2", isLiked ? "stroke-destructive" : "stroke-black")}
                                animate={isLiked ? "fill" : undefined}
                                fill={isLiked ? "red" : "none"}
                            />
                            <span className="text-sm font-semibold text-black">{numberShortForm(likes)}</span>
                        </AnimateIcon>
                    </TooltipTrigger>
                    <TooltipContent>
                        {statistics.canReact ? "Like this note" : "You can't like this note"}
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild className="cursor-pointer">
                        <AnimateIcon
                            animateOnTap={statistics.canReact ? "fill" : undefined}
                            animateOnHover={statistics.canReact ? "path" : undefined}
                            className={cn("flex items-center gap-1 cursor-pointer active:scale-95 transition-all duration-150 ease-in-out", !statistics.canReact ? "cursor-not-allowed opacity-50" : "")}
                            onClick={statistics.onCommentTap}
                        >
                            <MessageCircleMoreIcon
                                strokeWidth={2}
                                className={cn(
                                    "sm:w-4 text-black sm:h-4 w-3 h-3 scale-125 rotate-2",
                                    isCommented ? "stroke-blue-500" : "stroke-black"
                                )}
                                fill={isCommented ? "rgb(255,255,255,0.25)" : "none"}
                            />
                            <span className="text-sm font-semibold text-black">{numberShortForm(comments)}</span>
                        </AnimateIcon>
                    </TooltipTrigger>
                    <TooltipContent>
                        {statistics.canReact ? "Comment on this note" : "You can't comment on this note"}
                    </TooltipContent>
                </Tooltip>

                <Tooltip>
                    <TooltipTrigger asChild>
                        <AnimateIcon
                            animateOnTap="fill"
                            animateOnHover="path"
                            className="flex items-center gap-1 cursor-help transition-all duration-150 ease-in-out"
                        >
                            <UserRoundIcon strokeWidth={2} className="sm:w-3.5 text-black sm:h-3.5 w-2.5 h-2.5 scale-125 opacity-75 rotate-5" />
                            <span className="text-sm font-semibold text-black">{numberShortForm(views)}</span>
                        </AnimateIcon>
                    </TooltipTrigger>
                    <TooltipContent>
                        Viewed by {numberShortForm(views)} people
                    </TooltipContent>
                </Tooltip>
            </div>
            {statistics.canReact && <DropdownMenu
                onOpenChange={statistics.onDropMenuOpen}
            >
                <DropdownMenuTrigger>
                    <Tooltip>
                        <TooltipTrigger asChild className="cursor-pointer">
                            <AnimateIcon animateOnTap="default" animateOnHover="horizontal" className="flex items-center gap-2 cursor-pointer -rotate-2 active:scale-95 transition-all duration-150 ease-in-out">
                                <EllipsisVerticalIcon strokeWidth={2} className="sm:w-4 text-black sm:h-4 w-3 h-3 scale-125" />
                            </AnimateIcon>
                        </TooltipTrigger>
                        <TooltipContent>
                            More options
                        </TooltipContent>
                    </Tooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="gap-1">
                    <DropdownMenuItem className="text-white justify-center text-sm" onClick={handleCopy}>Copy</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => statistics.shareTrigger("#f3e5ab")} className="text-white justify-center text-sm">Share</DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-200 justify-center text-sm hover:text-destructive dark:hover:text-red-100 border border-destructive/50 bg-red-900/10 hover:bg-red-900/20"
                        onClick={handleReport}
                    >Report</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>}
        </motion.div>
    )
}