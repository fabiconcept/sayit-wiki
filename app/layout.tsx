import type { Metadata } from "next";
import { Finger_Paint } from "next/font/google";
import { Suspense } from "react";
import "./styles/globals.css";
import "./styles/fonts.css";
import "./styles/neomorphs.css";
import Header from "@/components/header";
import ThemeProvider from "@/components/theme-provider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Toaster, ToastProvider } from "@/components/ui/toast";
import StoreProvider from "@/store/provider";
import IdleScroll from "@/components/IdleScroll";
import LenisProvider from "@/components/LenisProvider";
import { baseMetadata } from "@/lib/metadata";
import { Analytics } from "@vercel/analytics/next";

const fingerPaint = Finger_Paint({
    variable: "--font-finger-paint",
    subsets: ["latin"],
    weight: "400",
});

export const metadata: Metadata = baseMetadata;

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${fingerPaint.variable} antialiased min-h-dvh dotted wooden`}
            >
                <Analytics />
                <LenisProvider>
                    <StoreProvider>
                        <ThemeProvider>
                            <Suspense fallback={null}>
                                <IdleScroll />
                            </Suspense>
                            <ToastProvider>
                                <Toaster />
                                <Suspense fallback={null}>
                                    <Header />
                                </Suspense>
                                {children}
                                <ThemeToggle />
                            </ToastProvider>
                        </ThemeProvider>
                    </StoreProvider>
                </LenisProvider>
            </body>
        </html>
    )
}
