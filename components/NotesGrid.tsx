"use client";
import Masonry from "@/components/ui/Masonry";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useAppSelector } from "@/store/hooks";
import { selectAllNotes } from "@/store/selectors";
import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSearchParam } from "@/lib/utils";

export default function NotesGrid() {
    const reduxNotes = useAppSelector(selectAllNotes);
    const router = useRouter();
    const isMobile = useIsMobile();

    useEffect(() => {
        if (reduxNotes.length === 0) return;
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, [reduxNotes.length]);

    const handleCommentTap = useCallback((noteId: string) => {
        if (isMobile) {
            router.push(`/note/${noteId}`);
            return;
        }

        if (!noteId) return;
        updateSearchParam("note", noteId);
    }, [isMobile, router]);

    return (
        <Masonry items={reduxNotes} key={"notes"} onCommentTap={handleCommentTap} />
    );
}