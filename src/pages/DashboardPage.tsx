import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { AttractionStatusCards } from '@/components/dashboard/AttractionStatusCards'
import { PageHeader } from '@/components/ui/PageHeader'
import {
  BudgetOriginChartSkeleton,
  DashboardPageSkeleton,
  ExpensesChartSkeleton,
} from '@/components/skeletons/DashboardSkeletons'
import { useCountry } from '@/contexts/CountryContext'
import { formatCurrency } from '@/utils/formatters'
import { useAttraction } from '@/hooks/useAttraction'
import { useBudget } from '@/hooks/useBudget'
import { useExpense } from '@/hooks/useExpense';
import { useDashboard } from '@/hooks/useDashboard'

import { lazy } from 'react'
import { LazySection } from '@/components/LazySection'

const ExpensesByCategoryChart = lazy(() =>
  import('@/components/dashboard/ExpensesByCategoryChart')
)

const BudgetByOriginChart = lazy(() =>
  import('@/components/dashboard/BudgetByOriginChart')
)


export default function DashboardPage() {
  const { country } = useCountry()
  const { attractions, isLoading } = useAttraction(country);
  const { budgets } = useBudget()
  const { expenses } = useExpense(country)

  const dashboardData = useDashboard({
    budgets,
    expenses,
    attractions,
  })

  if (isLoading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
        <PageHeader title="Dashboard" subtitle="Resumo da sua viagem" />
        <DashboardPageSkeleton />
      </div>
    )
  }

  const stats = dashboardData.stats

  if (!stats) return;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
      <PageHeader title="Dashboard" subtitle="Resumo completo da sua viagem" />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <DashboardCard
            label="Total Gasto"
            value={formatCurrency(stats.totalSpent)}
            subValue={`de ${formatCurrency(stats.totalBudget)} orçados`}
            icon="💸"
            iconClass="bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
          />
          <DashboardCard
            label="Saldo Restante"
            value={formatCurrency(stats.remaining)}
            icon="💰"
            iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          />
          <DashboardCard
            label="Duração da Viagem"
            value={`${stats.daysOfTrip} Dias`}
            icon="🗓️"
            iconClass="bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
          />
          <DashboardCard
            label="Atrações Pendentes"
            value={stats.attractionStatus.pendingReservation.toString()}
            subValue="Necessitam reserva"
            icon="⚠️"
            iconClass="bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LazySection height={320} fallback={<ExpensesChartSkeleton />}>
            <ExpensesByCategoryChart data={stats.expensesByCategory} />
          </LazySection>

          <LazySection height={320} fallback={<BudgetOriginChartSkeleton />}>
            <BudgetByOriginChart data={stats.budgetByOrigin} />
          </LazySection>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <AttractionStatusCards status={stats.attractionStatus} />
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
            <div>
              <h2 className="font-bold text-lg mb-2">Próxima Parada?</h2>
              <p className="text-white/90 text-sm">
                Você tem{' '}
                {stats.attractionStatus.total - stats.attractionStatus.visited}{' '}
                atrações restantes no seu roteiro.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
