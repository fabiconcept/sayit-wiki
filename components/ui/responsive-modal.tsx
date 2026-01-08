"use client";
import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "./sheet";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "./drawer";
import { ScrollArea } from "./scroll-area";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-is-mobile";

interface ResponsiveModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

export function ResponsiveModal({
    open,
    onOpenChange,
    title,
    description,
    children,
    className
}: ResponsiveModalProps) {
    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <Drawer open={open} onOpenChange={onOpenChange}>
                <DrawerContent className={cn(
                    className,
                    "rounded-t-3xl"
                )}>
                    {(title || description) && (
                        <DrawerHeader className="text-left sr-only">
                            {title && <DrawerTitle>{title}</DrawerTitle>}
                            {description && <DrawerDescription>{description}</DrawerDescription>}
                        </DrawerHeader>
                    )}
                    <ScrollArea className="max-h-[70vh] overflow-y-auto">
                        {children}
                    </ScrollArea>
                </DrawerContent>
            </Drawer>
        );
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className={cn("p-0 rounded-3xl", className)}>
                {(title || description) && (
                    <SheetHeader className="sr-only">
                        {title && <SheetTitle>{title}</SheetTitle>}
                        {description && <SheetDescription>{description}</SheetDescription>}
                    </SheetHeader>
                )}
                <ScrollArea className="overflow-y-auto">{children}</ScrollArea>
            </SheetContent>
        </Sheet>
    );
}

