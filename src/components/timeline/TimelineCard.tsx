import { MapPin, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import type { Attraction } from '@/types/Attraction'
import type { TimelineConflict } from '@/types/Timeline'
import { ATTRACTION_TYPES } from '@/config/constants'

interface TimelineCardProps {
  attraction: Attraction
  arrivalTime: string
  departureTime: string
  duration: number
  conflicts: TimelineConflict[]
}

export function TimelineCard({
  attraction,
  arrivalTime,
  departureTime,
  duration,
  conflicts
}: TimelineCardProps) {
  const typeConfig = ATTRACTION_TYPES[attraction.type]
  const hasError = conflicts.some(c => c.severity === 'error')
  const hasWarning = conflicts.some(c => c.severity === 'warning')

  return (
    <div className="relative">
      {/* Timeline dot */}
      <div className="absolute left-0 top-8 w-5 h-5 md:w-4 md:h-4 rounded-full border-4 border-white bg-blue-500 shadow-lg z-10 -translate-x-1/2" />

      {/* Card */}
      <div
        className={`
          ml-4 md:ml-6 p-4 md:p-5 rounded-2xl border-2 shadow-sm transition-all
          ${hasError ? 'border-red-500 bg-red-50' : ''}
          ${hasWarning && !hasError ? 'border-yellow-500 bg-yellow-50' : ''}
          ${!hasError && !hasWarning ? 'border-gray-200 bg-white' : ''}
        `}
      >
        {/* Times */}
        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2 text-blue-600">
            <Clock className="w-5 h-5" />
            <div>
              <div className="text-base md:text-lg font-bold">{arrivalTime}</div>
              <div className="text-xs text-gray-500">Chegada</div>
            </div>
          </div>
          <div className="text-gray-400">→</div>
          <div>
            <div className="text-base md:text-lg font-bold text-gray-900">{departureTime}</div>
            <div className="text-xs text-gray-500">Saída</div>
          </div>
          {attraction.visited && (
            <CheckCircle2 className="w-5 h-5 text-green-600 ml-auto" />
          )}
        </div>

        {/* Main Content */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center bg-blue-600 text-white text-2xl flex-shrink-0 shadow-md">
            {typeConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
              {attraction.name}
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span className="font-medium">{attraction.city}</span>
                {attraction.region && <span className="text-gray-400">• {attraction.region}</span>}
              </div>
              <div className="flex items-center gap-2 text-sm md:text-base text-gray-600">
                <Clock className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span><span className="font-semibold">{duration}</span> minutos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Opening hours */}
        {attraction.openingTime && attraction.closingTime && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600 flex items-center gap-2">
            <span>🕐</span>
            <span>Abre: <span className="font-semibold">{attraction.openingTime}</span></span>
            <span className="text-gray-400">•</span>
            <span>Fecha: <span className="font-semibold">{attraction.closingTime}</span></span>
          </div>
        )}

        {/* Conflicts */}
        {conflicts.length > 0 && (
          <div className="mt-3 space-y-2">
            {conflicts.map((conflict, index) => (
              <div
                key={index}
                className={`
                  flex items-start gap-2 text-sm p-3 rounded-xl
                  ${conflict.severity === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
                `}
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{conflict.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {attraction.notes && (
          <div className="mt-3 text-sm text-gray-700 bg-blue-50 p-3 rounded-xl border border-blue-200">
            <span className="font-semibold">💡 Nota:</span> {attraction.notes}
          </div>
        )}
      </div>
    </div>
  )
}
