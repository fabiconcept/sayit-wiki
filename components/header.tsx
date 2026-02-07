"use client";
import { PageNames } from "@/constants";
import NeoButton from "./neo-components/NeoButton";
import { MessageSquareQuote } from "./animate-ui/icons/message-square-quote";
import { AnimateIcon } from "./animate-ui/icons/icon";
import Link from "next/link";
import WoodenPlatform from "./WoodenPlatform";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeftIcon } from "./animate-ui/icons/arrow-left";
import { useMemo, useState } from "react";
import searchParamsKeys from "@/constants/search-params";
import useShortcuts, { KeyboardKey } from "@useverse/useshortcuts";
import { toPng } from "html-to-image"
import { toast } from "./ui/toast";


export default function Header() {
    const searchParams = useSearchParams();
    const isSharingNote = useMemo(() => Boolean(searchParams.get(searchParamsKeys.SHARE_NOTE)), [searchParams]);
    const pathname = usePathname();

    const [hideHeader, setHideHeader] = useState(false);

    const isHome = useMemo(() => {
        if (searchParams.get(searchParamsKeys.PRIVACY_SETTINGS) === "true") return false;
        return pathname === "/";
    }, [pathname, searchParams]);

    const isPrivacySettings = useMemo(() => {
        return searchParams.get(searchParamsKeys.PRIVACY_SETTINGS) === "true";
    }, [searchParams]);

    useShortcuts({
        shortcuts: [
            {
                key: "S",
                ctrlKey: true,
                platformAware: true,
                enabled: !isSharingNote,
            },
            {
                key: KeyboardKey.Digit5,
                ctrlKey: true,
                shiftKey: true,
                platformAware: true,
                enabled: isSharingNote,
            },
        ],
        onTrigger: () => {
            setHideHeader(true);
            const bodyElement = document.body;

            // Get current scroll position
            const scrollX = window.scrollX || window.pageXOffset;
            const scrollY = window.scrollY || window.pageYOffset;

            // Create a temporary container that's exactly 100dvw × 100dvh
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'fixed';
            tempContainer.style.top = '0';
            tempContainer.style.left = '0';
            tempContainer.style.width = '100dvw';
            tempContainer.style.height = '100dvh';
            tempContainer.style.overflow = 'hidden';
            tempContainer.style.zIndex = '-9999';
            document.body.appendChild(tempContainer);

            // Clone the content you want to capture
            const clone = bodyElement.cloneNode(true) as HTMLElement;

            // Apply negative margin to show the scrolled content
            clone.style.marginTop = `-${scrollY}px`;
            clone.style.marginLeft = `-${scrollX}px`;

            tempContainer.appendChild(clone);

            toPng(tempContainer, {
                width: window.innerWidth,
                height: window.innerHeight,
                style: {
                    margin: '0',
                    padding: '0'
                }
            })
                .then(function (dataUrl) {
                    const link = document.createElement('a');
                    const now = new Date();
                    link.download = `sayit-wiki-${now.getDay()}-${now.getMonth()}-${now.getFullYear()} at ${now.getHours()}.${now.getMinutes()},${now.getSeconds()}.jpeg`;
                    link.href = dataUrl;
                    link.click();

                    // Clean up
                    document.body.removeChild(tempContainer);
                    toast.success({
                        title: "Snapshot taken",
                        description: "You've taken a snapshot of today's page!",
                    });
                })
                .catch(function (error) {
                    console.error('Error capturing image:', error);
                    document.body.removeChild(tempContainer);
                })
                .finally(() => {
                    setHideHeader(false);
                });
        }
    }, [isSharingNote]);

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

    if (hideHeader) return null;

    return (
        <>
            <WoodenPlatform className="w-fit h-full rounded-3xl drop-shadow-[0_0_20px_rgba(0,0,0,0.0.5),0_0_5px_rgba(0,0,0,0.0.75)] sm:sticky sm:top-10 top-5 sm:left-10 left-1/2 max-sm:-translate-x-1/2 z-50">
                <AnimateIcon animateOnHover="wiggle" loop={true}>
                    <div className="md:px-3 px-2 md:py-3 py-2 flex border-8 border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                        <div className="absolute wooden inset-0 rounded-full m-0 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                        <NeoButton element="div" className="grid rel place-items-center md:py-3 py-2 md:px-5 px-3 cursor-default no-hover">
                            <div className="flex items-center gap-2">
                                <MessageSquareQuote strokeWidth={2.5} className="md:w-6 text-black sm:h-6 w-5 h-5 scale-125" />
                                <h1 className="md:text-lg text-sm text-black font-bold whitespace-nowrap">Sayit.Wiki</h1>
                            </div>
                            <Link href="/" className="absolute top-0 left-0 h-full w-full" />
                        </NeoButton>
                    </div>
                </AnimateIcon>
            </WoodenPlatform>

            <WoodenPlatform className="sm:w-fit w-[calc(100dvw-2rem)] h-full rounded-3xl drop-shadow-[0_0_20px_rgba(0,0,0,0.0.5),0_0_5px_rgba(0,0,0,0.0.75)] sticky sm:-mt-16 mt-8 top-10 sm:right-10 right-[unset] max-sm:left-1/2 max-sm:-translate-x-3.5 sm:float-right z-50">
                <div className="absolute wooden inset-0 rounded-full m-2 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                <nav className="md:px-2 px-1 md:py-2 py-1 flex border-8 border-background/0 sm:gap-3 gap-2 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                    {Object.values(PageNames).map((PageName) => {
                        if (PageName.action) {
                            return (
                                <AnimateIcon className="max-sm:flex-1" key={PageName.name} animateOnHover="wiggle" loop={true} >
                                    <NeoButton
                                        element="button"
                                        onClick={() => {
                                            PageName.action?.();
                                        }}
                                        className={cn("grid rel place-items-center md:py-3 py-2 md:px-5 px-3", isPrivacySettings && PageName.name === "Privacy Settings" && "selected active")}
                                    >
                                        <div className="flex items-center gap-2">
                                            <PageName.icon strokeWidth={2.5} className="md:w-6 text-black sm:h-6 w-5 h-5 max-sm:hidden" />
                                            <h1 className="md:text-sm text-xs text-black font-bold whitespace-nowrap">{PageName.name}</h1>
                                        </div>
                                    </NeoButton>
                                </AnimateIcon>
                            );
                        }
                        return (
                            <AnimateIcon className="max-sm:flex-1" key={PageName.name} animateOnHover="wiggle" loop={true} >
                                <NeoButton element={"a"} href={"/"} className={cn("grid place-items-center md:py-3 py-2 md:px-5 px-3", isHome && "selected active")}>
                                    <div className="flex items-center gap-2">
                                        <PageName.icon strokeWidth={2.5} className="md:w-6 text-black sm:h-6 w-5 h-5 max-sm:hidden" />
                                        <h1 className="md:text-sm text-xs text-black font-bold whitespace-nowrap">{PageName.name}</h1>
                                    </div>
                                </NeoButton>
                            </AnimateIcon>
                        )
                    })}
                </nav>
            </WoodenPlatform>
        </>
    )
}
