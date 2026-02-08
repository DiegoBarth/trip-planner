import { MapPin, Clock, Banknote, CheckCircle2 } from 'lucide-react'
import type { Attraction } from '@/types/Attraction'
import { ATTRACTION_TYPES } from '@/config/constants'
import { formatCurrency, formatTime, formatDuration } from '@/utils/formatters'

interface AttractionCardProps {
  attraction: Attraction
  onCheckVisited?: (id: number) => void
  onClick?: () => void
}

export function AttractionCard({ attraction, onCheckVisited, onClick }: AttractionCardProps) {
  const attractionType = ATTRACTION_TYPES[attraction.type]
  
  if (!attractionType) {
    console.error(`Invalid attraction type: ${attraction.type}`)
    return null
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-blue-500"
      onClick={onClick}
    >
      {/* Image or placeholder */}
      {attraction.imageUrl ? (
        <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${attraction.imageUrl})` }} />
      ) : (
        <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          <span className="text-6xl">{attractionType.icon}</span>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-500">#{attraction.order}</span>
              <h3 className="font-bold text-lg leading-tight">{attraction.name}</h3>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{attraction.region ? `${attraction.region}, ` : ''}{attraction.city}</span>
            </div>
          </div>
          
          {/* Visited checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onCheckVisited?.(attraction.id)
            }}
            className={`p-2 rounded-full transition-all ${
              attraction.visited 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </button>
        </div>

        {/* Information */}
        <div className="space-y-2">
          {/* Schedule */}
          {attraction.openingTime && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>{formatTime(attraction.openingTime)}</span>
              {attraction.duration && (
                <span className="text-gray-500">• {formatDuration(attraction.duration)}</span>
              )}
            </div>
          )}

          {/* Value */}
          <div className="flex items-center gap-2 text-sm">
            <Banknote className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-600">
              {formatCurrency(attraction.couplePrice, attraction.currency)}
            </span>
            <span className="text-gray-500">
              ({formatCurrency(attraction.priceInBRL)})
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {attractionType.label}
            </span>
            {attraction.needsReservation && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                Reserva necessária
              </span>
            )}
            {attraction.idealPeriod && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {attraction.idealPeriod}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
