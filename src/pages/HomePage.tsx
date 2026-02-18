import { BudgetSummary } from '@/components/home/BudgetSummary'
import { NextDaySummary } from '@/components/home/NextDaySummary'
import { TodayExpensesCard } from '@/components/home/TodayExpensesCard'
import { TodaysPendencies } from '@/components/home/TodaysPendencies'
import { CountryFilter } from '@/components/home/CountryFilter'
import { QuickActions } from '@/components/ui/QuickActions'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LogOut } from 'lucide-react'

interface Props {
   onLogout: () => void
}

export function HomePage({ onLogout }: Props) {
   return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20">
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
                  <div className="flex items-center gap-2">
                     <ThemeToggle />
                     <button
                        type="button"
                        onClick={onLogout}
                        className="p-2 rounded-lg text-white/90 hover:bg-white/20 hover:text-white transition-colors"
                        title="Sair"
                        aria-label="Sair da conta"
                     >
                        <LogOut className="w-5 h-5" />
                     </button>
                  </div>
               </div>

               <CountryFilter hideGeneralOption />
            </div>
         </header>

         {/* Main Content */}
         <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
            {/* Em tela grande: mesma altura; Pendências em cima e Gastos embaixo à direita, base alinhada ao Próximo Dia */}
            <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-6">
               <section className="md:min-w-0 md:flex-[2]">
                  <NextDaySummary />
               </section>
               <section className="flex flex-col gap-6 md:flex-1 md:min-h-0">
                  <TodaysPendencies />
                  <div className="md:min-h-0 md:flex-1 md:flex md:flex-col md:justify-end">
                     <TodayExpensesCard />
                  </div>
               </section>
            </div>

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