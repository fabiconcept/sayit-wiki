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
import { Dialog, DialogContent } from "./dialog";

interface BaseResponsiveModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
}

interface DesktopDialogModalProps extends BaseResponsiveModalProps {
    desktopModalType: "dialog";
    header: React.ReactNode;
}

interface DesktopSheetModalProps extends BaseResponsiveModalProps {
    desktopModalType?: "sheet";
}

type ResponsiveModalProps =
    | DesktopDialogModalProps
    | DesktopSheetModalProps;


export function ResponsiveModal({
    open,
    onOpenChange,
    title,
    description,
    children,
    className,
    ...props
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
                    <ScrollArea className="max-h-[80vh] overflow-y-auto">
                        {children}
                    </ScrollArea>
                </DrawerContent>
            </Drawer>
        );
    }

    if (props.desktopModalType && props.desktopModalType === "dialog") {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className={cn("p-0 rounded-3xl", className)} showCloseButton={false}>
                    {props.header}
                    <ScrollArea className="max-h-[90dvh] overflow-y-auto">{children}</ScrollArea>
                </DialogContent>
            </Dialog>
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

