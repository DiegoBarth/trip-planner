import { BudgetSummary } from '@/components/home/BudgetSummary'
import { NextAttractions } from '@/components/home/NextAttractions'
import { CountryFilter } from '@/components/home/CountryFilter'
import { QuickActions } from '@/components/ui/QuickActions'
import { Sparkles } from 'lucide-react'

export function HomePage() {
   return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20 md:pb-6">
         {/* Hero Header */}
         <header className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 text-white">
            <div className="max-w-6xl mx-auto px-4 pt-6 pb-8">
               <div className="flex items-start justify-between mb-6">
                  <div>
                     <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5" />
                        <span className="text-sm font-medium opacity-90">Sua Viagem</span>
                     </div>
                     <h1 className="text-3xl md:text-4xl font-bold font-display">
                        Japão & Coreia
                     </h1>
                     <p className="text-sm md:text-base text-white/80 mt-2">
                        Planeje cada momento da sua aventura
                     </p>
                  </div>
               </div>
               
               <CountryFilter />
            </div>
         </header>

         {/* Main Content */}
         <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Quick Actions */}
            <section>
               <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Ações Rápidas
               </h2>
               <QuickActions />
            </section>

            {/* Budget Summary */}
            <section>
               <BudgetSummary />
            </section>

            {/* Next Attractions */}
            <section>
               <NextAttractions />
            </section>
         </main>
      </div>
   )
}