"use client";
import React, { useRef } from 'react';
import Clip from "./Clip";
import { cn } from '@/lib/utils';

export enum ClipType {
    PIN = "pin",
    CLIP = "clip",
    TAPE = "tape",
    NAIL = "nail",
}

export interface NoteCardProps {
    id: string;
    clipType: ClipType;
    backgroundColor: string;
    timestamp: string;
    content: string;
    likesCount: number;
    commentsCount: number;
    viewsCount: number;
    isLiked: boolean;
    isCommented: boolean;
    isViewed: boolean;
    showRedLine?: boolean;
    selectedFont: string;
    onContentChange?: (id: string, content: string) => void;
}


const NotebookPaper: React.FC<NoteCardProps> = ({
    id,
    clipType,
    backgroundColor,
    timestamp,
    content,
    likesCount,
    commentsCount,
    viewsCount,
    isLiked,
    isCommented,
    isViewed,
    showRedLine = !false,
    onContentChange,
    selectedFont
}) => {
    const textRef = useRef<HTMLDivElement>(null);

    const maxWidth = "450px";
    const minHeight = "50px";

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        const newText = e.currentTarget.textContent || '';
        if (onContentChange) {
            onContentChange(id, newText);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
    };

    return (
        <div className={cn("relative", selectedFont)}>
            <div style={{
                ...styles.paper,
                maxWidth,
                minHeight,
                backgroundColor,
                borderColor: backgroundColor,
            }}>
                {showRedLine && <div style={styles.redMargin} />}
                <div style={styles.lines}>
                    <div
                        ref={textRef}
                        contentEditable={true}
                        suppressContentEditableWarning
                        spellCheck={false}
                        style={{
                            marginLeft: showRedLine ? '55px' : '20px',
                            ...styles.text,
                        }}
                        onInput={handleInput}
                        onPaste={handlePaste}
                    >
                        {content}
                    </div>
                </div>
            </div>
            <Clip />
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    paper: {
        position: 'relative',
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
        borderRadius: '2px',
        overflow: 'hidden',
        transition: 'transform 0.3s ease',
        fontFamily: "'Indie Flower', cursive"
    },
    redMargin: {
        position: 'absolute',
        left: '45px',
        top: 0,
        height: '100%',
        width: '2px',
        background: 'rgba(255, 0, 0, 0.35)',
        pointerEvents: 'none',
        zIndex: 2
    },
    lines: {
        marginTop: '40px',
        minHeight: 'calc(100% - 40px)',
        width: '100%',
        backgroundImage: 'repeating-linear-gradient(transparent 0px, transparent 24px, #4682b4 24px, #4682b4 25px, transparent 25px)',
        paddingBottom: '40px'
    },
    text: {
        marginTop: '25px',
        marginRight: '20px',
        marginBottom: '20px',
        lineHeight: '25px',
        fontSize: '1rem',
        color: '#2c3e50',
        outline: 'none',
        minHeight: '200px',
        wordWrap: 'break-word',
        cursor: 'text',
        whiteSpace: 'pre-wrap'
    }
};

export default NotebookPaper;