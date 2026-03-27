/** List / grid skeletons aligned with BudgetList, ExpenseList, ReservationList, ChecklistList, Attractions */

export function BudgetListSkeleton() {
  return (
    <div className="space-y-8 animate-pulse" aria-hidden>
      {[1, 2].map((section) => (
        <section key={section} className="space-y-4">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm w-fit">
            <div className="w-8 h-8 rounded bg-gray-200 dark:bg-gray-600" />
            <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-600" />
            <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border-l-4 border-gray-300 dark:border-gray-500"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
                    <div className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-600 min-w-0" />
                    <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-600" />
                    <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export function ExpenseListSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-900/30 dark:to-orange-900/30 border border-rose-100 dark:border-rose-800 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-200/80 dark:bg-rose-900/50 flex-shrink-0" />
          <div className="space-y-2">
            <div className="h-3 w-28 rounded bg-rose-200/80 dark:bg-rose-800/40" />
            <div className="h-6 w-32 rounded bg-rose-200/80 dark:bg-rose-800/40" />
          </div>
        </div>
      </div>
      <div className="space-y-8 animate-pulse">
        {[1, 2].map((sec) => (
          <section key={sec} className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-600" />
                <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-600" />
                <div className="h-3 w-14 rounded bg-gray-100 dark:bg-gray-700" />
              </div>
              <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                  <div className="h-1 bg-gray-200 dark:bg-gray-600" />
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
                      <div className="flex-1 space-y-2 min-w-0">
                        <div className="h-3 w-full max-w-[200px] rounded bg-gray-200 dark:bg-gray-600" />
                        <div className="h-4 w-3/4 rounded bg-gray-100 dark:bg-gray-700" />
                      </div>
                    </div>
                    <div className="h-px bg-gray-100 dark:border-gray-700" />
                    <div className="flex justify-between gap-2">
                      <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-700" />
                      <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-600" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export function ReservationListSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-100 dark:border-indigo-800 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-200 dark:bg-indigo-900/50" />
          <div className="space-y-2">
            <div className="h-3 w-16 rounded bg-indigo-200/80 dark:bg-indigo-800/50" />
            <div className="h-3 w-40 rounded bg-indigo-200/60 dark:bg-indigo-800/40" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-9 w-24 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" />
          ))}
        </div>
      </div>
      <div className="space-y-6 animate-pulse">
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 shadow-sm w-fit">
            <div className="w-2 h-2 rounded-full bg-indigo-300" />
            <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-600" />
            <div className="h-3 w-12 rounded bg-gray-100 dark:bg-gray-700" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden">
                <div className="h-1 bg-gray-200 dark:bg-gray-600" />
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
                      <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700" />
                    </div>
                    <div className="h-5 w-16 rounded-md bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
                  </div>
                  <div className="h-6 w-full rounded bg-gray-200 dark:bg-gray-600" />
                  <div className="h-3 w-3/4 rounded bg-gray-100 dark:bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export function ChecklistListSkeleton() {
  return (
    <div aria-hidden>
      <div className="mb-8">
        <div className="rounded-2xl shadow-lg overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white animate-pulse">
          <div className="p-5 md:p-6 space-y-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20" />
                <div className="space-y-2">
                  <div className="h-6 w-48 rounded bg-white/25" />
                  <div className="h-4 w-36 rounded bg-white/20" />
                </div>
              </div>
              <div className="h-11 w-36 rounded-xl bg-white/30" />
            </div>
            <div className="mt-5 pt-5 border-t border-white/25 space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-32 rounded bg-white/20" />
                <div className="h-4 w-24 rounded bg-white/25" />
              </div>
              <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
                <div className="h-full w-1/3 rounded-full bg-white/40" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-24 rounded bg-white/20" />
                <div className="h-3 w-28 rounded bg-white/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-8 animate-pulse">
        {[1, 2].map((s) => (
          <section key={s} className="space-y-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm w-fit">
              <div className="w-6 h-6 rounded bg-gray-200 dark:bg-gray-600" />
              <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-600" />
              <div className="h-3 w-10 rounded bg-gray-100 dark:bg-gray-700" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border-l-4 border-gray-300 dark:border-gray-600"
                >
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-gray-200 dark:bg-gray-600 flex-shrink-0" />
                      <div className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-600 min-w-0" />
                    </div>
                    <div className="h-px bg-gray-100 dark:bg-gray-700" />
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-700" />
                      <div className="h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-600 ml-auto" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export function AttractionCardSkeleton() {
  return (
    <div className="relative rounded-2xl shadow-xl overflow-hidden border-l-4 border-l-blue-500 animate-pulse" aria-hidden>
      <div className="relative w-full aspect-[2/1] min-h-[96px] bg-gradient-to-br from-blue-500/70 to-purple-600/70">
        <div className="absolute inset-0 flex flex-col justify-between p-3">
          <div className="space-y-2">
            <div className="h-4 w-3/4 max-w-[220px] rounded bg-white/25" />
            <div className="h-3 w-1/2 max-w-[140px] rounded bg-white/20" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-48 max-w-[70%] rounded bg-white/20" />
            <div className="h-3 w-32 max-w-[50%] rounded bg-white/20" />
            <div className="flex gap-1.5 mt-2">
              <div className="h-6 w-16 rounded-md bg-white/15" />
              <div className="h-6 w-20 rounded-md bg-white/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AttractionsListSkeleton() {
  return (
    <div aria-hidden>
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap animate-pulse">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="h-7 w-40 rounded-lg bg-gray-200 dark:bg-gray-600" />
          <div className="h-4 w-16 rounded bg-gray-100 dark:bg-gray-700" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-gray-200 dark:bg-gray-600" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <AttractionCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}
