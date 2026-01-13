"use client";
import Masonry from "@/components/ui/Masonry";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useAppSelector } from "@/store/hooks";
import { selectAllNotes } from "@/store/selectors";
import { useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSearchParam } from "@/lib/utils";

export default function NotesGrid() {
    const reduxNotes = useAppSelector(selectAllNotes);
    const router = useRouter();
    const isMobile = useIsMobile();

    // ✅ Store router in ref to prevent callback recreation
    const routerRef = useRef(router);
    const isMobileRef = useRef(isMobile);
    
    useEffect(() => {
        routerRef.current = router;
        isMobileRef.current = isMobile;
    });

    // ✅ No dependencies - stable across renders
    const handleCommentTap = useCallback((noteId: string) => {
        if (isMobileRef.current) {
            routerRef.current.push(`/note/${noteId}`);
            return;
        }

        if (!noteId) return;
        updateSearchParam("note", noteId);
    }, []);

    return (
        <Masonry items={reduxNotes} key={"notes"} onCommentTap={handleCommentTap} />
    );
}