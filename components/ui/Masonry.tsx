"use client";
import { useResized } from "@/hooks/use-resized";
import { cn, updateSearchParam } from "@/lib/utils";
import { useMemo, useState, useEffect, useRef } from "react";
import { NoteCardProps } from "@/types/note";
import NoteCard from "./NoteCard";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useRouter } from "next/navigation";

interface MasonryProps<T = NoteCardProps> {
    items: T[];
    width?: number;
    Child?: React.FC<T>;
    minWidth?: number;
    gap?: number;
    padding?: number;
    scrollOnNewItem?: 'top' | 'bottom' | null;
}

export default function Masonry({
    items,
    width: propWidth,
    Child,
    minWidth = 250,
    gap,
    padding,
    scrollOnNewItem = null
}: MasonryProps) {
    const { width: hookWidth } = useResized();
    const prevItemsLength = useRef(items.length);
    const prevItemIds = useRef<Set<string>>(new Set());
    const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
    const containerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const router = useRouter();

    // Ensure unique items - deduplicate and sort
    const uniqueItems = useMemo(() => {
        if (!items || items.length === 0) return [];

        const uniqueMap = new Map<string, typeof items[0]>();

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item?.id && !uniqueMap.has(item.id)) {
                uniqueMap.set(item.id, item);
            }
        }

        return Array.from(uniqueMap.values())
    }, [items]);

    const width = propWidth ?? hookWidth;

    const itemsToDisplay = useMemo(() => {
        return uniqueItems;
    }, [uniqueItems]);

    // Track when new items are added
    useEffect(() => {
        const currentIds = new Set(itemsToDisplay.map(item => item.id).filter(Boolean));

        // Find truly new items by comparing IDs
        const newIds = Array.from(currentIds).filter(id => !prevItemIds.current.has(id));
        const hasNewItems = newIds.length > 0;

        if (hasNewItems) {

            const firstItemId = itemsToDisplay[0]?.id;
            if (firstItemId && newIds.includes(firstItemId)) {
                setTimeout(() => {
                    setNewItemIds(prev => {
                        const next = new Set(prev);
                        next.delete(firstItemId);
                        return next;
                    });
                }, 1200);
            } else {
            }
        } else if (itemsToDisplay.length > prevItemsLength.current) {
        } else if (itemsToDisplay.length === prevItemsLength.current) {
        } else {
        }

        prevItemsLength.current = itemsToDisplay.length;
        prevItemIds.current = currentIds;
    }, [itemsToDisplay, scrollOnNewItem]);

    // Calculate number of columns separately for stable column count
    const columnsCount = useMemo(() => {
        if (!width) return 1;
        return Math.floor(((width - 105) / minWidth) * 0.8) || 1;
    }, [width, minWidth]);

    const columns = useMemo(() => {

        if (!width) return null;
        if (itemsToDisplay.length === 0) return null;

        // Create array of empty arrays for each column
        const columnItems: (NoteCardProps & { globalIndex: number })[][] = Array.from(
            { length: columnsCount },
            () => []
        );

        // Distribute items across columns and track global index
        itemsToDisplay.forEach((item, globalIndex) => {
            const columnIndex = globalIndex % columnsCount;
            columnItems[columnIndex].push({ ...item, globalIndex });
        });


        const handleCommentTap = (noteId: string) => {
            if (isMobile) {
                router.push(`/note/${noteId}`);
                return;
            }

            if (!noteId) return;
            updateSearchParam("note", noteId);
        }

        return columnItems.map((columnData, columnIndex) => (
            <MasonryColumn key={columnIndex} gap={gap}>
                {columnData.map((item) => {
                    // Use ONLY the item id for stable keys
                    const itemId = item.id;
                    const isNew = newItemIds.has(item.id || '');

                    return (
                        <motion.div
                            key={itemId}
                            layout
                            transition={{
                                layout: {
                                    type: "spring",
                                    damping: 20,
                                    stiffness: 300
                                }
                            }}
                            className="drop-shadow-[10px_10px_10px_rgba(0,0,0,0.0.15),0_0_1px_rgba(0,0,0,0.0.5)] overflow-visible"
                        >
                            {Child ? <Child {...item} /> : <NoteCard
                                {...item}
                                index={item.globalIndex}
                                isNew={isNew}
                                onCommentTap={() => handleCommentTap(item.id || '')}
                            />}
                        </motion.div>
                    );
                })}
            </MasonryColumn>
        ));
    }, [width, itemsToDisplay, newItemIds, Child, gap, columnsCount, isMobile, router]);

    const styles = { gap: gap ? `${gap}px` : undefined, padding: padding ? `${padding}px` : undefined }

    return (
        <div
            ref={containerRef}
            className={cn("flex gap-8 mx-auto p-3 sm:px-10 w-full")}
            style={styles}
        >
            {columns}
        </div>
    )
}

function MasonryColumn({ children, gap }: { children: React.ReactNode, gap?: number }) {
    return (
        <motion.div
            className="flex flex-col sm:gap-8 gap-4 flex-1"
            style={{ gap: gap ? `${gap}px` : undefined }}
        >
            {children}
        </motion.div>
    )
}
