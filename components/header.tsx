"use client";
import { PageNames } from "@/constants";
import NeoButton from "./neo-components/NeoButton";
import { MessageSquareQuote } from "./animate-ui/icons/message-square-quote";
import { AnimateIcon } from "./animate-ui/icons/icon";
import Link from "next/link";
import WoodenPlatform from "./WoodenPlatform";

export default function Header() {
    return (
        <header className="w-full relative p-5 flex flex-row gap-5 justify-between drop-shadow-[0_0_10px_rgba(0,0,0,0.0.15),0_0_3px_rgba(0,0,0,0.0.75)]">
            <WoodenPlatform className="w-fit h-full relative rounded-3xl">

                <AnimateIcon animateOnHover="wiggle" loop={true}>
                    <div className="md:px-5 px-3 md:py-3 py-2 flex border-8 border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                        <NeoButton element="div" className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3 cursor-default no-hover">
                            <div className="flex items-center gap-2">
                                <MessageSquareQuote strokeWidth={2.5} className="md:w-6 text-black sm:h-6 w-5 h-5 max-sm:hidden scale-125" />
                                <h1 className="md:text-lg sm:text-sm text-xs text-black font-bold whitespace-nowrap">Sayit.Wiki</h1>
                            </div>
                            <Link href="/" className="absolute top-0 left-0 h-full w-full" />
                        </NeoButton>
                    </div>
                </AnimateIcon>
            </WoodenPlatform>

            <WoodenPlatform className="w-fit h-full relative rounded-3xl">

                <nav className="md:px-5 px-3 md:py-3 py-2 flex border-8 border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                    {Object.values(PageNames).map((PageName) => (
                        <AnimateIcon key={PageName.name} animateOnHover="wiggle" loop={true} >
                            <NeoButton element="a" href={`/${PageName.name.toLowerCase()}`} className="grid place-items-center md:py-3 py-2 md:px-5 px-3">
                                <div className="flex items-center gap-2">
                                    <PageName.icon strokeWidth={2.5} className="md:w-6 text-black sm:h-6 w-5 h-5 max-sm:hidden" />
                                    <h1 className="md:text-lg sm:text-sm text-xs text-black font-bold whitespace-nowrap">{PageName.name}</h1>
                                </div>
                            </NeoButton>
                        </AnimateIcon>
                    ))}
                </nav>
            </WoodenPlatform>
        </header>
    )
}
