"use client";
import { useResized } from "@/hooks/use-resized";
import { cn } from "@/lib/utils";
import { useMemo, useState, useEffect, useRef } from "react";
import { NoteCardProps, NoteStyle } from "@/types/note";
import { AnimatePresence, motion } from "framer-motion";
import NoteCard from "./NoteCard";
import { ClipType } from "./Clip";
import { FontFamily } from "@/constants/fonts";

interface MasonryProps<T = NoteCardProps> {
    items: T[];
    width?: number;
    enableNewNoteDemo?: boolean;
    Child?: React.FC<T>;
    minWidth?: number;
    gap?: number;
    padding?: number;
}

export default function Masonry({ items, width: propWidth, enableNewNoteDemo = false, Child, minWidth = 250, gap, padding }: MasonryProps) {
    const { width: hookWidth } = useResized();
    const prevItemsLength = useRef(items.length);
    const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
    const [displayItems, setDisplayItems] = useState<NoteCardProps[]>([]);
    const demoTriggered = useRef(false);

    function removeDuplicatesAndSort<T extends { id: string }>(items: T[]): T[] {
        if (items.length === 0) return [];
        
        // Single pass: deduplicate using Map (O(n))
        const uniqueMap = new Map<string, T>();
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            uniqueMap.set(item.id, item);
        }
        
        // Convert to array and sort in one go (O(n log n))
        return Array.from(uniqueMap.values())
            .sort((a, b) => b.id.localeCompare(a.id)); // Reversed sort (descending)
    }

    items = useMemo(() => removeDuplicatesAndSort(items), [items]);

    useEffect(()=>{
        if (!items) return;

        setDisplayItems(items);
    }, [items])

    // Use prop width if provided, otherwise fall back to hook width
    const width = propWidth ?? hookWidth;

    // Demo: Add a new note after 5 seconds (EASILY REMOVABLE - just set enableNewNoteDemo to false)
    useEffect(() => {
        if (enableNewNoteDemo || demoTriggered.current) return;

        const timer = setTimeout(() => {
            demoTriggered.current = true;
            const demoNote: NoteCardProps = {
                id: 'demo-new-note',
                clipType: ClipType.PIN,
                noteStyle: NoteStyle.STICKY_NOTE,
                backgroundColor: '#FFD700',
                timestamp: new Date().toISOString(),
                content: '🎉 This is a NEW note with bubble animation!',
                likesCount: 0,
                commentsCount: 0,
                viewsCount: 0,
                selectedFont: FontFamily.Schoolbell,
                tilt: Math.random() * 6 - 3,
                isLiked: false,
                isCommented: false,
                isViewed: false,
            };
            setDisplayItems(prev => [demoNote, ...prev]);
        }, 5000);

        return () => clearTimeout(timer);
    }, [enableNewNoteDemo]);

    // Use displayItems instead of items for demo mode
    const itemsToDisplay = useMemo(() => {
        return enableNewNoteDemo ? displayItems : items;
    }, [enableNewNoteDemo, displayItems, items]);

    // Track when new items are added
    useEffect(() => {
        if (itemsToDisplay.length > prevItemsLength.current) {
            // New items were added - mark the first item as new
            const firstItemId = itemsToDisplay[0]?.id;
            if (firstItemId) {
                setNewItemIds(new Set([firstItemId]));
                // Clear the "new" status after animation completes
                setTimeout(() => {
                    setNewItemIds(prev => {
                        const next = new Set(prev);
                        next.delete(firstItemId);
                        return next;
                    });
                }, 1200);
            }
        }
        prevItemsLength.current = itemsToDisplay.length;
    }, [itemsToDisplay]);

    const columns = useMemo(() => {
        if (!width) return null;
        if (itemsToDisplay.length === 0) return null;

        const columnsToRender = Math.floor(((width - 105) / minWidth) * 0.8) || 1;

        // Create array of empty arrays for each column
        const columnItems: (NoteCardProps & { globalIndex: number })[][] = Array.from(
            { length: columnsToRender },
            () => []
        );

        // Distribute items across columns and track global index
        itemsToDisplay.forEach((item, globalIndex) => {
            const columnIndex = globalIndex % columnsToRender;
            columnItems[columnIndex].push({ ...item, globalIndex });
        });

        return columnItems.map((columnData, columnIndex) => (
            <MasonryColumn key={`column-${columnIndex}`} gap={gap}>
                <AnimatePresence mode="popLayout" initial={false}>
                    {columnData.map((item) => {
                        const itemId = item.id || item.globalIndex;
                        const isNew = newItemIds.has(item.id || '');

                        return (
                            <div className="drop-shadow-[10px_10px_10px_rgba(0,0,0,0.0.15),0_0_1px_rgba(0,0,0,0.0.5)]">
                                {Child ? <Child key={itemId} {...item} /> : <NoteCard
                                    key={itemId}
                                    {...item}
                                    index={item.globalIndex}
                                    isNew={isNew}
                                />}
                            </div>
                        );
                    })}
                </AnimatePresence>
            </MasonryColumn>
        ));
    }, [width, itemsToDisplay, newItemIds]);

    const styles = { gap: gap ? `${gap}px` : undefined, padding: padding ? `${padding}px` : undefined }

    return (
        <div
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
            layout
        >
            {children}
        </motion.div>
    )
}