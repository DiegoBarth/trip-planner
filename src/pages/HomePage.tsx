import { useEffect, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query';
import Banknote from 'lucide-react/dist/esm/icons/banknote';
import Wallet from 'lucide-react/dist/esm/icons/wallet';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
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
        <Link
          to="/converter"
          className="md:hidden flex items-center gap-3 w-full p-4 rounded-2xl bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-100 hover:bg-amber-200/80 dark:hover:bg-amber-800/30 active:scale-[0.98] transition-all focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-50 dark:focus:ring-offset-gray-900 focus:outline-none"
          aria-label="Abrir conversor de moeda"
        >
          <div className="flex-shrink-0 w-11 h-11 rounded-full bg-amber-200/80 dark:bg-amber-800/50 flex items-center justify-center">
            <Banknote className="w-6 h-6 text-amber-800 dark:text-amber-200" />
          </div>
          <span className="flex-1 text-left font-semibold">Conversor de moeda</span>
          <ChevronRight className="w-5 h-5 text-amber-700 dark:text-amber-300 flex-shrink-0" />
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2">
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              Resumo Financeiro
            </h2>
          </div>
          <LazySection height={220}>
            <BudgetSummary />
          </LazySection>
        </section>
      </main>
    </div>
  )
}