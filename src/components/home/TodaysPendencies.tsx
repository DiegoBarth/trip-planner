import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCountry } from '@/contexts/CountryContext'
import { CheckSquare, AlertCircle, FileText, ChevronRight } from 'lucide-react'

export function TodaysPendencies() {
   const { checklistItems, reservations } = useCountry()

   const pendencies = useMemo(() => {
      const unpackedItems = checklistItems.filter(item => !item.isPacked)
      const pendingReservations = reservations.filter(r => r.status === 'pending')
      
      return {
         checklist: unpackedItems.length,
         reservations: pendingReservations.length,
         total: unpackedItems.length + pendingReservations.length
      }
   }, [checklistItems, reservations])

   if (pendencies.total === 0) {
      return (
         <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-md p-6">
            <div className="flex items-center gap-3">
               <CheckSquare className="w-8 h-8" />
               <div>
                  <h3 className="text-lg font-bold">Tudo em dia!</h3>
                  <p className="text-sm opacity-90">Nenhuma pendência no momento</p>
               </div>
            </div>
         </div>
      )
   }

   return (
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
         <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-4">
            <div className="flex items-center gap-3">
               <AlertCircle className="w-6 h-6" />
               <div>
                  <h3 className="text-lg font-bold">Pendências</h3>
                  <p className="text-sm opacity-90">{pendencies.total} {pendencies.total === 1 ? 'item' : 'itens'} para resolver</p>
               </div>
            </div>
         </div>

         <div className="divide-y divide-gray-200">
            {pendencies.checklist > 0 && (
               <Link
                  to="/checklist"
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                     </div>
                     <div>
                        <p className="font-semibold text-gray-900">Checklist</p>
                        <p className="text-sm text-gray-600">
                           {pendencies.checklist} {pendencies.checklist === 1 ? 'item' : 'itens'} para empacotar
                        </p>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
               </Link>
            )}

            {pendencies.reservations > 0 && (
               <Link
                  to="/reservations"
                  className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                        <FileText className="w-5 h-5 text-orange-600" />
                     </div>
                     <div>
                        <p className="font-semibold text-gray-900">Reservas</p>
                        <p className="text-sm text-gray-600">
                           {pendencies.reservations} {pendencies.reservations === 1 ? 'reserva pendente' : 'reservas pendentes'}
                        </p>
                     </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
               </Link>
            )}
         </div>
      </div>
   )
}
