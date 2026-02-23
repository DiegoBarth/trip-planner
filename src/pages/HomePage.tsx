import { lazy, Suspense } from 'react'
import LogOut from 'lucide-react/dist/esm/icons/log-out';
import { CountryFilter } from '@/components/home/CountryFilter'
import { QuickActions } from '@/components/ui/QuickActions'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LazySection } from '@/components/LazySection'

// Componentes da "dobra de cima" - considere não usar lazy se o LCP continuar baixo
const NextDaySummary = lazy(() => import('@/components/home/NextDaySummary'))
const TodaysPendencies = lazy(() => import('@/components/home/TodaysPendencies'))
const TodayExpensesCard = lazy(() => import('@/components/home/TodayExpensesCard'))
const BudgetSummary = lazy(() => import('@/components/home/BudgetSummary'))

export default function HomePage({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20">
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
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Sair da conta"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          <CountryFilter hideGeneralOption />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="sr-only">Resumo do Próximo Dia</h2>
            <Suspense fallback={<div className="h-40 rounded-xl bg-gray-100 animate-pulse" />}>
              <NextDaySummary />
            </Suspense>
          </div>

          {/* Sidebar-like Content */}
          <div className="space-y-6">
            <h2 className="sr-only">Pendências e Gastos de Hoje</h2>
            <Suspense fallback={<div className="h-32 rounded-xl bg-gray-100 animate-pulse" />}>
              <TodaysPendencies />
            </Suspense>
            <Suspense fallback={<div className="h-32 rounded-xl bg-gray-100 animate-pulse" />}>
              <TodayExpensesCard />
            </Suspense>
          </div>
        </div>

        <section aria-labelledby="quick-actions-title">
          <h2 id="quick-actions-title" className="text-lg font-semibold mb-4">
            Navegação Rápida
          </h2>
          <QuickActions />
        </section>

        <section aria-labelledby="budget-title">
          <h2 id="budget-title" className="text-lg font-semibold mb-4">
            Resumo do Orçamento
          </h2>
          <LazySection height={220}>
            <BudgetSummary />
          </LazySection>
        </section>
      </main>
    </div>
  )
}