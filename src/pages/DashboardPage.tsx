import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useDashboard } from '@/hooks/useDashboard';
import { formatCurrency } from '@/utils/formatters';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { AttractionStatusCards } from '@/components/dashboard/AttractionStatusCards';
import { ExpensesByCategoryChart } from '@/components/dashboard/ExpensesByCategoryChart';
import { BudgetByOriginChart } from '@/components/dashboard/BudgetByOriginChart';

export function DashboardPage() {
   const navigate = useNavigate();
   const dashboard = useDashboard('all');

   if (!dashboard.isReady || !dashboard.stats) {
      return (
         <Layout
            title="📊 Dashboard"
            onBack={() => navigate('/')}
            headerClassName="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
         >
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
               <p className="text-gray-500 font-medium animate-pulse">Carregando dados da viagem...</p>
            </div>
         </Layout>
      );
   }

   const { stats } = dashboard;

   return (
      <Layout
         title="Dashboard da Viagem"
         onBack={() => navigate('/')}
         headerClassName="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg"
      >
         <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 bg-gray-50 min-h-screen">

            {/* Section: Top Cards (KPIs) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <DashboardCard
                  label="Total Gasto"
                  value={formatCurrency(stats.totalSpent)}
                  subValue={`de ${formatCurrency(stats.totalBudget)} orçados`}
                  icon="💸"
                  colorClass="bg-red-500 text-red-600"
               />

               <DashboardCard
                  label="Saldo Restante"
                  value={formatCurrency(stats.remaining)}
                  icon="💰"
                  colorClass="bg-emerald-500 text-emerald-600"
               />

               <DashboardCard
                  label="Duração da Viagem"
                  value={`${stats.daysOfTrip} Dias`}
                  icon="🗓️"
                  colorClass="bg-blue-500 text-blue-600"
               />

               <DashboardCard
                  label="Atrações Pendentes"
                  value={stats.attractionStatus.pendingReservation.toString()}
                  subValue="Necessitam reserva"
                  icon="⚠️"
                  colorClass="bg-amber-500 text-amber-600"
               />
            </div>

            {/* Section: Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <ExpensesByCategoryChart data={stats.expensesByCategory} />
               <BudgetByOriginChart data={stats.budgetByOrigin} />
            </div>

            {/* Section: Bottom Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2">
                  <AttractionStatusCards status={stats.attractionStatus} />
               </div>

               <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg flex flex-col justify-between">
                  <div>
                     <h3 className="font-bold text-lg mb-2">Próxima Parada?</h3>
                     <p className="text-indigo-100 text-sm">
                        Você tem {stats.attractionStatus.total - stats.attractionStatus.visited} atrações restantes no seu roteiro. Aproveite cada momento!
                     </p>
                  </div>
                  <button
                     onClick={() => navigate('/attractions')}
                     className="mt-6 bg-white text-indigo-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-50 transition-colors w-full"
                  >
                     Ver Roteiro Completo
                  </button>
               </div>
            </div>

         </div>
      </Layout>
   );
}