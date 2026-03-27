/** Same outer height as MapView wrapper — reads like a map area before tiles load */

export function MapViewSkeleton() {
  return (
    <div
      className="h-[calc(100vh-122px)] md:h-[calc(100vh-147px-4rem)] w-full bg-gradient-to-br from-sky-100 via-emerald-50 to-slate-200 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 relative overflow-hidden"
      role="status"
      aria-label="Carregando mapa"
    >
      <div className="absolute inset-0 opacity-40 dark:opacity-25">
        <div className="absolute top-1/4 left-1/5 w-40 h-40 rounded-full bg-teal-300/50 dark:bg-teal-600/30 blur-2xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-52 h-52 rounded-full bg-blue-300/50 dark:bg-blue-600/30 blur-3xl animate-pulse" />
      </div>
      <div className="absolute bottom-6 left-4 right-4 flex gap-2 justify-center pointer-events-none">
        <div className="h-9 w-24 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-md animate-pulse" />
        <div className="h-9 w-24 rounded-lg bg-white/90 dark:bg-gray-800/90 shadow-md animate-pulse" />
      </div>
    </div>
  )
}
