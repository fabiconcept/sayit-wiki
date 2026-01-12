import { Suspense } from "react";
import Loader from "@/components/Loader";
import MakeANote from "@/components/make-a-note";
import PrivacySettings from "@/components/privacy-settings";
import ReportNoteModal from "@/components/report-note";
import ShareNoteModal from "@/components/share-note";
import Masonry from "@/components/ui/Masonry";
import ViewNoteModal from "@/components/view-note";
import notes from "@/constants/mock/notes";

export default function HomePage() {
    return (
        <div className="h-full w-full grid place-items-center sm:mt-20 mt-10 overflow-y-auto pt-4">
            <Masonry items={notes || []} key={"notes"} scrollOnNewItem={"bottom"}/>
            <Loader>
                <h4 className="md:text-base sm:text-sm text-xs text-black font-bold animate-bounce">Digging through notes...</h4>
            </Loader>
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