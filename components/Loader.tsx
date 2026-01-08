export default function Loader() {
    return (
        <div className="flex flex-col gap-2 mix-blend-screen items-center py-10">
            <div id="loader" className="loader" />
            <h1 className="md:text-2xl sm:text-lg text-base dark:text-slate-400 font-bold animate-bounce">Digging through notes...</h1>
        </div>
    )
}