"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef, useMemo } from "react";
import WoodenPlatform from "../WoodenPlatform";
import { AnimatePresence, motion } from "framer-motion";
import { luckyPick } from "@/lib/utils";
import { commentNoteCardProps, NoteStyle } from "@/types/note";
import CommentNoteCard from "./NoteCard/CommentCard";
import { FontFamily } from "@/constants/fonts";
import { XIcon } from "../animate-ui/icons/x";
import { AnimateIcon } from "../animate-ui/icons/icon";
import { ClipType } from "./Clip";

// ============================================================================
// Types
// ============================================================================

export type ToastType = "default" | "success" | "error" | "warning" | "info";

export interface Toast {
    id: string;
    type: ToastType;
    title?: string;
    description?: string;
    selectedFont?: FontFamily;
    communityNote?: string;
    duration?: number;
    props: Omit<commentNoteCardProps, "backgroundColor">;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, "id" | "props">) => void;
    removeToast: (id: string) => void;
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const addToast = useCallback((toast: Omit<Toast, "id" | "props">) => {
        const ignoredFontStyles = [FontFamily.Ole, FontFamily.UnifrakturMaguntia, FontFamily.OvertheRainbow, FontFamily.Kablammo];
        const noteStylesThreshold = Object.values(NoteStyle).filter(style => style !== NoteStyle.POLAROID);
        const fontStylesThreshold = Object.values(FontFamily).filter(font => !ignoredFontStyles.includes(font));

        const id = Math.random().toString(36).substring(2, 9);
        const luckyClipType = Object.values(ClipType)[luckyPick(0, Object.values(ClipType).length - 1)];
        const luckyTilt = luckyPick(-4, 4);
        const luckNote = luckyPick(0, noteStylesThreshold.length - 1);
        const luckyFont = luckyPick(0, fontStylesThreshold.length - 1);

        const props: Omit<commentNoteCardProps, "backgroundColor"> = {
            noteStyle: noteStylesThreshold[luckNote],
            clipType: luckyClipType,
            selectedFont: toast.selectedFont ?? fontStylesThreshold[luckyFont],
            tilt: luckyTilt,
            content: toast.description ?? "",
            id: id,
        };

        const newToast = { ...toast, id, props };


        setToasts((prev) => [...prev, newToast]);

        const duration = toast.duration ?? 4000;
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

function useToastContext() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToastContext must be used within ToastProvider");
    }
    return context;
}

// ============================================================================
// Toast Handler (Imperative API)
// ============================================================================

let toastHandler: ((toast: Omit<Toast, "id" | "props">) => void) | null = null;

function setToastHandler(handler: (toast: Omit<Toast, "id" | "props">) => void) {
    toastHandler = handler;
}

function ToastInitializer() {
    const { addToast } = useToastContext();

    useEffect(() => {
        setToastHandler(addToast);
    }, [addToast]);

    return null;
}

interface ToastOptions {
    title?: string;
    description?: string;
    duration?: number;
    communityNote?: string;
    selectedFont?: FontFamily;
}

function createToast(type: ToastType, options: ToastOptions) {
    if (!toastHandler) {
        console.warn("Toast handler not initialized. Make sure ToastProvider is mounted.");
        return;
    }

    toastHandler({
        type,
        title: options.title,
        description: options.description,
        duration: options.duration,
        communityNote: options.communityNote,
        selectedFont: options.selectedFont,
    });
}

export const toast = {
    default: (options: ToastOptions) => createToast("default", options),
    success: (options: ToastOptions) => createToast("success", options),
    error: (options: ToastOptions) => createToast("error", options),
    warning: (options: ToastOptions) => createToast("warning", options),
    info: (options: ToastOptions) => createToast("info", options),

    // Convenience method
    message: (title: string, description?: string) =>
        createToast("default", { title, description }),
};

// ============================================================================
// Toast Item Component
// ============================================================================

interface ToastItemProps {
    toast: Toast;
    onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState(0);
    const [startX, setStartX] = useState(0);
    const toastRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        setStartX(e.clientX);
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const offset = e.clientX - startX;
        setDragOffset(offset);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (!isDragging) return;
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);

        // Swipe threshold: 100px
        if (Math.abs(dragOffset) > 100) {
            onDismiss(toast.id);
        } else {
            setDragOffset(0);
        }
    };

    const renderContent = useCallback(() => {
        switch (toast.type) {
            case "success":
                return (
                    <CommentNoteCard
                        id={toast.id}
                        noteStyle={toast.props.noteStyle}
                        backgroundColor={"#E0FFE0"}
                        content={toast.description ?? ""}
                        tilt={toast.props.tilt}
                        showRedLine={true}
                        selectedFont={toast.props.selectedFont}
                        title={toast.title}
                        clipType={toast.props.clipType}
                    />
                );

            case "error":
                return (
                    <CommentNoteCard
                        id={toast.id}
                        noteStyle={toast.props.noteStyle}
                        backgroundColor={"#FFD6E5"}
                        content={toast.description ?? ""}
                        tilt={toast.props.tilt}
                        showRedLine={true}
                        selectedFont={toast.props.selectedFont}
                        title={toast.title}
                        clipType={toast.props.clipType}
                        communityNote={toast.communityNote}
                    />
                );

            case "warning":
                return (
                    <CommentNoteCard
                        id={toast.id}
                        noteStyle={toast.props.noteStyle}
                        backgroundColor={"#FFE5B4"}
                        content={toast.description ?? ""}
                        tilt={toast.props.tilt}
                        showRedLine={true}
                        selectedFont={toast.props.selectedFont}
                        title={toast.title}
                        clipType={toast.props.clipType}
                        communityNote={toast.communityNote}
                    />
                );

            case "info":
                return (
                    <CommentNoteCard
                        id={toast.id}
                        noteStyle={toast.props.noteStyle}
                        backgroundColor={"#E5E5FF"}
                        content={toast.description ?? ""}
                        tilt={toast.props.tilt}
                        showRedLine={true}
                        selectedFont={toast.props.selectedFont}
                        title={toast.title}
                        clipType={toast.props.clipType}
                        communityNote={toast.communityNote}
                    />
                );

            case "default":
            default:
                return (
                    <CommentNoteCard
                        id={toast.id}
                        noteStyle={toast.props.noteStyle}
                        backgroundColor={"#E5E5E5"}
                        content={toast.description ?? ""}
                        tilt={toast.props.tilt}
                        showRedLine={true}
                        selectedFont={toast.props.selectedFont}
                        title={toast.title}
                        clipType={toast.props.clipType}
                    />
                );
        }
    }, [toast]);

    return (
        <div
            ref={toastRef}
            className="min-w-[320px] max-w-[420px] cursor-grab active:cursor-grabbing transition-transform"
            style={{
                transform: `translateX(${dragOffset}px)`,
                opacity: Math.max(0.3, 1 - Math.abs(dragOffset) / 200),
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
        >
            {/* Board - static dismissal triggers */}
            <div className="absolute top-2 right-2">
                <AnimateIcon
                    animateOnTap="fill"
                    animateOnHover="wiggle"
                    loop={true}
                >
                    <button
                        onClick={() => onDismiss(toast.id)}
                        className="w-7 h-7 cursor-pointer rounded-full hover:bg-destructive text-destructive hover:text-white flex items-center justify-center transition-colors absolute top-2 right-2 z-10"
                        aria-label="Close toast"
                    >
                        <XIcon strokeWidth={2} className="w-4 h-4" />
                    </button>
                </AnimateIcon>
            </div>

            {/* Content - dynamic based on toast type */}
            <div>{renderContent()}</div>
        </div>
    );
}

// ============================================================================
// Toaster Component
// ============================================================================

export function Toaster() {
    const { toasts, removeToast } = useToastContext();

    const sortedToasts = useMemo(() => [...toasts].reverse(), [toasts.length]);

    return (
        <AnimatePresence mode="wait" key={`toaster-container-presence`}>
            <ToastInitializer />
            {sortedToasts.length > 0 && <motion.div key={`toaster-container`} className="fixed top-0 right-0 p-4 pointer-events-none" style={{ zIndex: 9999 }}
                initial={{ opacity: 0, rotate: 10, pointerEvents: "none", transformOrigin: "top right" }}
                animate={{ opacity: 1, rotate: 0, pointerEvents: "auto", transformOrigin: "top right" }}
                exit={{ opacity: 0, rotate: 10, pointerEvents: "none", transformOrigin: "top right" }}
                transition={{ duration: 0.3, type: "spring", bounce: 0 }}
            >
                <div className="flex gap-32 w-full pl-5 relative">
                    <div className="h-3 w-[calc(100%+2rem)] -mr-10 border-2 border-black/20 dark:bg-gray-600 bg-gray-400 rounded shadow-[inset_2px_2px_5px_rgba(255,255,255,0.5),inset_-2px_-2px_5px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)] absolute top-0 right-0 z-10">
                        <div className="h-full w-full bg-white/20 rough-texture"></div>
                    </div>
                    <div className="h-16 w-3 border-2 border-black/20 dark:bg-gray-600 bg-gray-400 rounded shadow-[inset_2px_2px_5px_rgba(255,255,255,0.5),inset_-2px_-2px_5px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                        <div className="h-full w-full bg-white/20 rough-texture"></div>
                    </div>
                    <div className="h-16 w-3 border-2 border-black/20 dark:bg-gray-600 bg-gray-400 rounded shadow-[inset_2px_2px_5px_rgba(255,255,255,0.5),inset_-2px_-2px_5px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                        <div className="h-full w-full bg-white/20 rough-texture"></div>
                    </div>
                </div>

                <WoodenPlatform
                    className="animate-in slide-in-from-top-40 duration-300 w-auto max-h-screen rounded-lg min-w-64 -mt-5 shadow-[-5px_5px_10px_rgba(0,0,0,0.0.25),-2px_-2px_5px_rgba(0,0,0,0.0.5),0_0_4px_rgba(0,0,0,0.0.25),0_0_50px_rgba(0,0,0,0.0.75)] h-auto"
                    noScrews
                >
                    <div className="md:px-3 px-2 md:py-2 py-1 flex border-8 border-background/0 gap-3 relative z-10 rounded-sm shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)] w-full">
                        <div className="absolute wooden inset-0 rounded-sm m-0 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]">
                        </div>
                        <div className="flex flex-col gap-2 pointer-events-auto max-h-[80dvh] overflow-y-auto h-auto overflow-x-hidden">
                            {sortedToasts.map((toast) => (
                                <div
                                    key={`${toast.id}`}
                                    className="animate-in slide-in-from-right-full duration-300 w-full select-none mr-2"
                                >
                                    <ToastItem toast={toast} onDismiss={removeToast} />
                                </div>
                            ))}
                        </div>
                    </div>
                </WoodenPlatform>
            </motion.div>}
        </AnimatePresence>
    );
}