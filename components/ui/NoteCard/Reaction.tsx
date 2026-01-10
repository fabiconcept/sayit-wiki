"use client";
import { Heart } from "@/components/animate-ui/icons/heart";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { cn, numberShortForm, updateSearchParam } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";
import { MessageCircleMoreIcon } from "@/components/animate-ui/icons/message-circle-more";
import { useEffect, useRef, useState } from "react";
import { EllipsisVerticalIcon } from "@/components/animate-ui/icons/ellipsis-vertical";
import { UserRoundIcon } from "@/components/animate-ui/icons/user-round";
import { motion, inView, useTransform, useMotionValue, animate } from "framer-motion";
import { DropdownMenu, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "../dropdown-menu";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "next/navigation";

interface ReactionStatistics {
    likes: number;
    comments: number;
    views: number;
    isLiked: boolean;
    isCommented: boolean;
    isViewed: boolean;
    noteId: string;
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

    const handleLike = () => {
        setLikes(likes + 1);
        setIsLiked(!isLiked);
    }

    const handleComment = () => {
        if (isMobile) {
            router.push(`/note/${statistics.noteId}`);
            return;
        }

        if (!statistics.noteId) return;
        updateSearchParam("note", statistics.noteId);
    }

    const handleView = () => {
        if (!statistics.noteId) return;
        setViews(views + 1);
        setIsViewed(true);
    }

    useEffect(() => {
        if (!ref.current) return;
        inView(ref.current, handleView);
    }, [ref, inView]);
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
                <div className="flex items-center gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild className="cursor-pointer">
                            <AnimateIcon
                                animateOnTap={isLiked ? undefined : "fill"}
                                animateOnHover={isLiked ? undefined : "path"}
                                animate={isLiked ? "fill" : undefined}
                                persistOnAnimateEnd={isLiked ? true : false}
                                className="cursor-pointer -rotate-2 active:scale-95 transition-all duration-150 ease-in-out"
                                onClick={handleLike}
                            >
                                <Heart
                                    strokeWidth={2}
                                    className={cn("sm:w-4 text-black sm:h-4 w-3 h-3 scale-125", isLiked ? "stroke-destructive" : "stroke-black")}
                                    animate={isLiked ? "fill" : undefined}
                                    fill={isLiked ? "red" : "none"}
                                />
                            </AnimateIcon>
                        </TooltipTrigger>
                        <TooltipContent>
                            Like this note
                        </TooltipContent>
                    </Tooltip>
                    <span className="text-sm font-semibold text-black">{numberShortForm(likes)}</span>
                </div>
                <Tooltip>
                    <TooltipTrigger asChild className="cursor-pointer">
                        <AnimateIcon
                            animateOnTap="fill"
                            animateOnHover="path"
                            className="flex items-center gap-2 cursor-pointer rotate-2 active:scale-95 transition-all duration-150 ease-in-out"
                            onClick={handleComment}
                        >
                            <MessageCircleMoreIcon strokeWidth={2} className="sm:w-4 text-black sm:h-4 w-3 h-3 scale-125" />
                            <span className="text-sm font-semibold text-black">{numberShortForm(comments)}</span>
                        </AnimateIcon>
                    </TooltipTrigger>
                    <TooltipContent>
                        Comment on this note
                    </TooltipContent>
                </Tooltip>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AnimateIcon
                            animateOnTap="fill"
                            animateOnHover="path"
                            className="flex items-center gap-2 rotate-5 cursor-help transition-all duration-150 ease-in-out"
                        >
                            <UserRoundIcon strokeWidth={2} className="sm:w-4 text-black sm:h-4 w-3 h-3 scale-125" />
                            <span className="text-sm font-semibold text-black">{numberShortForm(views)}</span>
                        </AnimateIcon>
                    </TooltipTrigger>
                    <TooltipContent>
                        Viewed by {numberShortForm(views)} people
                    </TooltipContent>
                </Tooltip>
            </div>
            <DropdownMenu>
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
                    <DropdownMenuItem>Copy</DropdownMenuItem>
                    <DropdownMenuItem>Share</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive hover:text-destructive border border-destructive/50 bg-destructive/5">Report</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </motion.div>
    )
}