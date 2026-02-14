import { Link } from 'react-router-dom'
import { Plus, DollarSign, MapIcon, BarChart3, ListChecks, Ticket, Calendar } from 'lucide-react'
import { BudgetSummary } from '@/components/home/BudgetSummary'
import { NextAttractions } from '@/components/home/NextAttractions'
import { CountryFilter } from '@/components/home/CountryFilter'

export function HomePage() {
   return (
      <div className="min-h-screen bg-gray-50">
         <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
            <CountryFilter />
         </header>

         <main className="max-w-6xl mx-auto p-6 space-y-8">
            <section>
               <BudgetSummary />
            </section>

            <section>
               <NextAttractions />
            </section>

            <section className="sticky bottom-6">
               <div className="bg-white rounded-xl shadow-lg p-4 flex justify-around items-center border-2 border-gray-200">
                  <Link
                     to="/budgets"
                     className="flex flex-col items-center gap-1 p-3 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                     <DollarSign className="w-6 h-6 text-blue-600" />
                     <span className="text-xs font-medium">Orçamento</span>
                  </Link>

                  <Link
                     to="/expenses"
                     className="flex flex-col items-center gap-1 p-3 hover:bg-red-50 rounded-lg transition-colors"
                  >
                     <DollarSign className="w-6 h-6 text-red-600" />
                     <span className="text-xs font-medium">Gasto</span>
                  </Link>

                  <Link
                     to="/attractions"
                     className="flex flex-col items-center gap-1 p-3 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                     <Plus className="w-6 h-6 text-purple-600" />
                     <span className="text-xs font-medium">Atração</span>
                  </Link>

                  <Link
                     to="/checklist"
                     className="flex flex-col items-center gap-1 p-3 hover:bg-cyan-50 rounded-lg transition-colors"
                  >
                     <ListChecks className="w-6 h-6 text-cyan-600" />
                     <span className="text-xs font-medium">Checklist</span>
                  </Link>

                  <Link
                     to="/reservations"
                     className="flex flex-col items-center gap-1 p-3 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                     <Ticket className="w-6 h-6 text-indigo-600" />
                     <span className="text-xs font-medium">Reservas</span>
                  </Link>

                  <Link
                     to="/timeline"
                     className="flex flex-col items-center gap-1 p-3 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                     <Calendar className="w-6 h-6 text-orange-600" />
                     <span className="text-xs font-medium">Timeline</span>
                  </Link>

                  <Link
                     to="/map"
                     className="flex flex-col items-center gap-1 p-3 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                     <MapIcon className="w-6 h-6 text-gray-600" />
                     <span className="text-xs font-medium">Mapa</span>
                  </Link>

                  <Link
                     to="/dashboard"
                     className="flex flex-col items-center gap-1 p-3 hover:bg-green-50 rounded-lg transition-colors"
                  >
                     <BarChart3 className="w-6 h-6 text-green-600" />
                     <span className="text-xs font-medium">Dashboard</span>
                  </Link>
               </div>
            </section>
         </main>
      </div>
   )
}