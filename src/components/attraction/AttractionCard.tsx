import { MapPin, Clock, Banknote, CheckCircle2, Trash2, Map, AlertTriangle } from 'lucide-react'
import type { Attraction } from '@/types/Attraction'
import { ATTRACTION_TYPES, PERIODS, RESERVATION_STATUS } from '@/config/constants'
import { formatCurrency, formatTime, formatDuration } from '@/utils/formatters'

interface AttractionCardProps {
   attraction: Attraction
   onCheckVisited?: (id: number) => void
   onDelete?: (id: number) => void
   onClick?: () => void
}

export function AttractionCard({ attraction, onCheckVisited, onDelete, onClick }: AttractionCardProps) {
   const attractionType = ATTRACTION_TYPES[attraction.type]

   if (!attractionType) {
      console.error(`Invalid attraction type: ${attraction.type}`)
      return null
   }

   const isClosedOnVisitDay =
      attraction.closedDays &&
      attraction.dayOfWeek &&
      attraction.closedDays.split(',').map(d => d.trim()).includes(attraction.dayOfWeek)

   const borderClass = isClosedOnVisitDay
      ? 'border-l-red-500'
      : attraction.visited
         ? 'border-l-green-500'
         : 'border-l-blue-500'
   const bgClass = isClosedOnVisitDay
      ? 'bg-red-50'
      : attraction.visited
         ? 'bg-green-50/60'
         : 'bg-white'

   return (
      <div
         className={`
        relative rounded-2xl shadow-md overflow-hidden transition-all cursor-pointer border-l-4
        hover:shadow-lg active:scale-[0.99]
        ${borderClass} ${bgClass}
      `}
         onClick={onClick}
      >

         {attraction.imageUrl ? (
            <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${attraction.imageUrl})` }} />
         ) : (
            <div className="h-28 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
               <span className="text-5xl">{attractionType.icon}</span>
            </div>
         )}

         <div className="p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-xs font-medium text-gray-500">#{attraction.order}</span>
                     <h3 className="font-bold text-base leading-tight text-gray-900 truncate">{attraction.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                     <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                     <span className="truncate">{attraction.region ? `${attraction.region}, ` : ''}{attraction.city}</span>
                  </div>
               </div>

               <div className="flex gap-1 flex-shrink-0">
                  {onDelete && (
                     <button
                        onClick={(e) => {
                           e.stopPropagation()
                           onDelete(attraction.id)
                        }}
                        className="p-2 rounded-xl transition-all text-gray-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Excluir"
                     >
                        <Trash2 className="w-4 h-4" />
                     </button>
                  )}
                  <button
                     onClick={(e) => {
                        e.stopPropagation()
                        onCheckVisited?.(attraction.id)
                     }}
                     className={`p-2 rounded-xl transition-all ${attraction.visited
                        ? 'bg-green-100 text-green-600'
                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                        }`}
                     aria-label={attraction.visited ? 'Marcar como não visitado' : 'Marcar como visitado'}
                  >
                     <CheckCircle2 className="w-4 h-4" />
                  </button>
               </div>
            </div>

            <div className="space-y-1.5">
               <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span>
                     {attraction.openingTime
                        ? `${formatTime(attraction.openingTime)}${attraction.closingTime ? ` – ${formatTime(attraction.closingTime)}` : ''}`
                        : '24h'
                     }
                     {attraction.duration ? ` · ${formatDuration(attraction.duration)}` : ''}
                  </span>
               </div>

               <div className="flex items-center gap-2 text-sm">
                  <Banknote className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  {attraction.couplePrice ? (
                     <>
                        <span className="font-semibold text-green-600">
                           {formatCurrency(attraction.couplePrice, attraction.currency)}
                        </span>
                        <span className="text-gray-500 text-xs">({formatCurrency(attraction.priceInBRL)})</span>
                     </>
                  ) : (
                     <span className="font-semibold text-green-600">Gratuito</span>
                  )}
               </div>

               <div className="flex flex-wrap gap-1.5 mt-2">
                  {isClosedOnVisitDay && (
                     <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-md font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Fechado neste dia
                     </span>
                  )}
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-md font-medium">
                     {attractionType.label}
                  </span>
                  {attraction.needsReservation && attraction.reservationStatus && (
                     <span className={`px-2 py-0.5 text-xs rounded-md font-medium flex items-center gap-1 ${
                        attraction.reservationStatus === 'confirmed' ? 'bg-green-100 text-green-700' :
                        attraction.reservationStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                        attraction.reservationStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                     }`}>
                        {RESERVATION_STATUS[attraction.reservationStatus].icon} {RESERVATION_STATUS[attraction.reservationStatus].label}
                     </span>
                  )}
                  {attraction.idealPeriod && (
                     <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                        {PERIODS[attraction.idealPeriod].label}
                     </span>
                  )}
               </div>
            </div>
         </div>

         {(attraction.location || (attraction.lat && attraction.lng)) && (
            <a
               href={attraction.location || `https://www.google.com/maps/search/?api=1&query=${attraction.lat},${attraction.lng}`}
               target="_blank"
               rel="noopener noreferrer"
               onClick={(e) => e.stopPropagation()}
               className="absolute bottom-3 right-3 p-2 rounded-xl bg-blue-500 text-white shadow-md hover:bg-blue-600 transition-colors"
               title="Abrir no mapa"
               aria-label="Abrir no mapa"
            >
               <Map className="w-4 h-4" />
            </a>
         )}

      </div>
   )
}
