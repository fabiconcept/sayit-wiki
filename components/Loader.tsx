import { cn } from "@/lib/utils";

export default function Loader({ children, className }: { children?: React.ReactNode, className?: string }) {
    return (
        <div className={cn("flex flex-col gap-2 mix-blend-screen items-center py-10", className)}>
            <div id="loader" className="loader max-sm:scale-75" />
            {children}
        </div>
    )
}