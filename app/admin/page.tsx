"use client";

import { useMemo, useRef, useState, useCallback, Suspense } from "react";
import { cn, updateSearchParam, removeSearchParam } from "@/lib/utils";
import NoteCard from "@/components/ui/NoteCard";
import { toast } from "@/components/ui/toast";
import { useGetReportsQuery, useIgnoreReportMutation, useTakedownReportMutation, useReinstateReportMutation } from "@/store/api";
import Loader from "@/components/Loader";
import Lottie from "lottie-react";
import emptyAnimation from "@/components/lottie/ghosty.json";
import Masonry from "@/components/ui/Masonry";
import { EyeOffIcon, XIcon, RotateCcw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import WoodenPlatform from "@/components/WoodenPlatform";
import NeoButton from "@/components/neo-components/NeoButton";
import { AnimateIcon } from "@/components/animate-ui/icons/icon";
import { LoaderCircleIcon } from "@/components/animate-ui/icons/loader-circle";

// Extended Note Card with admin actions
const ReportCard = (props: any) => {
    const { status, content, onIgnore, onTakedown, onReinstate, isProcessing } = props;
    
    if (!content) return null;

    return (
        <div className="relative group">
            <NoteCard
                {...content}
                tilt={0}
                maxWidth="100%"
                canReact={false}
                onCommentTap={() => {}}
            />
            
            {/* Status Badge */}
            <div className="absolute top-2 right-2 flex gap-2 z-40 group-hover:opacity-100 opacity-0 transition-all duration-300">
                <span className={cn(
                    "px-2 py-1 text-xs font-bold rounded shadow-lg",
                    status === 'pending' && "bg-yellow-500 text-black",
                    status === 'ignored' && "bg-gray-500 text-white",
                    status === 'taken_down' && "bg-red-500 text-white"
                )}>
                    {status.toUpperCase()}
                </span>
            </div>

            {/* Action Buttons */}
            {status === 'pending' && (
                <div className="absolute bottom-2 right-2 flex gap-2 z-40 group-hover:opacity-100 opacity-0 transition-all duration-300">
                    <button
                        onClick={onIgnore}
                        disabled={isProcessing}
                        className={cn(
                            "p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110 active:scale-95",
                            isProcessing ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        )}
                        title="Ignore Report"
                    >
                        {isProcessing ? (
                            <LoaderCircleIcon 
                                animate="path-loop" 
                                strokeWidth={2.5} 
                                speed={0.05}
                                className="size-5 text-gray-700" 
                            />
                        ) : (
                            <EyeOffIcon className="size-5 text-gray-700" strokeWidth={2.5} />
                        )}
                    </button>
                    <button
                        onClick={onTakedown}
                        disabled={isProcessing}
                        className={cn(
                            "p-2 bg-red-500 hover:bg-red-600 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95",
                            isProcessing ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        )}
                        title="Take Down Content"
                    >
                        {isProcessing ? (
                            <LoaderCircleIcon 
                                animate="path-loop" 
                                strokeWidth={2.5} 
                                speed={0.05}
                                className="size-5 text-white" 
                            />
                        ) : (
                            <XIcon className="size-5 text-white" strokeWidth={2.5} />
                        )}
                    </button>
                </div>
            )}
            
            {/* Reinstate Button for Resolved Reports */}
            {(status === 'ignored' || status === 'taken_down') && (
                <div className="absolute bottom-2 right-2 flex gap-2 z-40 group-hover:opacity-100 opacity-0 transition-all duration-300">
                    <button
                        onClick={onReinstate}
                        disabled={isProcessing}
                        className={cn(
                            "p-2 bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95",
                            isProcessing ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                        )}
                        title="Reinstate Report"
                    >
                        {isProcessing ? (
                            <LoaderCircleIcon 
                                animate="path-loop" 
                                strokeWidth={2.5} 
                                speed={0.05}
                                className="size-5 text-white" 
                            />
                        ) : (
                            <RotateCcw className="size-5 text-white" strokeWidth={2.5} />
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};

function AdminPageContent() {
    const searchParams = useSearchParams();
    const filter = (searchParams.get('tab') || 'pending') as 'all' | 'pending' | 'resolved';
    const containerRef = useRef<HTMLDivElement>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    
    // Database toggle state (UI only - backend implementation needed for actual DB switching)
    const [isLiveDB, setIsLiveDB] = useState(false);
    
    // For "resolved" tab, we need to fetch reports that are either ignored or taken_down
    // The API doesn't support multiple statuses, so we fetch all and filter client-side for resolved
    const { data, isLoading, error, refetch } = useGetReportsQuery(
        { status: filter === 'all' ? undefined : (filter === 'resolved' ? undefined : filter) },
        { 
            skip: typeof window === 'undefined' || process.env.NODE_ENV !== 'development',
            refetchOnMountOrArgChange: true
        }
    );
    
    const [ignoreReport] = useIgnoreReportMutation();
    const [takedownReport] = useTakedownReportMutation();
    const [reinstateReport] = useReinstateReportMutation();
    
    // Filter reports based on selected tab
    const reports = useMemo(() => {
        const allReports = data?.reports || [];
        if (filter === 'resolved') {
            return allReports.filter((r: any) => r.status === 'ignored' || r.status === 'taken_down');
        }
        if (filter === 'all') {
            return allReports;
        }
        return allReports.filter((r: any) => r.status === filter);
    }, [data?.reports, filter]);

    const handleIgnore = useCallback(async (reportId: string) => {
        setProcessingId(reportId);
        try {
            await ignoreReport(reportId).unwrap();
            toast.success({
                title: "Report Ignored",
                description: "The report has been marked as ignored"
            });
            // Refetch to update the list
            refetch();
        } catch (error) {
            toast.error({
                title: "Error",
                description: "Failed to ignore report"
            });
        } finally {
            setProcessingId(null);
        }
    }, [ignoreReport, refetch]);

    const handleTakedown = useCallback(async (reportId: string) => {
        setProcessingId(reportId);
        try {
            await takedownReport(reportId).unwrap();
            toast.success({
                title: "Content Removed",
                description: "The reported content has been taken down"
            });
            // Refetch to update the list
            refetch();
        } catch (error) {
            toast.error({
                title: "Error",
                description: "Failed to take down content"
            });
        } finally {
            setProcessingId(null);
        }
    }, [takedownReport, refetch]);

    const handleReinstate = useCallback(async (reportId: string) => {
        setProcessingId(reportId);
        try {
            await reinstateReport(reportId).unwrap();
            toast.success({
                title: "Report Reinstated",
                description: "The report has been moved back to pending"
            });
            // Refetch to update the list
            refetch();
        } catch (error) {
            toast.error({
                title: "Error",
                description: "Failed to reinstate report"
            });
        } finally {
            setProcessingId(null);
        }
    }, [reinstateReport, refetch]);

    // Transform reports to match Masonry expected format
    const reportItems = useMemo(() => {
        return reports.map((report: any) => ({
            id: report.id,
            status: report.status,
            reportId: report.id,
            content: report.content,
            isProcessing: processingId === report.id,
            onIgnore: () => handleIgnore(report.id),
            onTakedown: () => handleTakedown(report.id),
            onReinstate: () => handleReinstate(report.id),
        }));
    }, [reports, processingId, handleIgnore, handleTakedown, handleReinstate]);

    // Loading State
    if (isLoading) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center">
                <Loader>
                    <h4 className="md:text-base sm:text-sm text-xs text-white/80 font-bold animate-bounce">
                        Loading reports...
                    </h4>
                </Loader>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center p-4">
                <div className="flex flex-col items-center justify-center gap-2">
                    <Lottie
                        animationData={emptyAnimation}
                        loop={true}
                        className="sm:size-40 size-24"
                        style={{ mixBlendMode: "screen" }}
                    />
                    <p className="text-sm font-bold text-white">Oops! An Error Occurred</p>
                    <p className="text-sm -mt-2 text-white/60 px-10 text-center">
                        Failed to load reports. Please try again.
                    </p>
                </div>
            </div>
        );
    }

    // Empty State
    if (reports.length === 0) {
        return (
            <div className="min-h-screen w-full p-4 px-10">
                <div className="w-full mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-white">Admin Reports</h1>
                            <p className="text-sm text-white/70">Development Mode Only</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Database Toggle */}
                            <WoodenPlatform className="w-fit h-full rounded-3xl drop-shadow-lg">
                                <div className="absolute wooden inset-0 rounded-full m-2 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                                <div className="px-2 py-2 flex border-8 border-background/0 gap-2 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                    <AnimateIcon animateOnHover="wiggle" loop={true}>
                                        <NeoButton
                                            element="button"
                                            onClick={() => setIsLiveDB(false)}
                                            className={cn("flex justify-center items-center py-2 px-4", !isLiveDB && "selected active")}
                                        >
                                            <h1 className="text-xs text-black font-bold whitespace-nowrap">Test DB</h1>
                                        </NeoButton>
                                    </AnimateIcon>
                                    <AnimateIcon animateOnHover="wiggle" loop={true}>
                                        <NeoButton
                                            element="button"
                                            onClick={() => {
                                                if (window.confirm('⚠️ WARNING: You are about to switch to LIVE DATABASE. This will affect real user data. Continue?')) {
                                                    setIsLiveDB(true);
                                                }
                                            }}
                                            className={cn("flex justify-center items-center py-2 px-4", isLiveDB && "selected active")}
                                        >
                                            <h1 className="text-xs text-black font-bold whitespace-nowrap">Live DB</h1>
                                        </NeoButton>
                                    </AnimateIcon>
                                </div>
                            </WoodenPlatform>
                            
                            <div className="flex flex-col gap-1">
                                <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded text-xs font-bold text-red-400 text-center">
                                    DEV ONLY
                                </span>
                                <span className={cn(
                                    "px-3 py-1 border rounded text-xs font-bold text-center",
                                    isLiveDB 
                                        ? "bg-red-500/20 border-red-500/50 text-red-400" 
                                        : "bg-green-500/20 border-green-500/50 text-green-400"
                                )}>
                                    {isLiveDB ? '🔴 LIVE' : '🟢 TEST'}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Filter Tabs */}
                    <WoodenPlatform className="w-fit h-full rounded-3xl drop-shadow-lg mb-6">
                        <div className="absolute wooden inset-0 rounded-full m-2 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                        <nav className="px-2 py-2 flex border-8 border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                <NeoButton
                                    element="button"
                                    onClick={() => filter === 'pending' ? removeSearchParam('tab') : updateSearchParam('tab', 'pending')}
                                    className={cn("flex justify-center items-center py-3 px-10", filter === 'pending' && "selected active")}
                                >
                                    <h1 className="text-sm text-black font-bold whitespace-nowrap">Pending</h1>
                                </NeoButton>
                                <NeoButton
                                    element="button"
                                    onClick={() => updateSearchParam('tab', 'resolved')}
                                    className={cn("flex justify-center items-center py-3 px-10", filter === 'resolved' && "selected active")}
                                >
                                    <h1 className="text-sm text-black font-bold whitespace-nowrap">Resolved</h1>
                                </NeoButton>
                                <NeoButton
                                    element="button"
                                    onClick={() => updateSearchParam('tab', 'all')}
                                    className={cn("flex justify-center items-center py-3 px-10", filter === 'all' && "selected active")}
                                >
                                    <h1 className="text-sm text-black font-bold whitespace-nowrap">All</h1>
                                </NeoButton>
                        </nav>
                    </WoodenPlatform>

                    <div className="flex flex-col items-center justify-center h-60 gap-2">
                        <Lottie
                            animationData={emptyAnimation}
                            loop={true}
                            className="sm:size-40 size-24"
                            style={{ mixBlendMode: "screen" }}
                        />
                        <p className="text-sm font-bold text-white">No Reports Found</p>
                        <p className="text-sm -mt-2 text-white/80 dark:text-white/70 px-10 text-center">
                            All clear! No {filter !== 'all' ? filter : ''} reports at the moment.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full p-4 px-10">
            <div className="w-full mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Admin Reports</h1>
                        <p className="text-sm text-white/70">Development Mode Only</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Database Toggle */}
                        <WoodenPlatform className="w-fit h-full rounded-3xl drop-shadow-lg">
                            <div className="absolute wooden inset-0 rounded-full m-2 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                            <div className="px-2 py-2 flex border-8 border-background/0 gap-2 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                                <AnimateIcon animateOnHover="wiggle" loop={true}>
                                    <NeoButton
                                        element="button"
                                        onClick={() => setIsLiveDB(false)}
                                        className={cn("flex justify-center items-center py-2 px-4", !isLiveDB && "selected active")}
                                    >
                                        <h1 className="text-xs text-black font-bold whitespace-nowrap">Test DB</h1>
                                    </NeoButton>
                                </AnimateIcon>
                                <AnimateIcon animateOnHover="wiggle" loop={true}>
                                    <NeoButton
                                        element="button"
                                        onClick={() => {
                                            if (window.confirm('⚠️ WARNING: You are about to switch to LIVE DATABASE. This will affect real user data. Continue?')) {
                                                setIsLiveDB(true);
                                            }
                                        }}
                                        className={cn("flex justify-center items-center py-2 px-4", isLiveDB && "selected active")}
                                    >
                                        <h1 className="text-xs text-black font-bold whitespace-nowrap">Live DB</h1>
                                    </NeoButton>
                                </AnimateIcon>
                            </div>
                        </WoodenPlatform>
                        
                        <div className="flex flex-col gap-1">
                            <span className="px-3 py-1 bg-red-500/20 border border-red-500/50 rounded text-xs font-bold text-red-400 text-center">
                                DEV ONLY
                            </span>
                            <span className={cn(
                                "px-3 py-1 border rounded text-xs font-bold text-center",
                                isLiveDB 
                                    ? "bg-red-500/20 border-red-500/50 text-red-400" 
                                    : "bg-green-500/20 border-green-500/50 text-green-400"
                            )}>
                                {isLiveDB ? '🔴 LIVE' : '🟢 TEST'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <WoodenPlatform className="w-fit h-full rounded-3xl drop-shadow-lg mb-6">
                    <div className="absolute wooden inset-0 rounded-full m-2 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5)]"></div>
                    <nav className="px-2 py-2 flex border-8 border-background/0 gap-3 relative z-10 rounded-full shadow-[inset_2px_2px_10px_rgba(0,0,0,0.25),inset_-2px_-2px_10px_rgba(0,0,0,0.5),0_0_4px_rgba(0,0,0,0.25)]">
                            <NeoButton
                                element="button"
                                onClick={() => filter === 'pending' ? removeSearchParam('tab') : updateSearchParam('tab', 'pending')}
                                className={cn("flex justify-center items-center py-3 px-10", filter === 'pending' && "selected active")}
                            >
                                <h1 className="text-sm text-black font-bold whitespace-nowrap">Pending</h1>
                            </NeoButton>
                            <NeoButton
                                element="button"
                                onClick={() => updateSearchParam('tab', 'resolved')}
                                className={cn("flex justify-center items-center py-3 px-10", filter === 'resolved' && "selected active")}
                            >
                                <h1 className="text-sm text-black font-bold whitespace-nowrap">Resolved</h1>
                            </NeoButton>
                            <NeoButton
                                element="button"
                                onClick={() => updateSearchParam('tab', 'all')}
                                className={cn("flex justify-center items-center py-3 px-10", filter === 'all' && "selected active")}
                            >
                                <h1 className="text-sm text-black font-bold whitespace-nowrap">All</h1>
                            </NeoButton>
                    </nav>
                </WoodenPlatform>

                {/* Reports Grid */}
                <div ref={containerRef}>
                    <Masonry
                        items={reportItems as any}
                        key={`reports-${filter}`}
                        Child={ReportCard}
                    />
                </div>
            </div>
        </div>
    );
}

// Suspense wrapper component
export default function AdminPage() {
    if (process.env.NODE_ENV !== 'development') {
        return null;
    }

    return (
        <Suspense
            fallback={
                <div className="min-h-screen w-full flex items-center justify-center">
                    <Loader>
                        <h4 className="md:text-base sm:text-sm text-xs text-white/80 font-bold animate-bounce">
                            Loading reports...
                        </h4>
                    </Loader>
                </div>
            }
        >
            <AdminPageContent />
        </Suspense>
    );
}
