"use client";
import { useResized } from "@/hooks/use-resized";
import { cn } from "@/lib/utils";
import { useMemo, useState, useEffect, useRef } from "react";
import { NoteCardProps, NoteStyle } from "@/types/note";
import { AnimatePresence, motion } from "framer-motion";
import NoteCard from "./NoteCard";
import { ClipType } from "./Clip";
import { FontFamily } from "@/constants/fonts";

interface MasonaryProps {
    items: NoteCardProps[];
    enableNewNoteDemo?: boolean; // Set to true to demo new note animation
}

export default function Masonary({ items, enableNewNoteDemo = false }: MasonaryProps) {
    const { width } = useResized();
    const prevItemsLength = useRef(items.length);
    const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());
    const [displayItems, setDisplayItems] = useState(items);
    const demoTriggered = useRef(false);

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

        const columnsToRender = Math.floor(((width - 105) / 250) * 0.8) || 1;

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
            <MasonaryColumn key={`column-${columnIndex}`}>
                <AnimatePresence mode="popLayout" initial={false}>
                    {columnData.map((item) => {
                        const itemId = item.id || item.globalIndex;
                        const isNew = newItemIds.has(item.id || '');

                        const transformOrigin = () => {
                            // Handle PIN clip type (consistent across most styles)
                            if (item.clipType === ClipType.PIN && item.noteStyle !== NoteStyle.TORN_TOP) {
                                return "top";
                            }
                    
                            // Handle STAPLE clip type (consistent across most styles)
                            if (item.clipType === ClipType.Staple && item.noteStyle !== NoteStyle.CURVED_TOP) {
                                return "top left";
                            }
                    
                            // Handle specific note styles
                            switch (item.noteStyle) {
                                case NoteStyle.CURVED_TOP:
                                    return item.tilt < 0 ? "bottom right" : "bottom left";
                    
                                case NoteStyle.FOLDED_CORNER_TR:
                                    return item.tilt < 0 ? "top right" : "top left";
                    
                                case NoteStyle.SPIRAL_BOTTOM:
                                case NoteStyle.SPIRAL_TOP:
                                case NoteStyle.STICKY_NOTE:
                                    return item.tilt > 0 ? "top right" : "top left";
                    
                                case NoteStyle.TORN_TOP:
                                    return "top left";
                    
                                default:
                                    return item.tilt < 0 ? "top right" : "top left";
                            }
                        };
                        
                        return (
                            <NoteCard 
                                key={itemId} 
                                {...item} 
                                index={item.globalIndex}
                                isNew={isNew}
                                transformOrigin={transformOrigin()}
                            />
                        );
                    })}
                </AnimatePresence>
            </MasonaryColumn>
        ));
    }, [width, itemsToDisplay, newItemIds]);

    return (
        <div className={cn("flex gap-8 mx-auto p-5 px-10 w-full")}>
            {columns}
        </div>
    )
}

function MasonaryColumn({ children }: { children: React.ReactNode }) {
    return (
        <motion.div 
            className="flex flex-col gap-8 flex-1"
            layout
        >
            {children}
        </motion.div>
    )
}