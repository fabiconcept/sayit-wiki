"use client";
import Masonry from "@/components/ui/Masonry";
import { useAppSelector } from "@/store/hooks";
import { selectAllNotes } from "@/store/selectors";
import NoteCard from "./ui/NoteCard";
import { NoteCardProps } from "@/types/note";

export default function NotesGrid() {
    const reduxNotes = useAppSelector(selectAllNotes);

    return (
        <div key={"notesGrid"} className="pt-3">
            <Masonry items={reduxNotes || []} key={"notes"}/>
        </div>
    );
}
