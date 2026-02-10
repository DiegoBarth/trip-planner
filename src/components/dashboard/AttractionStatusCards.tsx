import type { AttractionStats } from '@/types/Dashboard'

export function AttractionStatusCards({ status }: { status: AttractionStats }) {
   const progress = status.visitedPercentage

   return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <div className="flex justify-between mb-4">
            <h3 className="font-bold text-gray-700 text-lg">🎢 Progresso da Viagem</h3>
            <span className="text-purple-600 font-semibold">
               {Math.round(progress)}%
            </span>
         </div>

         <div className="w-full bg-gray-100 rounded-full h-4 mb-6">
            <div
               className="bg-gradient-to-r from-purple-500 to-indigo-500 h-4 rounded-full transition-all"
               style={{ width: `${progress}%` }}
            />
         </div>

         <div className="grid grid-cols-3 text-center gap-4">
            <div>
               <p className="text-xs text-gray-400">Total</p>
               <p className="font-bold">{status.total}</p>
            </div>
            <div>
               <p className="text-xs text-emerald-500">Visitados</p>
               <p className="font-bold">{status.visited}</p>
            </div>
            <div>
               <p className="text-xs text-amber-500">Pendentes</p>
               <p className="font-bold">{status.pendingReservation}</p>
            </div>
         </div>
      </div>
   )
}