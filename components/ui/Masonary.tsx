"use client";
import { useResized } from "@/hooks/use-resized";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import NoteCard, { NoteCardProps } from "./NoteCard";

interface MasonaryProps {
    items: NoteCardProps[];
}

export default function Masonary({ items }: MasonaryProps) {
    const { width, height } = useResized();

    const columns = useMemo(() => {
        if (!width) return null;
        if (items.length === 0) return null;
        
        const columnsToRender = Math.floor((width / 250) * 0.9);

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
                {columnData.map((item, itemIndex) => (
                    <NoteCard key={item.id || itemIndex} {...item} />
                ))}
            </MasonaryColumn>
        ));
    }, [width, items]);

    return (
        <div className={cn("grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5 mx-auto p-5 w-full")}>
            {columns}
        </div>
    )
}

function MasonaryColumn({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-5 w-full">
            {children}
        </div>
    )
}