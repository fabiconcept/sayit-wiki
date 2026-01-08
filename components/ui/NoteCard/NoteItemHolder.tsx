"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { cn, darkenHex } from '@/lib/utils';
import '@/app/styles/notes.css';
import '@/app/styles/check.css';
import { NoteStyle } from '@/types/note';
import { useTheme } from 'next-themes';
import { FontFamily } from '@/constants/fonts';

interface NoteItemHolderProps {
    noteStyle?: NoteStyle;
    backgroundColor: string;
    selectedFont?: FontFamily;
    showRedLine?: boolean;
    showLines?: boolean;
    children: React.ReactNode;
}

interface NoteItemProps {
    children: React.ReactNode;
    showDot?: boolean;
    className?: string;
    tapAction?: () => void;
}

interface RadioGroupProps {
    value?: string;
    onChange?: (value: string) => void;
    children: React.ReactNode;
    className?: string;
    name: string;
}

interface RadioProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    tapAction?: () => void;
}

// Compound component type
type NoteItemHolderComponent = React.FC<NoteItemHolderProps> & {
    Item: React.FC<NoteItemProps>;
    RadioGroup: React.FC<RadioGroupProps>;
    Radio: React.FC<RadioProps>;
};

const NoteItem: React.FC<NoteItemProps> = ({ children, className, showDot = true, tapAction }) => {
    const handleClick = () => {
        tapAction?.();
    };

    return (
        <div 
            className={cn("flex items-center gap-2", className, tapAction && "cursor-pointer")} 
            style={{ minHeight: '25px', height: '25px' }}
            onClick={handleClick}
        >
            {showDot && <span className="text-lg flex items-center" style={{ height: '25px' }}>•</span>}
            <span className="flex-1 flex items-center" style={{ height: '25px' }}>{children}</span>
        </div>
    );
};

// Context for radio group state
const RadioGroupContext = React.createContext<{
    value?: string;
    onChange?: (value: string) => void;
    name: string;
}>({
    name: '',
});

const RadioGroup: React.FC<RadioGroupProps> = ({ value, onChange, children, className, name }) => {
    const [selectedValue, setSelectedValue] = useState(value);

    const handleChange = (newValue: string) => {
        setSelectedValue(newValue);
        onChange?.(newValue);
    };

    return (
        <RadioGroupContext.Provider value={{ value: selectedValue, onChange: handleChange, name }}>
            <div className={cn("flex flex-col gap-x-2 -translate-x-8", className)}>
                {children}
            </div>
        </RadioGroupContext.Provider>
    );
};

const Radio: React.FC<RadioProps> = ({ value, children, className, tapAction }) => {
    const context = React.useContext(RadioGroupContext);
    const isChecked = context.value === value;
    const radioId = `${context.name}-${value}`;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            context.onChange?.(value);
            tapAction?.();
        }
    };

    return (
        <div className={cn("animated-inputs radio", className)} style={{ minHeight: '25px', height: '25px' }}>
            <div className="each" style={{ padding: 0, margin: 0, height: '25px' }}>
                <input
                    id={radioId}
                    name={context.name}
                    type="radio"
                    checked={isChecked}
                    onChange={handleChange}
                />
                <label htmlFor={radioId} style={{ gap: '0.5rem', height: '25px', alignItems: 'center' }}>
                    <span className="box-container" style={{ width: '1.25em', height: '1.25em', flexShrink: 0 }}>
                        <Image
                            src="/box.png"
                            alt=""
                            width={100}
                            height={100}
                            className="box-image"
                        />
                    </span>
                    <span className="flex-1" style={{ lineHeight: '25px', display: 'flex', alignItems: 'center', height: '25px' }}>{children}</span>
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="checkmark" style={{ width: '0.8em', height: '0.8em', left: '0.225em' }}>
                    <path d="M27.8,18.6c-3.7,5.1-7.3,10.1-11,15.2c13.7-6.9,27.5-13.9,42.4-17.6c-4.5,5.5-10.4,9.7-15.7,14.5
                        c-4.4,4-8.5,8.4-12.5,12.8C25,50,19,56.5,14.1,63.9c10.2-6.1,20.4-12.2,30.6-18.4c3.1-1.9,6.2-3.7,9.4-5.2c3.2-1.4,6.5-2.5,9.7-3.7
                        c7.5-2.8,14.7-6.5,21.8-10.2c-4.2,3.7-9.4,6.1-13.9,9.4c-3.1,2.3-5.8,4.9-8.8,7.4c-3.5,2.9-7.3,5.4-10.7,8.4
                        c-4.5,4.2-8,9.3-11.6,14.2c-4.6,6.1-9.6,11.9-14.3,17.9c9.7-8.4,17-19.5,27.5-26.9c7.1-5,15.3-8.2,23.6-10.6
                        c2.9-0.8,5.8-1.6,8.4-3.1c-3.5,4.9-8.2,8.7-12.8,12.6c-7.6,6.7-14.5,14-20.7,22C62.7,74.1,71,66.1,81.4,63.2"/>
                    </svg>
                </label>
            </div>
        </div>
    );
};

const NoteItemHolder: NoteItemHolderComponent = ({
    noteStyle = NoteStyle.CLASSIC,
    backgroundColor,
    selectedFont,
    showRedLine = true,
    showLines = true,
    children,
}) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const maxWidth = "450px";
    const minHeight = "50px";

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

    const paddingLeft = showRedLine && ![NoteStyle.STICKY_NOTE, NoteStyle.POLAROID].includes(noteStyle) ? '55px' : '20px';

    return (
        <div className={cn("relative", selectedFont, selectedFont === FontFamily.OvertheRainbow ? "imperialScript" : "text-lg")}>
            <div
                className={cn(
                    "transform-gpu paper origin-top relative",
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
                    backgroundColor: noteStyle === NoteStyle.POLAROID ? "white" : !isDark ? backgroundColor : darkenHex(backgroundColor as `#${string}`, 10),
                    borderColor: isDark ? backgroundColor : darkenHex(backgroundColor as `#${string}`, 70),
                    '--rotater': '0deg',
                    '--selected-bg': isDark ? darkenHex(backgroundColor as `#${string}`, 30) : darkenHex(backgroundColor as `#${string}`, 50),
                    ...getClipPathStyle() as unknown as React.CSSProperties,
                } as React.CSSProperties}
            >
                {noteStyle !== NoteStyle.STICKY_NOTE && <svg className='absolute top-0 left-0 w-full h-full z-0 mix-blend-multiply pointer-events-none'>
                    <filter id='roughpaper-holder'>
                        <feTurbulence type="fractalNoise" baseFrequency='0.04' result='noise' numOctaves="5" />
                        <feDiffuseLighting in='noise' lightingColor='#fff' surfaceScale='2'>
                            <feDistantLight azimuth='45' elevation='60' />
                        </feDiffuseLighting>
                    </filter>
                    <rect filter="url(#roughpaper-holder)" width="100%" height="100%" fill="grey" />
                </svg>}
                
                {noteStyle === NoteStyle.STICKY_NOTE && <svg className='absolute top-0 left-0 w-full h-full z-0 mix-blend-multiply pointer-events-none'>
                    <defs>
                        <filter id="stick-note-texture-holder">
                            <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="10" result="noise" />
                            <feDiffuseLighting lightingColor="white" diffuseConstant="1" surfaceScale=".5" result="diffLight">
                                <feDistantLight azimuth="100" elevation="55" />
                            </feDiffuseLighting>
                        </filter>
                    </defs>
                    <rect filter="url(#stick-note-texture-holder)" width="100%" height="100%" fill="grey" />
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
                    <div
                        className="flex flex-col gap-0"
                        style={{
                            paddingTop: '4px',
                            paddingBottom: '4px',
                            paddingLeft,
                            paddingRight: '20px',
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Attach sub-components
NoteItemHolder.Item = NoteItem;
NoteItemHolder.RadioGroup = RadioGroup;
NoteItemHolder.Radio = Radio;

export default NoteItemHolder;