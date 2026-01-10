import { ClipType } from "@/components/ui/Clip";

export enum NoteStyle {
    CLASSIC = "classic",
    SPIRAL_TOP = "spiral-top",
    SPIRAL_LEFT = "spiral-left",
    SPIRAL_BOTTOM = "spiral-bottom",
    SPIRAL_RIGHT = "spiral-right",
    TORN_TOP = "torn-top",
    TORN_BOTTOM = "torn-bottom",
    TORN_LEFT = "torn-left",
    TORN_RIGHT = "torn-right",
    STICKY_NOTE = "sticky-note",
    POLAROID = "polaroid",
    CURVED_BOTTOM = "curved-bottom",
    CURVED_TOP = "curved-top",
    FOLDED_CORNER_TR = "folded-corner-tr",
    FOLDED_CORNER_TL = "folded-corner-tl",
    FOLDED_CORNER_BR = "folded-corner-br",
    FOLDED_CORNER_BL = "folded-corner-bl",
}

export interface NoteCardProps {
    id: string;
    clipType: ClipType;
    noteStyle: NoteStyle;
    backgroundColor: string;
    timestamp: string;
    content: string;
    likesCount: number;
    commentsCount: number;
    viewsCount: number;
    tilt: number;
    isLiked: boolean;
    isCommented: boolean;
    isViewed: boolean;
    showRedLine?: boolean;
    showLines?: boolean;
    selectedFont: string;
    index?: number;
    isNew?: boolean;
    maxWidth?: number | string;
}