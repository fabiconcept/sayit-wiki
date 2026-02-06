"use client";
import { Suspense } from "react";
import Loader from "@/components/Loader";
import MakeANote from "@/components/make-a-note";
import PrivacySettings from "@/components/privacy-settings";
import ReportNoteModal from "@/components/report-note";
import ShareNoteModal from "@/components/share-note";
import NotesGrid from "@/components/NotesGrid";
import ViewNoteModal from "@/components/view-note";

export default function HomePage() {
    
    return (
        <div className="w-full grid place-items-center sm:mt-20 mt-10 pt-4">
            <NotesGrid key={"notes-grid"} />
            <Suspense fallback={null}>
                <MakeANote />
            </Suspense>
            <Suspense fallback={null}>
                <ViewNoteModal />
            </Suspense>
            <Suspense fallback={null}>
                <ReportNoteModal />
            </Suspense>
            <Suspense fallback={null}>
                <ShareNoteModal />
            </Suspense>
            <Suspense fallback={null}>
                <PrivacySettings />
            </Suspense>
        </div>
    )
}