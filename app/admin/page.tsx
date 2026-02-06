"use client";

import { useState } from "react";
import WoodenPlatform from "@/components/WoodenPlatform";
import { cn } from "@/lib/utils";
import NoteCard from "@/components/ui/NoteCard";
import NeoButton from "@/components/neo-components/NeoButton";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { ShieldAlertIcon, XIcon, EyeOffIcon } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { useGetReportsQuery, useIgnoreReportMutation, useTakedownReportMutation } from "@/store/api";

export default function AdminPage() {
    const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed'>('pending');
    
    const { data, isLoading, error, refetch } = useGetReportsQuery(
        { status: filter === 'all' ? undefined : filter },
        { skip: typeof window === 'undefined' || process.env.NODE_ENV !== 'development' }
    );
    
    const [ignoreReport] = useIgnoreReportMutation();
    const [takedownReport] = useTakedownReportMutation();
    
    const reports = data?.reports || [];

    const handleIgnore = async (reportId: string) => {
        try {
            await ignoreReport(reportId).unwrap();
            toast.success({
                title: "Report Ignored",
                description: "The report has been marked as ignored"
            });
        } catch (error) {
            console.error('Error ignoring report:', error);
            toast.error({
                title: "Error",
                description: "Failed to ignore report"
            });
        }
    };

    const handleTakedown = async (reportId: string) => {
        try {
            await takedownReport(reportId).unwrap();
            toast.success({
                title: "Content Removed",
                description: "The reported content has been taken down"
            });
        } catch (error) {
            console.error('Error taking down content:', error);
            toast.error({
                title: "Error",
                description: "Failed to take down content"
            });
        }
    };

    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <div className="min-h-screen w-full p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <WoodenPlatform
                    className="h-fit w-full mx-auto rounded-lg drop-shadow-lg mb-6"
                    noScrews
                >
                    <div className="wooden p-1 flex border-2 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                        <div className={cn(
                            "rounded-sm p-4 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3"
                        )}>
                            <div className="flex items-center gap-3">
                                <AnimateIcon animateOnHover="wiggle" loop={true}>
                                    <ShieldAlertIcon className="size-8 text-yellow-500" strokeWidth={2.5} />
                                </AnimateIcon>
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
                                    <p className="text-sm text-white/70">Development Mode Only</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/60">
                                <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 rounded">
                                    DEV ONLY
                                </span>
                            </div>
                        </div>
                    </div>
                </WoodenPlatform>

                {/* Filter Tabs */}
                <WoodenPlatform
                    className="h-fit w-full mx-auto rounded-lg drop-shadow-lg mb-6"
                    noScrews
                >
                    <div className="wooden p-1 flex border-2 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                        <div className={cn(
                            "rounded-sm p-2 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex items-center gap-2"
                        )}>
                            <button
                                onClick={() => setFilter('pending')}
                                className={cn(
                                    "px-4 py-2 rounded font-semibold transition-all",
                                    filter === 'pending'
                                        ? "bg-yellow-500 text-black"
                                        : "bg-white/10 text-white hover:bg-white/20"
                                )}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilter('reviewed')}
                                className={cn(
                                    "px-4 py-2 rounded font-semibold transition-all",
                                    filter === 'reviewed'
                                        ? "bg-yellow-500 text-black"
                                        : "bg-white/10 text-white hover:bg-white/20"
                                )}
                            >
                                Reviewed
                            </button>
                            <button
                                onClick={() => setFilter('all')}
                                className={cn(
                                    "px-4 py-2 rounded font-semibold transition-all",
                                    filter === 'all'
                                        ? "bg-yellow-500 text-black"
                                        : "bg-white/10 text-white hover:bg-white/20"
                                )}
                            >
                                All
                            </button>
                        </div>
                    </div>
                </WoodenPlatform>

                {/* Reports List */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-white text-lg animate-pulse">Loading reports...</p>
                    </div>
                ) : reports.length === 0 ? (
                    <WoodenPlatform
                        className="h-fit w-full mx-auto rounded-lg drop-shadow-lg"
                        noScrews
                    >
                        <div className="wooden p-1 flex border-2 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                            <div className={cn(
                                "rounded-sm p-8 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center gap-3"
                            )}>
                                <ShieldAlertIcon className="size-16 text-white/30" strokeWidth={1.5} />
                                <p className="text-white/70 text-lg">No reports found</p>
                            </div>
                        </div>
                    </WoodenPlatform>
                ) : (
                    <div className="grid gap-6">
                        {reports.map((report) => (
                            <WoodenPlatform
                                key={report.id}
                                className="h-fit w-full mx-auto rounded-lg drop-shadow-lg"
                                noScrews
                            >
                                <div className="wooden p-1 flex border-2 border-background/0 gap-3 relative z-10 rounded-lg shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                    <div className={cn(
                                        "rounded-sm p-4 bg-black/50 h-full w-full m-0 shadow-[inset_2px_2px_2px_rgba(0,0,0,0.25),inset_-2px_-2px_2px_rgba(0,0,0,0.5)] flex flex-col gap-4"
                                    )}>
                                        {/* Report Info */}
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={cn(
                                                        "px-2 py-1 text-xs font-semibold rounded",
                                                        report.status === 'pending' && "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50",
                                                        report.status === 'ignored' && "bg-gray-500/20 text-gray-400 border border-gray-500/50",
                                                        report.status === 'taken_down' && "bg-red-500/20 text-red-400 border border-red-500/50"
                                                    )}>
                                                        {report.status.toUpperCase()}
                                                    </span>
                                                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-500/20 text-blue-400 border border-blue-500/50">
                                                        {report.targetType.toUpperCase()}
                                                    </span>
                                                </div>
                                                {report.reason && (
                                                    <p className="text-white/80 text-sm mb-2">
                                                        <span className="font-semibold">Reason:</span> {report.reason}
                                                    </p>
                                                )}
                                                <p className="text-white/60 text-xs">
                                                    Reported: {new Date(report.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Reported Content */}
                                        <div className="flex items-center justify-center py-4">
                                            {report.content && (
                                                <NoteCard
                                                    {...report.content}
                                                    tilt={0}
                                                    maxWidth="100%"
                                                    canReact={false}
                                                    onCommentTap={() => {}}
                                                />
                                            )}
                                        </div>

                                        {/* Actions */}
                                        {report.status === 'pending' && (
                                            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                                                <AnimateIcon animateOnHover="wiggle" loop={true} className="flex-1">
                                                    <NeoButton
                                                        element="button"
                                                        className="w-full grid place-items-center py-3 px-5"
                                                        onClick={() => handleIgnore(report.id)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <EyeOffIcon className="size-4 text-black" strokeWidth={2.5} />
                                                            <span className="font-semibold text-black">Ignore</span>
                                                        </div>
                                                    </NeoButton>
                                                </AnimateIcon>
                                                <AnimateIcon animateOnHover="wiggle" loop={true} className="flex-1">
                                                    <NeoButton
                                                        element="button"
                                                        className="w-full grid place-items-center py-3 px-5 bg-red-500 hover:bg-red-600"
                                                        onClick={() => handleTakedown(report.id)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <XIcon className="size-4 text-white" strokeWidth={2.5} />
                                                            <span className="font-semibold text-white">Take Down</span>
                                                        </div>
                                                    </NeoButton>
                                                </AnimateIcon>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </WoodenPlatform>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
