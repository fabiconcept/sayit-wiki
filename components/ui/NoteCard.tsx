export enum ClipType {
    PIN = "pin",
    CLIP = "clip",
    TAPE="tape",
    NAIL="nail",
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
}

export default function NoteCard({ id, clipType, backgroundColor, timestamp, content, likesCount, commentsCount, viewsCount, isLiked, isCommented, isViewed }: NoteCardProps) {
    return (
        <div className="">NoteCard {id}</div>
    )
}