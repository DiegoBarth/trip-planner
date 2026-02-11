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

   return (
      <div
         className={`
        relative rounded-lg shadow-md overflow-hidden transition-all cursor-pointer border-l-4
        active:scale-[1.02] active:shadow-xl
        ${isClosedOnVisitDay
               ? 'bg-red-50 hover:shadow-lg border-l-red-500'
               : 'bg-white hover:shadow-lg border-l-blue-500'
            }
        ${attraction.visited ? 'scale-[0.97]' : ''}
      `}
         onClick={onClick}
      >

         {attraction.imageUrl ? (
            <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${attraction.imageUrl})` }} />
         ) : (
            <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
               <span className="text-6xl">{attractionType.icon}</span>
            </div>
         )}

         <div className="p-4">
            <div className="flex items-start justify-between mb-2">
               <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-sm font-medium text-gray-500">#{attraction.order}</span>
                     <h3 className="font-bold text-lg leading-tight text-gray-900">{attraction.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                     <MapPin className="w-4 h-4" />
                     <span>{attraction.region ? `${attraction.region}, ` : ''}{attraction.city}</span>
                  </div>
               </div>

               <div className="flex gap-1">
                  {onDelete && (
                     <button
                        onClick={(e) => {
                           e.stopPropagation()
                           onDelete(attraction.id)
                        }}
                        className="p-2 rounded-full transition-all bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-600"
                     >
                        <Trash2 className="w-5 h-5" />
                     </button>
                  )}

                  <button
                     onClick={(e) => {
                        e.stopPropagation()
                        onCheckVisited?.(attraction.id)
                     }}
                     className={`p-2 rounded-full transition-all ${attraction.visited
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                  >
                     <CheckCircle2 className="w-5 h-5" />
                  </button>
               </div>
            </div>

            <div className="space-y-2">
               <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>
                     {attraction.openingTime
                        ? `${formatTime(attraction.openingTime)}${attraction.closingTime ? ` - ${formatTime(attraction.closingTime)}` : ''}`
                        : '24 horas'
                     }
                  </span>
                  {attraction.duration && (
                     <span className="text-gray-500">• {formatDuration(attraction.duration)}</span>
                  )}
               </div>

               {attraction.couplePrice ? (
                  <div className="flex items-center gap-2 text-sm">
                     <Banknote className="w-4 h-4 text-green-600" />
                     <span className="font-semibold text-green-600">
                        {formatCurrency(attraction.couplePrice, attraction.currency)}
                     </span>
                     <span className="text-gray-500">
                        ({formatCurrency(attraction.priceInBRL)})
                     </span>
                  </div>
               ) : (
                  <div className="flex items-center gap-2 text-sm">
                     <Banknote className="w-4 h-4 text-green-600" />
                     <span className="font-semibold text-green-600">Gratuito</span>
                  </div>
               )}

               <div className="flex flex-wrap gap-2 mt-2">
                  {isClosedOnVisitDay && (
                     <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Fechado neste dia
                     </span>
                  )}
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                     {attractionType.label}
                  </span>
                  {attraction.needsReservation && attraction.reservationStatus && (
                     <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                        attraction.reservationStatus === 'confirmed' ? 'bg-green-100 text-green-700' :
                        attraction.reservationStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                        attraction.reservationStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                     }`}>
                        <span>{RESERVATION_STATUS[attraction.reservationStatus].icon}</span>
                        <span>{RESERVATION_STATUS[attraction.reservationStatus].label}</span>
                     </span>
                  )}
                  {attraction.idealPeriod && (
                     <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {PERIODS[attraction.idealPeriod].label}
                     </span>
                  )}
               </div>
            </div>
         </div>

         {attraction.location && (
            <a
               href={attraction.location}
               target="_blank"
               rel="noopener noreferrer"
               onClick={(e) => e.stopPropagation()}
               className="absolute bottom-3 right-3 p-2 rounded-full bg-blue-400 text-white shadow-md hover:bg-blue-700 transition-all"
               title="Abrir no mapa"
            >
               <Map className="w-5 h-5" />
            </a>
         )}

      </div>
   )
}
