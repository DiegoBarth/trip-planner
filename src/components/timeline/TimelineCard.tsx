import { MapPin, Clock, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react'
import type { Attraction } from '@/types/Attraction'
import type { TimelineConflict } from '@/types/Timeline'
import { ATTRACTION_TYPES, RESERVATION_STATUS } from '@/config/constants'

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

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div className={`
        absolute left-0 top-6 w-5 h-5 md:w-4 md:h-4 rounded-full border-4 border-white shadow-lg z-10 -translate-x-1/2 transition-colors
        ${isVisited ? 'bg-green-500' : 'bg-blue-500'}
      `} />

      {/* Card - Similar to AttractionCard */}
      <div
        className={`
          ml-4 md:ml-6 rounded-2xl shadow-md overflow-hidden transition-all border-l-4
          ${hasError ? 'border-l-red-500 bg-red-50' : ''}
          ${hasWarning && !hasError ? 'border-l-yellow-500 bg-yellow-50' : ''}
          ${isVisited && !hasError && !hasWarning ? 'border-l-green-500 bg-green-50' : ''}
          ${!hasError && !hasWarning && !isVisited ? 'border-l-blue-500 bg-white' : ''}
          ${isVisited ? 'opacity-75' : ''}
        `}
      >
        {/* Header with image/gradient - Compact */}
        {attraction.imageUrl ? (
          <div className="h-16 bg-cover bg-center" style={{ backgroundImage: `url(${attraction.imageUrl})` }} />
        ) : (
          <div className="h-16 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
            <span className="text-4xl">{typeConfig.icon}</span>
          </div>
        )}

        <div className="p-3">
          {/* Times - Compact */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
            <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="flex items-center gap-2 text-sm flex-1">
              <span className="font-bold text-gray-900">{arrivalTime}</span>
              <span className="text-gray-400">→</span>
              <span className="font-bold text-gray-900">{departureTime}</span>
              <span className="text-xs text-gray-500">({duration}min)</span>
            </div>
            
            {/* Maps button - Show if has location */}
            {hasLocation && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  openInMaps(attraction.lat!, attraction.lng!, attraction.name)
                }}
                className="p-1.5 rounded-full transition-all flex-shrink-0 bg-blue-100 text-blue-600 hover:bg-blue-200"
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
                  ${isVisited
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }
                `}
                title={isVisited ? 'Marcar como não visitado' : 'Marcar como visitado'}
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Main info - Compact */}
          <div className="mb-2">
            <h3 className="text-base font-bold text-gray-900 mb-1.5 line-clamp-2">
              {attraction.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{attraction.city}</span>
              {attraction.region && <span className="text-gray-400 text-xs">• {attraction.region}</span>}
            </div>
          </div>

          {/* Tags - Only essential ones */}
          {attraction.needsReservation && attraction.reservationStatus && (
            <div className="mb-2">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full font-medium ${
                attraction.reservationStatus === 'confirmed' ? 'bg-green-100 text-green-700' :
                attraction.reservationStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
                attraction.reservationStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                <span>{RESERVATION_STATUS[attraction.reservationStatus].icon}</span>
                <span>{RESERVATION_STATUS[attraction.reservationStatus].label}</span>
              </span>
            </div>
          )}

          {/* Conflicts */}
          {conflicts.length > 0 && (
            <div className="space-y-2 mb-3">
              {conflicts.map((conflict, index) => (
                <div
                  key={index}
                  className={`
                    flex items-start gap-2 text-sm p-3 rounded-xl
                    ${conflict.severity === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
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
            <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded-xl border border-blue-200">
              <span className="font-semibold">💡</span> {attraction.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
