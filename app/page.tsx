import Loader from "@/components/Loader";
import MakeANote from "@/components/make-a-note";
import Masonry from "@/components/ui/Masonry";
import notes from "@/constants/mock/notes";

export default function HomePage() {
    return (
        <div className="h-full w-full grid place-items-center mt-20">
            <Masonry items={notes || []} />
            <Loader />
            <MakeANote />
        </div>
    )
}