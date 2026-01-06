export default function Loader() {
    return (
        <div className="flex flex-col gap-2 mix-blend-screen">
            <div id="loader" className="loader" />
            <h1 className="md:text-2xl sm:text-xl text-lg dark:text-slate-400 font-bold animate-bounce">Loading...</h1>
        </div>
    )
}