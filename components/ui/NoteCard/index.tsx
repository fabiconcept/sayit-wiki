"use client";
import React, { useMemo, useRef } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import Clip, { ClipType } from "../Clip";
import { cn, darkenHex, formatSocialTime } from '@/lib/utils';
import '@/app/styles/notes.css';
import { NoteCardProps, NoteStyle } from '@/types/note';
import { useTheme } from 'next-themes';
import ReactionCard from './Reaction';
import { FontFamily } from '@/constants/fonts';

const NoteCard: React.FC<NoteCardProps> = ({
    id,
    clipType,
    noteStyle = NoteStyle.CLASSIC,
    backgroundColor,
    timestamp,
    content,
    likesCount,
    commentsCount,
    viewsCount,
    tilt,
    isLiked,
    isCommented,
    isViewed,
    showRedLine = true,
    showLines = true,
    selectedFont,
    index = 0,
    isNew = false,
}) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const textRef = useRef<HTMLDivElement>(null);
    const noteRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(noteRef, {
        once: true,
        margin: "-50px",
        amount: 0.25
    });

    const transformOrigin = (() => {
        // Handle PIN clip type (consistent across most styles)
        if (clipType === ClipType.PIN && noteStyle !== NoteStyle.TORN_TOP) {
            return "top";
        }

        // Handle STAPLE clip type (consistent across most styles)
        if (clipType === ClipType.Staple && noteStyle !== NoteStyle.CURVED_TOP) {
            return "top left";
        }

        // Handle specific note styles
        switch (noteStyle) {
            case NoteStyle.CURVED_TOP:
                return tilt < 0 ? "bottom right" : "bottom left";

            case NoteStyle.FOLDED_CORNER_TR:
                return tilt < 0 ? "top right" : "top left";

            case NoteStyle.SPIRAL_BOTTOM:
            case NoteStyle.SPIRAL_TOP:
            case NoteStyle.STICKY_NOTE:
                return tilt > 0 ? "top right" : "top left";

            case NoteStyle.TORN_TOP:
                return "top left";

            default:
                return tilt < 0 ? "top right" : "top left";
        }
    })();

    const maxWidth = "450px";
    const minHeight = "50px";

    const date = new Date(timestamp);
    const timestampText = formatSocialTime(date, true);

    // Smart delay calculation - stagger based on position
    // Add some randomness to avoid rigid patterns
    const baseDelay = (index % 10) * 0.03;
    const randomOffset = Math.random() * 0.05;
    const staggerDelay = baseDelay + randomOffset;


    // Animation variants for existing notes (in-view)
    const existingNoteVariants: Variants = useMemo(() => (
        {
            hidden: {
                opacity: 0,
                y: 30,
                scale: 0.95,
                rotate: 0,
                transformOrigin: transformOrigin,
            },
            visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                rotate: tilt * 0.8,
                transformOrigin: transformOrigin,
                transition: {
                    type: "spring",
                    damping: 15,
                    stiffness: 150,
                    mass: 0.6,
                    delay: staggerDelay,
                    opacity: {
                        duration: 0.15,
                        ease: "easeOut",
                        delay: staggerDelay
                    }
                }
            }
        }
    ), [tilt, staggerDelay, transformOrigin]);

    // Animation variants for new notes (bubble/spring effect)
    const newNoteVariants: Variants = useMemo(() => (
        {
            hidden: {
                opacity: 0,
                transformOrigin: transformOrigin,
                scale: 0,
                y: -100,
                rotate: tilt * 2
            },
            visible: {
                opacity: 1,
                transformOrigin: transformOrigin,
                scale: 1,
                y: 0,
                rotate: tilt * 0.8,
                transition: {
                    type: "spring",
                    damping: 12,
                    stiffness: 200,
                    mass: 0.8,
                    opacity: {
                        duration: 0.3,
                        ease: "easeOut"
                    }
                }
            }
        }
    ), [tilt, transformOrigin]);

    const getClipPathStyle = () => {
        switch (noteStyle) {
            case NoteStyle.SPIRAL_TOP:
                return {
                    clipPath: `polygon(
                        0 0,
                        0 8px, 5% 8px, 5% 0,
                        10% 0, 10% 8px, 15% 8px, 15% 0,
                        20% 0, 20% 8px, 25% 8px, 25% 0,
                        30% 0, 30% 8px, 35% 8px, 35% 0,
                        40% 0, 40% 8px, 45% 8px, 45% 0,
                        50% 0, 50% 8px, 55% 8px, 55% 0,
                        60% 0, 60% 8px, 65% 8px, 65% 0,
                        70% 0, 70% 8px, 75% 8px, 75% 0,
                        80% 0, 80% 8px, 85% 8px, 85% 0,
                        90% 0, 90% 8px, 95% 8px, 95% 0,
                        100% 0, 100% 100%, 0 100%
                    )`
                };

            case NoteStyle.SPIRAL_BOTTOM:
                return {
                    clipPath: `polygon(
                        0 0, 100% 0, 100% 100%,
                        100% calc(100% - 8px), 95% calc(100% - 8px), 95% 100%,
                        90% 100%, 90% calc(100% - 8px), 85% calc(100% - 8px), 85% 100%,
                        80% 100%, 80% calc(100% - 8px), 75% calc(100% - 8px), 75% 100%,
                        70% 100%, 70% calc(100% - 8px), 65% calc(100% - 8px), 65% 100%,
                        60% 100%, 60% calc(100% - 8px), 55% calc(100% - 8px), 55% 100%,
                        50% 100%, 50% calc(100% - 8px), 45% calc(100% - 8px), 45% 100%,
                        40% 100%, 40% calc(100% - 8px), 35% calc(100% - 8px), 35% 100%,
                        30% 100%, 30% calc(100% - 8px), 25% calc(100% - 8px), 25% 100%,
                        20% 100%, 20% calc(100% - 8px), 15% calc(100% - 8px), 15% 100%,
                        10% 100%, 10% calc(100% - 8px), 5% calc(100% - 8px), 5% 100%,
                        0 100%
                    )`
                };

            case NoteStyle.SPIRAL_LEFT:
                return {
                    clipPath: `polygon(
                        0 0, 8px 0, 8px 5%, 0 5%,
                        0 10%, 8px 10%, 8px 15%, 0 15%,
                        0 20%, 8px 20%, 8px 25%, 0 25%,
                        0 30%, 8px 30%, 8px 35%, 0 35%,
                        0 40%, 8px 40%, 8px 45%, 0 45%,
                        0 50%, 8px 50%, 8px 55%, 0 55%,
                        0 60%, 8px 60%, 8px 65%, 0 65%,
                        0 70%, 8px 70%, 8px 75%, 0 75%,
                        0 80%, 8px 80%, 8px 85%, 0 85%,
                        0 90%, 8px 90%, 8px 95%, 0 95%,
                        0 100%, 100% 100%, 100% 0
                    )`
                };

            case NoteStyle.SPIRAL_RIGHT:
                return {
                    clipPath: `polygon(
                        0 0, 100% 0,
                        100% 5%, calc(100% - 8px) 5%, calc(100% - 8px) 0,
                        100% 10%, calc(100% - 8px) 10%, calc(100% - 8px) 15%, 100% 15%,
                        100% 20%, calc(100% - 8px) 20%, calc(100% - 8px) 25%, 100% 25%,
                        100% 30%, calc(100% - 8px) 30%, calc(100% - 8px) 35%, 100% 35%,
                        100% 40%, calc(100% - 8px) 40%, calc(100% - 8px) 45%, 100% 45%,
                        100% 50%, calc(100% - 8px) 50%, calc(100% - 8px) 55%, 100% 55%,
                        100% 60%, calc(100% - 8px) 60%, calc(100% - 8px) 65%, 100% 65%,
                        100% 70%, calc(100% - 8px) 70%, calc(100% - 8px) 75%, 100% 75%,
                        100% 80%, calc(100% - 8px) 80%, calc(100% - 8px) 85%, 100% 85%,
                        100% 90%, calc(100% - 8px) 90%, calc(100% - 8px) 95%, 100% 95%,
                        100% 100%, 0 100%
                    )`
                };

            case NoteStyle.TORN_TOP:
                return {
                    clipPath: `polygon(
                        0 0, 2% 1.5%, 5% 0.5%, 8% 2%, 12% 1%, 15% 2.5%, 18% 1.5%, 22% 3%, 
                        25% 2%, 28% 3.5%, 32% 2.5%, 35% 4%, 38% 3%, 42% 4.5%, 45% 3.5%, 
                        48% 5%, 52% 4%, 55% 5.5%, 58% 4.5%, 62% 6%, 65% 5%, 68% 6.5%, 
                        72% 5.5%, 75% 7%, 78% 6%, 82% 7.5%, 85% 6.5%, 88% 8%, 92% 7%, 
                        95% 8.5%, 98% 7.5%, 100% 9%, 100% 100%, 0 100%
                    )`
                };

            case NoteStyle.TORN_BOTTOM:
                return {
                    clipPath: `polygon(
                        0 0, 100% 0, 100% 91%, 98% 92.5%, 95% 91.5%, 92% 93%, 88% 92%, 
                        85% 93.5%, 82% 92.5%, 78% 94%, 75% 93%, 72% 94.5%, 68% 93.5%, 
                        65% 95%, 62% 94%, 58% 95.5%, 55% 94.5%, 52% 96%, 48% 95%, 
                        45% 96.5%, 42% 95.5%, 38% 97%, 35% 96%, 32% 97.5%, 28% 96.5%, 
                        25% 98%, 22% 97%, 18% 98.5%, 15% 97.5%, 12% 99%, 8% 98%, 
                        5% 99.5%, 2% 98.5%, 0 100%
                    )`
                };

            case NoteStyle.TORN_LEFT:
                return {
                    clipPath: `polygon(
                        0 0, 1.5% 2%, 0.5% 5%, 2% 8%, 1% 12%, 2.5% 15%, 1.5% 18%, 3% 22%, 
                        2% 25%, 3.5% 28%, 2.5% 32%, 4% 35%, 3% 38%, 4.5% 42%, 3.5% 45%, 
                        5% 48%, 4% 52%, 5.5% 55%, 4.5% 58%, 6% 62%, 5% 65%, 6.5% 68%, 
                        5.5% 72%, 7% 75%, 6% 78%, 7.5% 82%, 6.5% 85%, 8% 88%, 7% 92%, 
                        8.5% 95%, 7.5% 98%, 9% 100%, 100% 100%, 100% 0
                    )`
                };

            case NoteStyle.TORN_RIGHT:
                return {
                    clipPath: `polygon(
                        0 0, 100% 0, 98.5% 2%, 99.5% 5%, 98% 8%, 99% 12%, 97.5% 15%, 
                        98.5% 18%, 97% 22%, 98% 25%, 96.5% 28%, 97.5% 32%, 96% 35%, 
                        97% 38%, 95.5% 42%, 96.5% 45%, 95% 48%, 96% 52%, 94.5% 55%, 
                        95.5% 58%, 94% 62%, 95% 65%, 93.5% 68%, 94.5% 72%, 93% 75%, 
                        94% 78%, 92.5% 82%, 93.5% 85%, 92% 88%, 93% 92%, 91.5% 95%, 
                        92.5% 98%, 91% 100%, 0 100%
                    )`
                };

            case NoteStyle.STICKY_NOTE:
                return {
                    borderRadius: '0px',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), inset 0 -40px 40px -40px rgba(0,0,0,0.1)',
                };

            case NoteStyle.POLAROID:
                return {
                    padding: '15px',
                    paddingTop: '0px',
                    paddingBottom: '40px',
                };

            case NoteStyle.CURVED_BOTTOM:
                return {
                    clipPath: 'ellipse(100% 100% at 50% 0%)',
                    borderRadius: '8px 8px 0 0',
                };

            case NoteStyle.CURVED_TOP:
                return {
                    clipPath: 'ellipse(100% 100% at 50% 100%)',
                    borderRadius: '0 0 8px 8px',
                };

            case NoteStyle.FOLDED_CORNER_TR:
                return {
                    clipPath: 'polygon(0 0, calc(100% - 40px) 0, 100% 40px, 100% 100%, 0 100%)',
                };

            case NoteStyle.FOLDED_CORNER_TL:
                return {
                    clipPath: 'polygon(40px 0, 100% 0, 100% 100%, 0 100%, 0 40px)',
                };

            case NoteStyle.FOLDED_CORNER_BR:
                return {
                    clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)',
                };

            case NoteStyle.FOLDED_CORNER_BL:
                return {
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%, 40px 100%, 0 calc(100% - 40px))',
                };
            default:
                return {};
        }
    };

    const marginLeft = showRedLine && ![NoteStyle.STICKY_NOTE, NoteStyle.POLAROID].includes(noteStyle) ? '55px' : '20px';

    return (
        <motion.div
            ref={noteRef}
            layout
            className={cn(
                "relative group",
                selectedFont,
                selectedFont === FontFamily.OvertheRainbow ? "imperialScript" : "text-lg"
            )}
            variants={isNew ? newNoteVariants : existingNoteVariants}
            whileHover={{
                rotate: 0,
                transformOrigin: transformOrigin,
            }}
            initial="hidden"
            animate={isInView || isNew ? "visible" : "hidden"}
            style={{
                transformOrigin: transformOrigin,
            }}
        >
            <motion.div
                layout="position"
                className={cn(
                    "transform-gpu paper relative",
                    noteStyle === NoteStyle.FOLDED_CORNER_TR ? `
                        after:content-[''] after:z-30 after:absolute after:top-0 after:right-0 after:h-10 after:w-10 after:bg-white dark:after:bg-slate-600 after:shadow-[-5px_5px_10px_rgba(0,0,0,0.05),-2px_2px_5px_rgba(0,0,0,0.2)]
                    ` : "",
                    noteStyle === NoteStyle.FOLDED_CORNER_BR ? `
                        after:content-[''] after:z-30 after:absolute after:bottom-0 after:right-0 after:h-10 after:w-10 after:bg-white dark:after:bg-slate-600 after:shadow-[5px_-5px_10px_rgba(0,0,0,0.05),2px_-2px_5px_rgba(0,0,0,0.2)]
                    ` : "",
                    noteStyle === NoteStyle.FOLDED_CORNER_TL ? `
                        after:content-[''] after:z-30 after:absolute after:top-0 after:left-0 after:h-10 after:w-10 after:bg-white dark:after:bg-slate-600 after:shadow-[-5px_5px_10px_rgba(0,0,0,0.05),-2px_2px_5px_rgba(0,0,0,0.2)]
                    ` : "",
                    noteStyle === NoteStyle.FOLDED_CORNER_BL ? `
                        after:content-[''] after:z-30 after:absolute after:bottom-0 after:left-0 after:h-10 after:w-10 after:bg-white dark:after:bg-slate-600 after:shadow-[5px_-5px_10px_rgba(0,0,0,0.05),2px_-2px_5px_rgba(0,0,0,0.2)]
                    ` : "",
                )}
                style={{
                    maxWidth,
                    minHeight,
                    backgroundColor: noteStyle === NoteStyle.POLAROID ? "white" : isDark ? backgroundColor : darkenHex(backgroundColor as `#${string}`, 10),
                    borderColor: !isDark ? backgroundColor : darkenHex(backgroundColor as `#${string}`, 70),
                    '--selected-bg': darkenHex(backgroundColor as `#${string}`, 30),
                    ...getClipPathStyle() as unknown as React.CSSProperties,
                } as React.CSSProperties}
            >
                {noteStyle !== NoteStyle.STICKY_NOTE && <svg className='absolute top-0 left-0 w-full h-full z-0 mix-blend-multiply pointer-events-none'>
                    <filter id='roughpaper'>
                        <feTurbulence type="fractalNoise" baseFrequency='0.04' result='noise' numOctaves="5" />

                        <feDiffuseLighting in='noise' lightingColor='#fff' surfaceScale='2'>
                            <feDistantLight azimuth='45' elevation='60' />
                        </feDiffuseLighting>
                    </filter>
                    <rect filter="url(#roughpaper)" width="100%" height="100%" fill="grey" />
                </svg>}
                {noteStyle === NoteStyle.STICKY_NOTE && <svg className='absolute top-0 left-0 w-full h-full z-0 mix-blend-multiply pointer-events-none'>
                    <defs>

                        <filter id="stick-note-texture">
                            <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="10" result="noise" />
                            <feDiffuseLighting lightingColor="white" diffuseConstant="1" surfaceScale=".5" result="diffLight">
                                <feDistantLight azimuth="100" elevation="55" />
                            </feDiffuseLighting>
                        </filter>
                    </defs>

                    <rect filter="url(#stick-note-texture)" width="100%" height="100%" fill="grey" />
                </svg>}

                {noteStyle === NoteStyle.POLAROID && <div
                    className="absolute top-0 left-0 h-full w-full z-20 wooden-heavy brightness-90"
                    style={{
                        clipPath: "polygon(0px 0px, 0px 100%, 15px 100%, 15px 15px, calc(100% - 15px) 15px, calc(100% - 15px) 85%, 15px 85%, 15px 100%, 100% 100%, 100% 0px)"
                    }}
                />}
                {noteStyle === NoteStyle.POLAROID && <div className={cn(
                    "absolute top-0 left-0 h-full w-full z-10 pointer-events-none",
                    `shadow-[inset_0px_5px_50px_rgba(0,0,0,0.5)]`,
                )} />}
                {showRedLine && ![NoteStyle.STICKY_NOTE, NoteStyle.POLAROID].includes(noteStyle) && (
                    <div className='redMargin' />
                )}

                <div
                    className={cn('lines')}
                    style={noteStyle === NoteStyle.STICKY_NOTE ? {
                        backgroundImage: 'none',
                    } : {
                        backgroundImage: showLines
                            ? 'repeating-linear-gradient(transparent 0px, transparent 24px, #4682b4 24px, #4682b4 25px, transparent 25px)'
                            : 'none',
                    }}
                >
                    <p
                        style={{
                            backgroundColor: darkenHex(backgroundColor as `#${string}`, 5),
                        } as React.CSSProperties}
                        className={cn(
                            "text-xs px-3 py-1 w-fit -translate-y-3 text-black rounded-3xl dark:shadow-[inset_0px_3px_5px_rgba(0,0,0,0.5)] shadow-[inset_0px_3px_5px_rgba(255,255,255,0.75)]",
                            showRedLine && noteStyle !== NoteStyle.POLAROID && noteStyle !== NoteStyle.STICKY_NOTE ? "ml-14" : "mx-6",
                            selectedFont === FontFamily.Ole ? "schoolbell" : ""
                        )}>
                        {timestampText}
                    </p>
                    <article
                        ref={textRef}
                        contentEditable={false}
                        suppressContentEditableWarning
                        spellCheck={false}
                        className='text'
                        style={{
                            marginLeft,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                        }}
                        role="article"
                        aria-label="Note content"
                        aria-readonly="true"
                    >
                        {content}
                    </article>
                    <ReactionCard
                        statistics={{ likes: likesCount, comments: commentsCount, views: viewsCount, isLiked, isCommented, isViewed, noteId: id || '' }}
                        className={cn(
                            "w-full px-6 translate-y-2",
                            showRedLine && noteStyle !== NoteStyle.POLAROID && noteStyle !== NoteStyle.STICKY_NOTE ? "pl-14" : "",
                            noteStyle === NoteStyle.FOLDED_CORNER_BR ? "pr-10" : "",
                        )}
                    />
                    {clipType !== ClipType.PIN && <Clip
                        type={clipType}
                        init={tilt < 0 ? 1 : 0}
                        noteStyle={noteStyle}
                        className={cn(
                            noteStyle === NoteStyle.POLAROID ? `-top-6` : "",
                        )}
                    />}
                </div>
            </motion.div>
            {clipType === ClipType.PIN && <Clip
                type={ClipType.PIN}
                className={cn(
                    "pointer-events-none",
                    "relative z-20",
                    noteStyle === NoteStyle.POLAROID ? `-top-6` : "",
                    noteStyle === NoteStyle.TORN_TOP ? `-top-4 left-2` : "",
                )}
            />}
        </motion.div>
    );
};

export default NoteCard;