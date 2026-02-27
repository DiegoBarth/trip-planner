import { useEffect, lazy, Suspense } from 'react'
import { useQueryClient } from '@tanstack/react-query';
import { QuickActions } from '@/components/ui/QuickActions'
import { LazySection } from '@/components/LazySection'
import NextDaySummary from '@/components/home/NextDaySummary'
import { useCountry } from '@/contexts/CountryContext'
import { useAttraction } from '@/hooks/useAttraction'
import { getBudgetsQueryOptions, getBudgetSummaryQueryOptions } from '@/services/budgetQueryService';
import { getAccommodationsQueryOptions } from '@/services/accommodationQueryService';
import { getExchangeRatesQueryOptions } from '@/services/currencyQueryService';
import { getWeatherQueryOptions } from '@/services/weatherQueryService';

const TodaysPendencies = lazy(() => import('@/components/home/TodaysPendencies'))
const TodayExpensesCard = lazy(() => import('@/components/home/TodayExpensesCard'))
const BudgetSummary = lazy(() => import('@/components/home/BudgetSummary'))

export default function HomePage(_props: { onLogout: () => void }) {
  const { country } = useCountry()
  const { citiesToPrefetch } = useAttraction(country)

  const queryClient = useQueryClient();

  useEffect(() => {
    queryClient.prefetchQuery(getBudgetsQueryOptions());
    queryClient.prefetchQuery(getBudgetSummaryQueryOptions());
    queryClient.prefetchQuery(getAccommodationsQueryOptions());
    queryClient.prefetchQuery(getExchangeRatesQueryOptions());

    citiesToPrefetch.forEach(city => queryClient.prefetchQuery(getWeatherQueryOptions(city)));
  }, [citiesToPrefetch]);

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