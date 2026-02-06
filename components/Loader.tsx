import { cn } from "@/lib/utils";

export default function Loader({ children, className }: { children?: React.ReactNode, className?: string }) {
    return (
        <div className={cn("flex flex-col gap-2 items-center py-10", className)}>
            <div id="loader" className="loader mix-blend-screen max-sm:scale-75" />
            {children}
        </div>
    )
}