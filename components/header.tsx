"use client";
import { PageNames } from "@/constants";
import NeoButton from "./neo-components/NeoButton";
import { MessageSquareQuote } from "./animate-ui/icons/message-square-quote";
import { AnimateIcon } from "./animate-ui/icons/icon";
import Link from "next/link";
import WoodenPlatform from "./WoodenPlatform";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "./animate-ui/icons/arrow-left";

export default function Header() {
    const pathname = usePathname();
    const currentPage = Object.values(PageNames).find((PageName) => PageName.path === pathname);

    if (pathname !== "/") {
        if (pathname.startsWith("/note/")) return null;
        
        return (
            <WoodenPlatform className="w-fit h-full rounded-3xl drop-shadow-[0_0_10px_rgba(0,0,0,0.0.15),0_0_3px_rgba(0,0,0,0.0.75)] sticky my-3 top-5 left-3 z-50">
                <div className="absolute wooden inset-0 rounded-full m-2 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                <nav className="px-3 py-2 flex border-8 border-background/0 sm:gap-3 gap-2 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                    <AnimateIcon animateOnHover="wiggle" loop={true} >
                        <NeoButton element="a" href={"/"} className={cn("grid place-items-center md:py-3 py-2 md:px-5 px-3")}>
                            <div className="flex items-center gap-2">
                                <ArrowLeftIcon strokeWidth={2.5} className="md:w-6 text-black sm:h-6 w-5 h-5 max-sm:hidden" />
                                <h1 className="md:text-sm sm:text-xs text-[12px] text-black font-bold whitespace-nowrap">Back to the Wall</h1>
                            </div>
                        </NeoButton>
                    </AnimateIcon>
                </nav>
            </WoodenPlatform>
        );
    }

    return (
        <>
            <WoodenPlatform className="w-fit h-full rounded-3xl drop-shadow-[0_0_10px_rgba(0,0,0,0.0.15),0_0_3px_rgba(0,0,0,0.0.75)] sm:sticky sm:top-10 top-5 sm:left-10 left-1/2 max-sm:-translate-x-1/2 z-50">
                <AnimateIcon animateOnHover="wiggle" loop={true}>
                    <div className="md:px-5 px-3 md:py-3 py-2 flex border-8 border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                        <div className="absolute wooden inset-0 rounded-full m-0 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                        <NeoButton element="div" className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3 cursor-default no-hover">
                            <div className="flex items-center gap-2">
                                <MessageSquareQuote strokeWidth={2.5} className="md:w-6 text-black sm:h-6 w-5 h-5 scale-125" />
                                <h1 className="md:text-lg sm:text-sm text-xs text-black font-bold whitespace-nowrap">Sayit.Wiki</h1>
                            </div>
                            <Link href="/" className="absolute top-0 left-0 h-full w-full" />
                        </NeoButton>
                    </div>
                </AnimateIcon>
            </WoodenPlatform>

            <WoodenPlatform className="w-fit h-full rounded-3xl drop-shadow-[0_0_10px_rgba(0,0,0,0.0.15),0_0_3px_rgba(0,0,0,0.0.75)] sticky sm:-mt-16 mt-8 sm:top-10 top-5 sm:right-10 right-[unset] max-sm:left-1/2 max-sm:-translate-x-3.5 sm:float-right z-50">
                <div className="absolute wooden inset-0 rounded-full m-2 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                <nav className="md:px-5 px-3 md:py-3 py-2 flex border-8 border-background/0 sm:gap-3 gap-2 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                    {Object.values(PageNames).map((PageName) => (
                        <AnimateIcon key={PageName.name} animateOnHover="wiggle" loop={true} >
                            <NeoButton element="a" href={PageName.path} className={cn("grid place-items-center md:py-3 py-2 md:px-5 px-3", currentPage?.path === PageName.path && "selected active")}>
                                <div className="flex items-center gap-2">
                                    <PageName.icon strokeWidth={2.5} className="md:w-6 text-black sm:h-6 w-5 h-5 max-sm:hidden" />
                                    <h1 className="md:text-sm sm:text-xs text-[12px] text-black font-bold whitespace-nowrap">{PageName.name}</h1>
                                </div>
                            </NeoButton>
                        </AnimateIcon>
                    ))}
                </nav>
            </WoodenPlatform>
        </>
    )
}
