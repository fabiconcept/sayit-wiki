"use client";
import { removeSearchParam, updateSearchParam } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useMemo } from "react";

export default function ViewNoteModal() {
    const searchParams = useSearchParams();

    const isViewingNote = useMemo(() => Boolean(searchParams.get("note")), [searchParams]);

    return (
        <Dialog
            open={isViewingNote}
            onOpenChange={(open) => {
                if (!open) {
                    removeSearchParam("note");
                }
            }}
        >
            <DialogContent className="min-h-20">
                <DialogHeader>
                    <DialogTitle>View Note</DialogTitle>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}