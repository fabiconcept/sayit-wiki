import { cn } from "@/lib/utils"
import Link from "next/link";
import { motion } from "framer-motion";

interface NeoButtonBaseProps {
    children: React.ReactNode;
    className?: string;
    element?: "button" | "a" | "div";
}

interface ButtonProps extends NeoButtonBaseProps {
    onClick?: () => void;
    element: "button";
    disabled?: boolean;
}

interface LinkProps extends NeoButtonBaseProps {
    element: "a";
    href: string;
    disabled?: boolean;
}

interface DivProps extends NeoButtonBaseProps {
    onClick?: () => void;
    element: "div";
}

type NeoButtonProps = ButtonProps | LinkProps | DivProps;


export default function NeoButton({ children, ...props }: NeoButtonProps) {
    const content = (
        <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full overflow-hidden z-0 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-[120%] object-contain">
                    <filter id="filter">
                        <feTurbulence baseFrequency=".002 .02" numOctaves="9" result="n" />
                        <feDiffuseLighting surfaceScale="9" lightingColor="#BA8C63">
                            <feDistantLight elevation="60" azimuth="-90" />
                        </feDiffuseLighting>
                        <feDisplacementMap in2="n" scale="10" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#filter)" />
                </svg>
            </div>
            <div className={cn("platform absolute top-0 left-0 z-10", props.className?.includes("no-hover") ? "no-hover" : "")}>
                <div className="platform-outer border-4 border-foreground/5 relative h-full w-full">
                    <div className={cn("platform-inner relative h-full w-full", props.className)}>
                        {children}
                    </div>
                </div>
            </div>
            {props.className?.includes("selected active") && (
                <motion.div
                    className={cn("pin -top-5 -right-5 -translate-x-1 h-16 w-14 scale-75")}
                    initial={{ opacity: 0, scale: 0.75, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ 
                        duration: 0.3, 
                        ease: "easeInOut",
                        delay: 0.3,
                        type: "spring",
                        stiffness: 100,
                        mass: 1,
                        damping: 10,
                        restDelta: 0.01,
                        restSpeed: 10
                    }}
                >
                    <div className="shadow"></div>
                    <div className="metal"></div>
                    <div className="bottom-circle"></div>
                </motion.div>
            )}
        </>
    );

    const baseClassName = cn(
        "min-w-16 w-full h-fit relative rounded-full z-50 cursor-pointer",
        props.className?.includes("cursor-default") ? "" : "focus:outline-4 focus:outline-background/25 focus:outline-offset-1 focus:outline-dotted focus:brightness-125 dark:focus:brightness-110 select-none hover:brightness-125 transition-all duration-300",
        props.className?.includes("selected") ? "outline-4 outline-background/50 outline-offset-1 outline-dotted brightness-125 select-none brightness-125 transition-all duration-300" : "",
    );

    if (props.element === "button") {
        return (
            <button
                onClick={props.onClick}
                disabled={props.disabled}
                className={baseClassName}
            >
                {content}
            </button>
        );
    }

    if (props.element === "a") {
        return (
            <Link href={props.href} className={baseClassName}>
                {content}
            </Link>
        );
    }

    return (
        <div onClick={props.onClick} className={baseClassName}>
            {content}
        </div>
    );
}