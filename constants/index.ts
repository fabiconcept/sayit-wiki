import { PinIcon } from "@/components/animate-ui/icons/pin";
import { RadioIcon } from "@/components/animate-ui/icons/radio";
import { SettingsIcon } from "@/components/animate-ui/icons/settings";

interface Page {
    name: string;
    description: string;
    icon: React.ComponentType<{ className?: string, strokeWidth?: number }>;
}

export const PageNames: Record<string, Page> = {
    theWall: {
        name: "The Wall",
        description: "The Wall is a place where you can share your thoughts and ideas with the world.",
        icon: PinIcon,
    },
    globalWiki: {
        name: "Global Wiki",
        description: "Global Wiki is a place where you can share your knowledge with the world.",
        icon: RadioIcon,
    },
    privacySettings: {
        name: "Privacy Settings",
        description: "Privacy Settings is a place where you can manage your privacy settings.",
        icon: SettingsIcon,
    },
}