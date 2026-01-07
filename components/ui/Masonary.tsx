"use client";
import { useResized } from "@/hooks/use-resized";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import NoteCard from "./NoteCard";
import { NoteCardProps } from "@/types/note";
import { AnimatePresence } from "framer-motion";

interface MasonaryProps {
    items: NoteCardProps[];
}

export default function Masonary({ items }: MasonaryProps) {
    const { width, height } = useResized();

    const columns = useMemo(() => {
        if (!width) return null;
        if (items.length === 0) return null;

        const columnsToRender = Math.floor(((width - 100) / 250) * 0.9);

        // Create array of empty arrays for each column
        const columnItems: NoteCardProps[][] = Array.from(
            { length: columnsToRender },
            () => []
        );

        // Distribute items across columns
        items.forEach((item, index) => {
            const columnIndex = index % columnsToRender;
            columnItems[columnIndex].push(item);
        });

        return columnItems.map((columnData, index) => (
            <MasonaryColumn key={index}>
                <AnimatePresence mode="wait">
                    {columnData.map((item, itemIndex) => (
                        <NoteCard key={item.id || itemIndex} {...item} editable={false} />
                    ))}
                </AnimatePresence>
            </MasonaryColumn>
        ));
    }, [width, items]);

    return (
        <div className={cn("flex gap-8 mx-auto p-5 px-10 w-full")}>
            {columns}
        </div>
    )
}

function MasonaryColumn({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-8 flex-1">
            {children}
        </div>
    )
}