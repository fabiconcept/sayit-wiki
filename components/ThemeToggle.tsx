"use client"

import { useTheme } from "next-themes"
import useShortcuts, { KeyboardKey } from "@useverse/useshortcuts"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    useShortcuts({
        shortcuts: [
            {
                key: KeyboardKey.KeyD,
                platformAware: true,
                ctrlKey: true,
                enabled: true,
            }
        ],
        onTrigger: (key) => {
            switch (key.key) {
                case KeyboardKey.KeyD:
                    setTheme(theme === "dark" ? "light" : "dark");
                    break;
                default:
                    break;
            }
        }
    }, [theme, setTheme])

    return null;
}