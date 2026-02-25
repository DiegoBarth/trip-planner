import { lazy, Suspense } from 'react'
import { QuickActions } from '@/components/ui/QuickActions'
import { LazySection } from '@/components/LazySection'
import NextDaySummary from '@/components/home/NextDaySummary'

const TodaysPendencies = lazy(() => import('@/components/home/TodaysPendencies'))
const TodayExpensesCard = lazy(() => import('@/components/home/TodayExpensesCard'))
const BudgetSummary = lazy(() => import('@/components/home/BudgetSummary'))

export default function HomePage(_props: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pb-20">
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="sr-only">Resumo do Próximo Dia</h2>
            <NextDaySummary />
          </div>

          {/* Sidebar-like Content */}
          <div className="space-y-6">
            <h2 className="sr-only">Pendências e Gastos de Hoje</h2>
            <Suspense fallback={<div className="h-56 rounded-xl bg-gray-100 animate-pulse" />}>
              <TodaysPendencies />
            </Suspense>
            <Suspense fallback={<div className="h-20 rounded-xl bg-gray-100 animate-pulse" />}>
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