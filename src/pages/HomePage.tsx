import { BudgetSummary } from '@/components/home/BudgetSummary'
import { NextDaySummary } from '@/components/home/NextDaySummary'
import { TodayExpensesCard } from '@/components/home/TodayExpensesCard'
import { TodaysPendencies } from '@/components/home/TodaysPendencies'
import { CountryFilter } from '@/components/home/CountryFilter'
import { QuickActions } from '@/components/ui/QuickActions'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function HomePage() {
   return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20 md:pb-6">
         {/* Hero Header */}
         <header className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
            <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
               <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0">
                     <h1 className="text-3xl md:text-4xl font-bold font-display">
                        Japão & Coreia
                     </h1>
                     <p className="text-sm md:text-base text-white/80 mt-2">
                        Planeje cada momento da sua aventura
                     </p>
                  </div>
                  <ThemeToggle />
               </div>

               <CountryFilter />
            </div>
         </header>

         {/* Main Content */}
         <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Next Day Summary */}
            <section>
               <NextDaySummary />
            </section>

            {/* Today's Pendencies */}
            <section>
               <TodaysPendencies />
            </section>

            <section>
               <TodayExpensesCard />
            </section>

            {/* Quick Actions */}
            <section>
               <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Navegação Rápida
               </h2>
               <QuickActions />
            </section>

            {/* Budget Summary */}
            <section>
               <BudgetSummary />
            </section>
         </main>
      </div>
   )
}