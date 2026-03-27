/** Skeletons matching home widgets — layout mirrors real components */

export function NextDaySummarySkeleton() {
  return (
    <div
      className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg p-6"
      aria-hidden
    >
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="h-4 w-32 max-w-[45%] rounded bg-white/25 animate-pulse" />
          <div className="h-7 w-56 max-w-[75%] rounded bg-white/30 animate-pulse" />
          <div className="h-3 w-40 max-w-[55%] rounded bg-white/20 animate-pulse" />
        </div>
        <div className="w-6 h-6 rounded-md bg-white/20 animate-pulse flex-shrink-0" />
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded bg-white/20 animate-pulse flex-shrink-0" />
        <div className="h-4 flex-1 max-w-[200px] rounded bg-white/25 animate-pulse" />
      </div>
      <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="space-y-2 min-w-0 flex-1">
            <div className="h-3 w-28 rounded bg-white/20 animate-pulse" />
            <div className="h-5 w-full max-w-[220px] rounded bg-white/25 animate-pulse" />
          </div>
          <div className="h-10 w-[108px] rounded-lg bg-white/20 animate-pulse flex-shrink-0" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-44 rounded bg-white/20 animate-pulse" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-11 w-full rounded-lg bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function TodaysPendenciesSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden" aria-hidden>
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-md bg-white/25 animate-pulse flex-shrink-0" />
          <div className="space-y-2 flex-1 min-w-0">
            <div className="h-5 w-32 rounded bg-white/30 animate-pulse" />
            <div className="h-4 w-48 max-w-full rounded bg-white/20 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {[1, 2].map((row) => (
          <div key={row} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 animate-pulse flex-shrink-0" />
              <div className="space-y-2 min-w-0">
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-600 animate-pulse" />
                <div className="h-3 w-44 max-w-[70vw] rounded bg-gray-100 dark:bg-gray-700 animate-pulse" />
              </div>
            </div>
            <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-600 animate-pulse flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TodayExpensesCardSkeleton() {
  return (
    <div
      className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4"
      aria-hidden
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 animate-pulse flex-shrink-0" />
        <div className="space-y-2 min-w-0">
          <div className="h-3 w-28 rounded bg-gray-200 dark:bg-gray-600 animate-pulse" />
          <div className="h-6 w-36 rounded bg-gray-200 dark:bg-gray-600 animate-pulse" />
        </div>
      </div>
      <div className="w-5 h-5 rounded bg-gray-200 dark:bg-gray-600 animate-pulse flex-shrink-0" />
    </div>
  )
}

function BudgetCardSkeleton({ borderTint }: { borderTint: string }) {
  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border-l-4 animate-pulse"
      style={{ borderLeftColor: borderTint }}
      aria-hidden
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600" />
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-600" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-baseline gap-2">
            <div className="h-3 w-10 rounded bg-gray-100 dark:bg-gray-700" />
            <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-600" />
          </div>
          <div className="flex justify-between items-baseline gap-2">
            <div className="h-3 w-12 rounded bg-gray-100 dark:bg-gray-700" />
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-600" />
          </div>
          <div className="flex justify-between items-baseline gap-2">
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700" />
            <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-600" />
          </div>
        </div>
        <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
          <div className="flex justify-between">
            <div className="h-3 w-14 rounded bg-gray-200 dark:bg-gray-600" />
            <div className="h-3 w-8 rounded bg-gray-200 dark:bg-gray-600" />
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full w-1/2 rounded-full bg-gray-300 dark:bg-gray-500 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function BudgetSummarySkeleton() {
  return (
    <div aria-hidden>
      <div className="rounded-2xl shadow-lg overflow-hidden mb-4 bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
        <div className="p-5 md:p-6 space-y-3">
          <div className="h-4 w-36 rounded bg-white/25 animate-pulse" />
          <div className="h-10 md:h-12 w-48 max-w-[85%] rounded-lg bg-white/30 animate-pulse" />
          <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
            <div className="flex justify-between gap-4">
              <div className="h-3 w-12 rounded bg-white/20 animate-pulse" />
              <div className="h-3 w-16 rounded bg-white/20 animate-pulse" />
            </div>
            <div className="h-2.5 bg-white rounded-full overflow-hidden">
              <div className="h-full w-2/5 rounded-full bg-white/50 animate-pulse" />
            </div>
            <div className="flex justify-between gap-4">
              <div className="h-3 w-16 rounded bg-white/20 animate-pulse" />
              <div className="h-3 w-16 rounded bg-white/20 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <BudgetCardSkeleton borderTint="#10b981" />
        <BudgetCardSkeleton borderTint="#6366f1" />
        <BudgetCardSkeleton borderTint="#f59e0b" />
      </div>
    </div>
  )
}
