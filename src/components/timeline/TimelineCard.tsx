import { MapPin, Clock, Banknote, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react'
import type { Attraction } from '@/types/Attraction'
import type { TimelineConflict } from '@/types/Timeline'
import { ATTRACTION_TYPES, RESERVATION_STATUS } from '@/config/constants'
import { formatCurrency } from '@/utils/formatters'

interface TimelineCardProps {
   attraction: Attraction
   arrivalTime: string
   departureTime: string
   duration: number
   conflicts: TimelineConflict[]
   onToggleVisited?: (id: number) => void
}

function openInMaps(lat: number, lng: number, name: string) {
   const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`
   window.open(url, '_blank')
}

export function TimelineCard({
   attraction,
   arrivalTime,
   departureTime,
   duration,
   conflicts,
   onToggleVisited
}: TimelineCardProps) {
   const typeConfig = ATTRACTION_TYPES[attraction.type]
   const hasError = conflicts.some(c => c.severity === 'error')
   const hasWarning = conflicts.some(c => c.severity === 'warning')
   const isVisited = attraction.visited
   const isAccommodation = attraction.id === -999
   const hasLocation = attraction.lat && attraction.lng

   const bgClass = hasError
      ? 'bg-red-50 dark:bg-red-900/30'
      : isVisited && !hasError && !hasWarning
         ? 'bg-green-50/60 dark:bg-green-900/30'
         : 'bg-white dark:bg-gray-800'

   return (
      <div className="relative">
         <div className={`
        absolute left-0 top-6 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white dark:border-gray-800 shadow z-10 -translate-x-1/2
        ${isVisited ? 'bg-emerald-500' : 'bg-slate-500 dark:bg-slate-400'}
      `} />

         <div
            className={`
          ml-4 md:ml-6 rounded-2xl shadow-md overflow-hidden transition-all border-l-4
          ${bgClass}
          ${hasError ? 'border-l-red-500' : ''}
          ${hasWarning && !hasError ? 'border-l-amber-500' : ''}
          ${isVisited && !hasError && !hasWarning ? 'border-l-emerald-500' : ''}
          ${!hasError && !hasWarning && !isVisited ? 'border-l-slate-500 dark:border-l-slate-400' : ''}
          ${isVisited ? 'opacity-90' : ''}
        `}
         >
            {!isAccommodation && (
               attraction.imageUrl ? (
                  <div className="h-20 bg-cover bg-center bg-gray-100 dark:bg-gray-700" style={{ backgroundImage: `url(${attraction.imageUrl})` }} />
               ) : (
                  <div className="h-20 flex items-center justify-center gap-2 bg-gradient-to-br from-slate-500 to-slate-600 dark:from-slate-600 dark:to-slate-700">
                     <span className="text-3xl">{typeConfig?.icon}</span>
                     <span className="text-xs font-medium text-white/90 uppercase tracking-wide">{typeConfig?.label}</span>
                  </div>
               )
            )}

            <div className="p-3">
               {/* Times - Compact */}
               <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700">
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                  <div className="flex items-center gap-2 text-sm flex-1">
                     <span className="font-bold text-gray-900 dark:text-gray-100">{arrivalTime}</span>
                     <span className="text-gray-400 dark:text-gray-500">→</span>
                     <span className="font-bold text-gray-900 dark:text-gray-100">{departureTime}</span>
                     <span className="text-xs text-gray-500 dark:text-gray-400">({duration}min)</span>
                  </div>

                  {/* Maps button - Show if has location */}
                  {hasLocation && (
                     <button
                        onClick={(e) => {
                           e.stopPropagation()
                           openInMaps(attraction.lat!, attraction.lng!, attraction.name)
                        }}
                        className="p-1.5 rounded-full transition-all flex-shrink-0 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none"
                        title="Abrir no Google Maps"
                     >
                        <Navigation className="w-5 h-5" />
                     </button>
                  )}

                  {/* Check button - Only show if NOT accommodation */}
                  {!isAccommodation && (
                     <button
                        onClick={(e) => {
                           e.stopPropagation()
                           onToggleVisited?.(attraction.id)
                        }}
                        className={`
                  p-1.5 rounded-full transition-all flex-shrink-0
                  focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none
                  ${isVisited
                              ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                           }
                `}
                        title={isVisited ? 'Marcar como não visitado' : 'Marcar como visitado'}
                     >
                        <CheckCircle2 className="w-5 h-5" />
                     </button>
                  )}
               </div>

               {/* Main info - alinhado ao AttractionCard */}
               <div className="mb-2">
                  <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-2">
                     {attraction.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                     <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                     <span>{attraction.region ? `${attraction.region}, ` : ''}{attraction.city}</span>
                  </div>
                  {/* Custo - mesmo estilo do AttractionCard */}
                  {!isAccommodation && (
                     <div className="flex items-center gap-2 text-sm mt-1.5">
                        <Banknote className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                        {attraction.couplePrice ? (
                           <>
                              <span className="font-semibold text-green-600 dark:text-green-400">
                                 {formatCurrency(attraction.couplePrice, attraction.currency)}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-xs">({formatCurrency(attraction.priceInBRL)})</span>
                           </>
                        ) : (
                           <span className="font-semibold text-green-600 dark:text-green-400">Gratuito</span>
                        )}
                     </div>
                  )}
               </div>

               {!isAccommodation && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                     {typeConfig && (
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md font-medium">
                           {typeConfig.label}
                        </span>
                     )}
                     {attraction.needsReservation && attraction.reservationStatus && (
                        <span className={`px-2 py-0.5 text-xs rounded-md font-medium flex items-center gap-1 ${attraction.reservationStatus === 'confirmed' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                           attraction.reservationStatus === 'pending' ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300' :
                              attraction.reservationStatus === 'cancelled' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                                 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                           }`}>
                           <span>{RESERVATION_STATUS[attraction.reservationStatus].icon}</span>
                           <span>{RESERVATION_STATUS[attraction.reservationStatus].label}</span>
                        </span>
                     )}
                  </div>
               )}

               {/* Conflitos - aviso discreto dentro do card */}
               {conflicts.length > 0 && (
                  <div className="space-y-2 mb-3">
                     {conflicts.map((conflict, index) => (
                        <div
                           key={index}
                           className={`
                    flex items-start gap-2 text-sm p-2.5 rounded-lg border
                    ${conflict.severity === 'error' ? 'bg-red-50/80 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200' : 'bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200'}
                  `}
                        >
                           <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                           <span className="font-medium">{conflict.message}</span>
                        </div>
                     ))}
                  </div>
               )}

               {/* Notes */}
               {attraction.notes && (
                  <div className="text-sm text-gray-700 dark:text-gray-300 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-600">
                     <span className="font-semibold">💡</span> {attraction.notes}
                  </div>
               )}
            </div>
         </div>
      </div>
   )
}