/** Mirrors DashboardPage: 4 stat cards, 2 charts, progress block + gradient CTA */

function DashboardCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 min-h-[100px] animate-pulse" aria-hidden>
      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-200 dark:bg-gray-600" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-24 rounded bg-gray-200 dark:bg-gray-600" />
        <div className="h-7 w-32 max-w-[80%] rounded bg-gray-200 dark:bg-gray-600" />
        <div className="h-3 w-40 max-w-[90%] rounded bg-gray-100 dark:bg-gray-700" />
      </div>
    </div>
  )
}

export function ExpensesChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse" aria-hidden>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600" />
        <div className="h-5 w-48 rounded bg-gray-200 dark:bg-gray-600" />
      </div>
      <div className="flex flex-col min-h-0">
        <div className="flex-1 min-h-[200px] max-h-[240px] flex items-center justify-center">
          <div className="w-[180px] h-[180px] rounded-full bg-gray-100 dark:bg-gray-700 border-8 border-gray-200 dark:border-gray-600" />
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-700" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function BudgetOriginChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse" aria-hidden>
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-600" />
        <div className="h-5 w-52 rounded bg-gray-200 dark:bg-gray-600" />
      </div>
      <div className="w-full relative h-[220px] flex items-end justify-around gap-2 px-4 pb-6 pt-8 border-b border-l border-gray-200 dark:border-gray-600">
        {[40, 65, 35, 55, 45].map((h, i) => (
          <div key={i} className="flex gap-1 items-end flex-1 max-w-[48px] justify-center">
            <div className="w-3 rounded-t bg-gray-200 dark:bg-gray-600" style={{ height: `${h}%` }} />
            <div className="w-3 rounded-t bg-gray-300 dark:bg-gray-500" style={{ height: `${h * 0.7}%` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function AttractionStatusCardsSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse" aria-hidden>
      <div className="flex justify-between mb-4">
        <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-600" />
        <div className="h-6 w-10 rounded bg-gray-200 dark:bg-gray-600" />
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 mb-6 overflow-hidden">
        <div className="h-full w-1/3 rounded-full bg-gray-300 dark:bg-gray-500" />
      </div>
      <div className="grid grid-cols-3 text-center gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-12 mx-auto rounded bg-gray-100 dark:bg-gray-700" />
            <div className="h-6 w-8 mx-auto rounded bg-gray-200 dark:bg-gray-600" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardPageSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando dashboard"
      className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <DashboardCardSkeleton key={i} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ExpensesChartSkeleton />
        <BudgetOriginChartSkeleton />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AttractionStatusCardsSkeleton />
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between min-h-[160px] animate-pulse" aria-hidden>
          <div className="space-y-2">
            <div className="h-6 w-40 rounded bg-white/25" />
            <div className="h-4 w-full rounded bg-white/20" />
            <div className="h-4 w-4/5 max-w-[280px] rounded bg-white/15" />
          </div>
        </div>
      </div>
    </div>
  )
}
