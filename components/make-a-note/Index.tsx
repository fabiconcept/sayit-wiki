import NeoButton from "../neo-components/NeoButton";
import WoodenPlatform from "../WoodenPlatform";
import { AnimateIcon } from "../animate-ui/icons/icon";
import { MessageSquareDiffIcon } from "../animate-ui/icons/message-square-diff";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function MakeANote() {
    return (
        <WoodenPlatform className="w-fit h-fit rounded-3xl drop-shadow-[0_0_20px_rgba(0,0,0,0.0.5),0_0_5px_rgba(0,0,0,0.0.75)] fixed bottom-10 right-10 z-50">
            <div className="md:px-5 px-3 md:py-3 py-2 flex border-8 border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                <div className="absolute wooden inset-0 rounded-full m-0 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <AnimateIcon animateOnHover="wiggle" loop={true}>
                            <NeoButton element="div" className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3">
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

    )
}