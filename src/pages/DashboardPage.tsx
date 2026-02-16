import { useCountry } from '@/contexts/CountryContext'
import { formatCurrency } from '@/utils/formatters'
import { DashboardCard } from '@/components/dashboard/DashboardCard'
import { AttractionStatusCards } from '@/components/dashboard/AttractionStatusCards'
import { ExpensesByCategoryChart } from '@/components/dashboard/ExpensesByCategoryChart'
import { BudgetByOriginChart } from '@/components/dashboard/BudgetByOriginChart'
import { PageHeader } from '@/components/ui/PageHeader'

export function DashboardPage() {
   const { dashboard, isReady } = useCountry()

   if(!isReady) {
      return (
         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
            <PageHeader
               title="Dashboard"
               subtitle="Resumo da sua viagem"
            />
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
               <p className="text-gray-500 font-medium animate-pulse">Carregando dados da viagem...</p>
            </div>
         </div>
      );
   }

   const stats = dashboard

   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
         <PageHeader
            title="Dashboard"
            subtitle="Resumo completo da sua viagem"
         />

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
               <ExpensesByCategoryChart data={stats.expensesByCategory} />
               <BudgetByOriginChart data={stats.budgetByOrigin} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
               <div className="lg:col-span-2">
                  <AttractionStatusCards status={stats.attractionStatus} />
               </div>
               <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
                  <div>
                     <h3 className="font-bold text-lg mb-2">Próxima Parada?</h3>
                     <p className="text-white/90 text-sm">
                        Você tem {stats.attractionStatus.total - stats.attractionStatus.visited} atrações restantes no seu roteiro.
                     </p>
                  </div>
               </div>
            </div>
         </main>
      </div>
   )
}
