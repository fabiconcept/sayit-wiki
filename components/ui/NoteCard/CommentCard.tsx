"use client";
import React, { useMemo, useRef, useEffect } from 'react';
import { motion, useInView, Variants } from 'framer-motion';
import Clip, { ClipType } from "../Clip";
import { cn, darkenHex, formatSocialTime } from '@/lib/utils';
import '@/app/styles/notes.css';
import { commentNoteCardProps, NoteStyle } from '@/types/note';
import { useTheme } from 'next-themes';
import { FontFamily } from '@/constants/fonts';
import { quickModerate } from '@/lib/moderator';
import { useAppSelector } from '@/store/hooks';
import { selectModerationLevel } from '@/store/selectors';

const CommentNoteCard: React.FC<commentNoteCardProps> = ({
    noteStyle = NoteStyle.CLASSIC,
    backgroundColor,
    timestamp,
    content,
    tilt,
    showRedLine = true,
    showLines = true,
    selectedFont,
    index = 0,
    isNew = false,
    title,
    communityNote,
}) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const moderationLevel = useAppSelector(selectModerationLevel);
    const textRef = useRef<HTMLDivElement>(null);
    const noteRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false); // Track if this note has already animated
    const isInView = useInView(noteRef, {
        once: true,
        margin: "-50px",
        amount: 0.25
    });

    const minHeight = "40px";

    const date = timestamp ? new Date(timestamp) : new Date();
    const timestampText = formatSocialTime(date, true);

    // Smart delay calculation - stagger based on position
    const staggerDelay = useMemo(() => {
        const baseDelay = (index % 10) * 0.03;
        const pseudoRandom = ((index * 9301 + 49297) % 233280) / 233280;
        const randomOffset = pseudoRandom * 0.05;
        return baseDelay + randomOffset;
    }, [index]);

    // Reduce tilt by 70%
    const adjustedTilt = tilt * 0.3;

    // Animation variants for existing notes (in-view)
    const existingNoteVariants: Variants = useMemo(() => (
        {
            hidden: {
                opacity: 0,
                y: 30,
                scale: 0.95,
                rotate: 0,
            },
            visible: {
                opacity: 1,
                y: 0,
                scale: 1,
                rotate: adjustedTilt * 0.8,
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
    ), [adjustedTilt, staggerDelay]);

    // Animation variants for new notes (bubble/spring effect)
    const newNoteVariants: Variants = useMemo(() => (
        {
            hidden: {
                opacity: 0,
                scale: 0,
                y: -100,
                rotate: adjustedTilt * 2
            },
            visible: {
                opacity: 1,
                scale: 1,
                y: 0,
                rotate: adjustedTilt * 0.8,
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
    ), [adjustedTilt]);

    const marginLeft = showRedLine && ![NoteStyle.STICKY_NOTE, NoteStyle.POLAROID].includes(noteStyle) ? '55px' : '20px';

    // Apply moderation to content
    const moderatedContent = useMemo(() => {
        const result = quickModerate(content, moderationLevel);
        return result.sanitized;
    }, [content, moderationLevel]);

    const moderatedCommunityNote = useMemo(() => {
        if (!communityNote) return undefined;
        const result = quickModerate(communityNote, moderationLevel);
        return result.sanitized;
    }, [communityNote, moderationLevel]);

    // Determine if this note should animate
    // Replace the ref with state:

    // Now you can safely use it during render:
    const shouldAnimate = isNew || (isInView && !hasAnimated);

    // Mark as animated once it becomes visible
    useEffect(() => {
        if (isInView || isNew) {
            hasAnimated.current = true;
        }
    }, [isInView, isNew]);

    return (
        <motion.div
            ref={noteRef}
            className={cn(
                "relative",
                selectedFont,
                selectedFont === FontFamily.OvertheRainbow ? "imperialScript" : "text-lg"
            )}
            variants={isNew ? newNoteVariants : existingNoteVariants}
            initial={shouldAnimate ? "hidden" : "visible"}
            animate={shouldAnimate ? "visible" : "visible"}
        >
            <div
                className={cn(
                    "transform-gpu paper relative"
                )}
                style={{
                    minHeight,
                    height: "100%",
                    backgroundColor: noteStyle === NoteStyle.POLAROID ? "white" : isDark ? backgroundColor : darkenHex(backgroundColor as `#${string}`, 10),
                    borderColor: !isDark ? backgroundColor : darkenHex(backgroundColor as `#${string}`, 70),
                    '--selected-bg': darkenHex(backgroundColor as `#${string}`, 30),
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
                    )`,
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
                    className={cn('lines mb-0')}
                    style={{
                        ...(noteStyle === NoteStyle.STICKY_NOTE ? {
                            backgroundImage: 'none',
                        } : {
                            backgroundImage: showLines
                                ? 'repeating-linear-gradient(transparent 0px, transparent 24px, #4682b4 24px, #4682b4 25px, transparent 25px)'
                                : 'none',
                        }),
                        marginTop: 20
                    }}
                >
                    <article
                        ref={textRef}
                        spellCheck={false}
                        className='text translate-y-7 pb-0 mb-0 min-h-5'
                        style={{
                            marginLeft,
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                        }}
                        role="article"
                        aria-label="Comment content"
                    >
                        {title && <p className='font-bold' style={{
                            "--selected-bg": "black",
                            "--color-white": "white",
                            color: darkenHex(backgroundColor as `#${string}`, 80),
                        } as React.CSSProperties}>{title}</p>}
                        {moderatedContent}
                        <br />
                        <br />
                        {moderatedCommunityNote && <p className='font-medium'>Community note: <span className='text-red-500'>{moderatedCommunityNote}</span></p>}
                    </article>
                </div>

                {timestamp && <p
                    style={{
                        backgroundColor: darkenHex(backgroundColor as `#${string}`, 5),
                    } as React.CSSProperties}
                    className={cn(
                        "text-xs px-3 py-0.5 border w-fit absolute top-3.5 right-3.5 text-black rounded-3xl dark:shadow-[inset_0px_3px_5px_rgba(0,0,0,0.5)] shadow-[inset_0px_3px_5px_rgba(255,255,255,0.75)]",
                        showRedLine && noteStyle !== NoteStyle.POLAROID && noteStyle !== NoteStyle.STICKY_NOTE ? "ml-14" : "mx-6",
                        selectedFont === FontFamily.Ole ? "schoolbell" : ""
                    )}>
                    {timestampText}
                </p>}
                {title && <div className="animate-in slide-in-from-top-full duration-300">
                    <Clip
                        type={ClipType.PIN}
                        className={"absolute top-0 left-5 translate-x-1"}
                    />
                </div>}

                {!title && <Clip
                    type={ClipType.Staple}
                    init={0}
                    noteStyle={NoteStyle.TORN_LEFT}
                    className={"absolute top-0 left-5 translate-x-1"}
                />}
            </div>
        </motion.div>
    );
};

export default CommentNoteCard;