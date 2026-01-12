import { PinIcon } from "@/components/animate-ui/icons/pin";
import { RadioIcon } from "@/components/animate-ui/icons/radio";
import { SettingsIcon } from "@/components/animate-ui/icons/settings";
import { updateSearchParam } from "@/lib/utils";
import searchParamsKeys from "./search-params";

interface Page {
    name: string;
    description: string;
    action?: () => void;
    icon: React.ComponentType<{ className?: string, strokeWidth?: number }>;
}

export const PageNames: Record<string, Page> = {
    theWall: {
        name: "The Wall",
        description: "The Wall is a place where you can share your thoughts and ideas with the world.",
        icon: PinIcon,
    },
    globalWiki: {
        name: "Globe Wall",
        action: () => updateSearchParam(searchParamsKeys.PRIVACY_SETTINGS, "true"),
        description: "Global Wiki is a place where you can share your knowledge with the world.",
        icon: RadioIcon,
    },
    privacySettings: {
        name: "Privacy Settings",
        action: () => updateSearchParam(searchParamsKeys.PRIVACY_SETTINGS, "true"),
        description: "Privacy Settings is a place where you can manage your privacy settings.",
        icon: SettingsIcon,
    },
}