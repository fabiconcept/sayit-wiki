"use client";
import Masonry from "@/components/ui/Masonry";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useGetNotesQuery } from "@/store/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setNotes, addNotes, setLoading, setHasMore, setCurrentPage } from "@/store/slices/notesSlice";
import { selectAllNotes, selectNotesLoading, selectNotesHasMore, selectNotesCurrentPage } from "@/store/selectors";
import { useEffect, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateSearchParam } from "@/lib/utils";
import Loader from "./Loader";
import Lottie from "lottie-react";
import emptyAnimation from "./lottie/ghosty.json";
import useSoundEffect from "@useverse/usesoundeffect";

export default function NotesGrid() {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const isMobile = useIsMobile();
    const containerRef = useRef<HTMLDivElement>(null);
    const isLoadingRef = useRef(false);

    // Get data from Redux slice
    const notes = useAppSelector(selectAllNotes);
    const isLoading = useAppSelector(selectNotesLoading);
    const hasMore = useAppSelector(selectNotesHasMore);
    const currentPage = useAppSelector(selectNotesCurrentPage);

    const { play } = useSoundEffect("/sayit-wiki-sound/click-v1.mp3", {
        volume: 0.5
    });

    // Fetch initial notes
    const { data, isLoading: isFetching, error } = useGetNotesQuery({
        page: 1,
        limit: 20,
        sort: 'recent'
    }, {
        skip: currentPage > 0, // Skip if we already have data
    });

    // Sync RTK Query data to Redux slice
    useEffect(() => {
        if (data && currentPage === 0) {
            dispatch(setNotes(data.notes));
            dispatch(setHasMore(data.pagination.hasMore));
            dispatch(setCurrentPage(1));
        }
    }, [data, currentPage, dispatch]);

    // Handle load more
    const loadMore = useCallback(async () => {
        if (!hasMore || isLoading || isLoadingRef.current) return;

        isLoadingRef.current = true;
        dispatch(setLoading(true));

        try {
            // Manually fetch next page
            const response = await fetch(`/api/v1/notes?page=${currentPage + 1}&limit=20&sort=recent`);
            const result = await response.json();

            if (result.success && result.data) {
                dispatch(addNotes(result.data.notes));
                dispatch(setHasMore(result.data.pagination.hasMore));
                dispatch(setCurrentPage(currentPage + 1));
            }
        } catch (error) {
            console.error('Error loading more notes:', error);
        } finally {
            dispatch(setLoading(false));
            isLoadingRef.current = false;
        }
    }, [hasMore, isLoading, currentPage, dispatch]);

    // Infinite scroll: trigger at 70% scroll position
    useEffect(() => {
        const handleScroll = () => {
            if (!hasMore || isLoading || isLoadingRef.current) return;

            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;

            if (scrollPercentage >= 70) {
                loadMore();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [hasMore, isLoading, loadMore]);

    // Only scroll to top on initial load (when currentPage becomes 1)
    useEffect(() => {
        if (currentPage === 1 && notes.length > 0) {
            if (window.lenis) {
                window.lenis.scrollTo(0, { duration: 1.2 });
            } else {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }
    }, [currentPage]);

    const handleCommentTap = useMemo(() => {
        return (noteId: string) => {
            if (isMobile) {
                router.push(`/note/${noteId}`);
                return;
            }

            if (!noteId) return;
            updateSearchParam("note", noteId);
        };
    }, [isMobile, router]);

    if (isFetching && notes.length === 0) {
        return <Loader>
            <h4 className="md:text-base sm:text-sm text-xs text-white/80 font-bold animate-bounce">Retrieving notes...</h4>
        </Loader>;
    }

    if (error && notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-60 gap-2">
                <Lottie
                    animationData={emptyAnimation}
                    loop={true}
                    className="sm:size-40 size-24"
                    style={{ mixBlendMode: "screen" }}
                />
                <p className="text-sm font-bold">No comments yet</p>
                <p className="text-sm -mt-2 text-white/60 px-10 text-center">Be the first to leave a comment!</p>
            </div>
        );
    }
    if (error && notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-60 gap-2">
                <Lottie
                    animationData={emptyAnimation}
                    loop={true}
                    className="sm:size-40 size-24"
                    style={{ mixBlendMode: "screen" }}
                />
                <p className="text-sm font-bold">Oops! An Error Occured</p>
                <p className="text-sm -mt-2 text-white/60 px-10 text-center">Please reload the page that usually fix every problem!</p>
            </div>
        );
    }
    if (notes.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-60 gap-2">
                <Lottie
                    animationData={emptyAnimation}
                    loop={true}
                    className="sm:size-40 size-24"
                    style={{ mixBlendMode: "screen" }}
                />
                <p className="text-sm font-bold text-white">You're the First one Here</p>
                <p className="text-sm -mt-2 text-white/80 dark:text-white/70 px-10 text-center">Add a note to the wall to let em know you was here!</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="w-full">
            <Masonry items={notes} key={"notes"} onCommentTap={(id) => {
                if (!id) return;
                play();
                handleCommentTap(id);
            }} />

            {/* Loading more notes */}
            {isLoading && hasMore && (
                <div className="text-center py-12">
                    <Loader>
                        <h4 className="md:text-base sm:text-sm text-xs text-black font-bold animate-bounce">
                            Digging through the wall...
                        </h4>
                    </Loader>
                </div>
            )}



            {/* End of notes message */}
            {!hasMore && notes.length > 0 && (
                <div className="text-center py-12">
                    <div className="inline-flex flex-col items-center px-8 py-4">
                        <Lottie
                            animationData={emptyAnimation}
                            loop={true}
                            className="size-20"
                            style={{ mixBlendMode: "screen" }}
                        />
                        <p className="text-sm text-white/70 mt-1">
                            That's all the notes for now
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
