"use client";
import NeoButton from "../neo-components/NeoButton";
import WoodenPlatform from "../WoodenPlatform";
import { AnimateIcon } from "../animate-ui/icons/icon";
import { MessageSquareDiffIcon } from "../animate-ui/icons/message-square-diff";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { ResponsiveModal } from "../ui/responsive-modal";
import { useEffect, useMemo, useState } from "react";
import { NoteStyle } from "@/types/note";
import NewNoteCard from "../ui/NoteCard/NewNote";
import { ClipType } from "../ui/Clip";
import { FontFamily, Fonts } from "@/constants/fonts";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import NoteItemHolder from "../ui/NoteCard/NoteItemHolder";
import { cn, darkenHex, generateNoteId, HexColor, luckyPick, removeSearchParam, updateSearchParam } from "@/lib/utils";
import { PopoverClose } from "@radix-ui/react-popover";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { backgroundColors } from "@/constants/notes";
import { XIcon } from "../animate-ui/icons/x";
import { PinIcon } from "../animate-ui/icons/pin";
import { useSearchParams } from "next/navigation";
import useShortcuts, { KeyboardKey } from "@useverse/useshortcuts";

export default function MakeANote() {
    const searchParams = useSearchParams();

    const isCreatingNote = searchParams.get("createNote") === "true";

    const handleOpenChange = (open: boolean) => {
        if (open) {
            updateSearchParam("createNote", "true");
        } else {
            removeSearchParam("createNote");
        }
    }

    useShortcuts({
        shortcuts: [
            {
                key: KeyboardKey.KeyN,
                ctrlKey: true,
                enabled: true,
            }
        ],
        onTrigger: (key) => {
            switch (key.key) {
                case KeyboardKey.KeyN:
                    handleOpenChange(true);
                    break;
            }
        }
    }, [isCreatingNote])

    const noteId = useMemo(() => generateNoteId(), []);
    const [open, setOpen] = useState(false);
    const [isDropDownOpen, setIsDropDownOpen] = useState(false);
    const [content, setContent] = useState<string>("");
    const [selectedFont, setSelectedFont] = useState<FontFamily | null>(null);
    const [selectedPaperColor, setSelectedPaperColor] = useState<string | null>(null);
    const [selectedTilt, setSelectedTilt] = useState<number | null>(null);
    const [selectedClipType, setSelectedClipType] = useState<ClipType | null>(null);
    const [selectedNoteStyle, setSelectedNoteStyle] = useState<NoteStyle | null>(null);

    const randomFont = Object.values(FontFamily)[luckyPick(0, Object.values(FontFamily).length - 1)];
    const randomPaperColor = backgroundColors[luckyPick(0, backgroundColors.length - 1)];
    const randomTilt = luckyPick(-4, 4);
    const randomClipType = Object.values(ClipType)[luckyPick(0, Object.values(ClipType).length - 1)];
    const randomNoteStyle = Object.values(NoteStyle)[luckyPick(0, Object.values(NoteStyle).length - 1)];

    useEffect(() => {
        setSelectedFont(randomFont);
        setSelectedPaperColor(randomPaperColor);
        setSelectedTilt(randomTilt);
        setSelectedClipType(randomClipType);
        setSelectedNoteStyle(randomNoteStyle);
    }, []);

    useEffect(() => {
        if (isCreatingNote) {
            setOpen(true);
            return;
        }
        setOpen(false);
    }, [isCreatingNote]);

    const handlePaperColorChange = (color: string) => {
        setSelectedPaperColor(color);
    }
    const handleFontChange = (font: FontFamily) => {
        setSelectedFont(font);
    }


    const handleContentChange = (id: string, content: string) => {
        setContent(content);
    }

    return (
        <>
            <WoodenPlatform className="w-fit h-fit rounded-3xl drop-shadow-[0_0_20px_rgba(0,0,0,0.0.5),0_0_5px_rgba(0,0,0,0.0.75)] fixed bottom-10 right-10 z-50">
                <div className="md:px-5 px-3 md:py-3 py-2 flex border-8 border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                    <div className="absolute wooden inset-0 rounded-full m-0 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                    <Tooltip>
                        <TooltipTrigger 
                        asChild
                        onClick={() => handleOpenChange(true)}
                        >
                            <AnimateIcon animateOnHover="wiggle" loop={true}>
                                <NeoButton
                                    element="div"
                                    className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3"
                                    onClick={() => setOpen(true)}
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageSquareDiffIcon
                                            strokeWidth={2.5} className="md:w-6 text-black sm:h-6 w-5 h-5 max-sm:hidden scale-125" />
                                    </div>
                                </NeoButton>
                            </AnimateIcon>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Make a note</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </WoodenPlatform>
            <ResponsiveModal
                open={open}
                className="p-2"
                onOpenChange={(open) => {
                    if (open) {
                        updateSearchParam("createNote", "true");
                    } else {
                        removeSearchParam("createNote");
                    }
                }}
                description="Use the 'cmd + n' shortcut to open this modal."
                title="Make a note"

            >
                <div className="flex flex-col gap-5 mt-5 text-white">
                    <div className="grid gap-2">
                        <h2 className="text-center text-lg font-bold drop-shadow-[0_0_10px_rgba(0,0,0,0.25),0_0_1px_rgba(0,0,0,0.9)]"><span className="px-3">Pin a New Note to the Wall</span></h2>
                        <p className="text-center text-sm drop-shadow-[0_0_10px_rgba(0,0,0,0.25),0_0_1px_rgba(0,0,0,0.9)]"><span className="bg-[var(--wooden-color)]/20 px-3">Your note will be visible to everyone on the community wall</span></p>
                    </div>

                    <div className="h-3" />

                    <div className="drop-shadow-[0_10px_10px_rgba(0,0,0,0.0.25),0_5px_2px_rgba(0,0,0,0.0.5)]">
                        <NewNoteCard
                            content={content || ""}
                            backgroundColor={selectedPaperColor || "#fff"}
                            noteStyle={selectedNoteStyle || NoteStyle.SPIRAL_TOP}
                            id={noteId}
                            clipType={selectedClipType || ClipType.Staple}
                            showLines
                            selectedFont={selectedFont || undefined}
                            showRedLine
                            tilt={selectedTilt || 0}
                            key={noteId}
                            onContentChange={handleContentChange}
                        />
                    </div>
                    <div className="h-2" />
                    <div className="grid gap-4 px-2">
                        <Popover open={isDropDownOpen} onOpenChange={setIsDropDownOpen}>
                            <PopoverTrigger asChild>
                                <div className="relative mt-2">
                                    <WoodenPlatform
                                        className="absolute -top-3 left-3 z-20 h-fit w-fit rounded-lg cursor-pointer drop-shadow-[-10px_-10px_5px_rgba(0,0,0,0.0.25),0_0_1px_rgba(0,0,0,0.0.5)]"
                                        noScrews
                                    >
                                        <div className="wooden p-0.5 flex border-2 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                            <div
                                                className={cn(
                                                    "rounded-sm px-2 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex flex-col gap-1"
                                                )}
                                            >

                                                <span className={cn("text-white text-xs py-1")}>Writing style</span>
                                            </div>
                                        </div>
                                    </WoodenPlatform>
                                    <WoodenPlatform
                                        className="w-full rounded-lg cursor-pointer drop-shadow-[0_0_10px_rgba(0,0,0,0.0.25),0_0_5px_rgba(0,0,0,0.0.5)]"
                                        noScrews
                                    >
                                        <div className="wooden p-1 flex border-4 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                            <div
                                                className={cn(
                                                    "rounded-sm px-4 pt-2 bg-black/30 hover:bg-black/40 duration-100 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex justify-between items-center gap-1"
                                                )}
                                            >

                                                <span className={cn("text-white text-shadow-[0_0_3px_rgba(0,0,0,0.0.5)] text-sm py-2", selectedFont ? `${selectedFont} font-bold` : 'base-font')}>{selectedFont ? Fonts[selectedFont].styleName : 'Select a handwriting style'}</span>
                                                <ChevronDownIcon className="w-4 h-4 text-white" />
                                            </div>
                                        </div>
                                    </WoodenPlatform>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="min-w-full drop-shadow-[0_0_30px_rgba(0,0,0,0.0.25),0_0_5px_rgba(0,0,0,0.0.5)] overflow-y-auto bg-transparent p-0 border-none">
                                <NoteItemHolder
                                    backgroundColor={selectedPaperColor || "#FFF"}
                                    noteStyle={NoteStyle.SPIRAL_BOTTOM}
                                >
                                    <NoteItemHolder.Item showDot={false} className="base-font font-bold text-black text-sm">Pick a handwriting style</NoteItemHolder.Item >
                                    <NoteItemHolder.RadioGroup
                                        value={selectedFont || undefined}
                                        name="font-selection"
                                        onChange={handleFontChange as (value: string) => void}
                                    >
                                        {
                                            Object.values(FontFamily).map((font) => (
                                                <PopoverClose key={font} asChild>
                                                    <NoteItemHolder.Radio
                                                        tapAction={() => setIsDropDownOpen(false)}
                                                        className={cn(
                                                            "text-black text-sm hover:backdrop-saturate-200 backdrop-saturate-100",
                                                            font,
                                                            (font === FontFamily.Ole || font === FontFamily.SueEllenFrancisco) ? "-translate-x-2.5" : ""
                                                        )}
                                                        value={font}
                                                    // key={font}
                                                    >
                                                        {Fonts[font].styleName}
                                                    </NoteItemHolder.Radio>
                                                </PopoverClose>
                                            ))
                                        }
                                    </NoteItemHolder.RadioGroup>
                                </NoteItemHolder>
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="h-2" />

                    {selectedNoteStyle && selectedNoteStyle !== NoteStyle.POLAROID && <div className="relative px-2">
                        <WoodenPlatform
                            className="absolute -top-3 left-6 z-20 h-fit w-fit rounded-lg cursor-pointer drop-shadow-[-10px_-10px_5px_rgba(0,0,0,0.0.25),0_0_1px_rgba(0,0,0,0.0.5)]"
                            noScrews
                        >
                            <div className="wooden p-0.5 flex border-2 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                <div
                                    className={cn(
                                        "rounded-sm px-2 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex flex-col gap-1"
                                    )}
                                >

                                    <span className={cn("text-white text-xs py-1")}>Paper color</span>
                                </div>
                            </div>
                        </WoodenPlatform>
                        <WoodenPlatform
                            className="w-full rounded-lg drop-shadow-[0_0_10px_rgba(0,0,0,0.0.25),0_0_5px_rgba(0,0,0,0.0.5)]"
                            noScrews
                        >
                            <div className="wooden p-1 flex border-4 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                <div
                                    className={cn(
                                        "rounded-sm px-2 pt-5 pb-2 bg-black/30 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex flex-wrap gap-1"
                                    )}
                                >
                                    {backgroundColors.map((bg) => (
                                        <Tooltip key={bg} delayDuration={500}>
                                            <TooltipTrigger asChild>
                                                <div
                                                    onClick={() => handlePaperColorChange(bg)}
                                                >
                                                    <WoodenPlatform
                                                        className="h-fit w-fit rounded-lg cursor-pointer drop-shadow-[0_0_1px_rgba(0,0,0,0.0.5)]"
                                                        noScrews
                                                    >
                                                        <div className="wooden p-0.5 flex border-2 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                                            <div
                                                                className={cn(
                                                                    "rounded-sm h-8 w-8 m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex flex-col gap-1 saturate-150 brightness-90 hover:brightness-75"
                                                                )}
                                                                style={{ backgroundColor: selectedPaperColor === bg ? darkenHex(bg as HexColor, 50) : bg }}
                                                            >
                                                                {selectedPaperColor === bg ? <CheckIcon strokeWidth={4} className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" /> : null}
                                                            </div>
                                                        </div>
                                                    </WoodenPlatform>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Make paper {bg}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            </div>
                        </WoodenPlatform>
                    </div>}

                    <div className="h-2" />

                    <div className="w-full px-2">
                        <WoodenPlatform noScrews className="w-full h-fit rounded-3xl drop-shadow-[0_0_20px_rgba(0,0,0,0.0.5),0_0_5px_rgba(0,0,0,0.0.75)]">
                            <div className="px-2 py-2 flex items-center border-8 border-background/0 gap-2 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                <div className="absolute wooden inset-0 rounded-full m-0 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AnimateIcon animateOnHover="wiggle" loop={true}>
                                            <NeoButton
                                                element="div"
                                                className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3"
                                                onClick={() => handleOpenChange(false)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <XIcon
                                                        strokeWidth={2.5} className="sm:w-4 text-black sm:h-4 w-3 h-3 max-sm:hidden scale-125" />
                                                </div>
                                            </NeoButton>
                                        </AnimateIcon>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Cancel</p>
                                    </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger className="flex-1" asChild>
                                        <AnimateIcon animateOnHover="wiggle" loop={true}>
                                            <NeoButton
                                                element="div"
                                                className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3"
                                                onClick={() => setOpen(true)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <PinIcon
                                                        strokeWidth={2.5} className="sm:w-4 text-black sm:h-4 w-3 h-3 max-sm:hidden scale-125" />
                                                        <p className="font-semibold text-black">Pin to wall</p>
                                                </div>
                                            </NeoButton>
                                        </AnimateIcon>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Pin to wall</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </WoodenPlatform>
                    </div>
                    <div className="h-2" />
                </div>
            </ResponsiveModal >
        </>
    )
}
