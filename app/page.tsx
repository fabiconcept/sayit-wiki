"use client";
import { Suspense } from "react";
import Loader from "@/components/Loader";
import MakeANote from "@/components/make-a-note";
import PrivacySettings from "@/components/privacy-settings";
import ReportNoteModal from "@/components/report-note";
import ShareNoteModal from "@/components/share-note";
import NotesGrid from "@/components/NotesGrid";
import ViewNoteModal from "@/components/view-note";
import Lottie from "lottie-react";
import birdAnimation from "@/components/lottie/Birds.json";

export default function HomePage() {

    return (
        <div className="w-full grid place-items-center sm:mt-20 mt-10 pt-4">
            <NotesGrid key={"notes-grid"} />
            <Lottie
                animationData={birdAnimation}
                loop={true}
                className="sm:size-dvw size-dvh opacity-50 mix-blend-difference"
                style={{ position: "fixed", top: 0, left: 0, zIndex: -1 }}
            />
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