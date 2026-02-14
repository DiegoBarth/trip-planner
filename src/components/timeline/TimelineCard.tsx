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
      {/* Time indicator on the left */}
      <div className="absolute left-0 top-0 -translate-x-full pr-4 text-right">
        <div className="text-sm font-bold text-gray-900">{arrivalTime}</div>
        <div className="text-xs text-gray-500">{departureTime}</div>
      </div>

      {/* Timeline dot */}
      <div className="absolute left-0 top-6 w-4 h-4 rounded-full border-4 border-white bg-blue-500 shadow-lg z-10 -translate-x-1/2" />

      {/* Card */}
      <div
        className={`
          ml-6 p-4 rounded-lg border-2 shadow-md transition-all
          ${hasError ? 'border-red-500 bg-red-50' : ''}
          ${hasWarning && !hasError ? 'border-yellow-500 bg-yellow-50' : ''}
          ${!hasError && !hasWarning ? 'border-gray-200 bg-white hover:shadow-lg' : ''}
        `}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-600 text-white text-xl flex-shrink-0">
            {typeConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
              {attraction.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {attraction.city}
                {attraction.region && ` - ${attraction.region}`}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {duration}min
              </span>
            </div>
          </div>

          {/* Status badge */}
          {attraction.visited && (
            <div className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Visitado
            </div>
          )}
        </div>

        {/* Opening hours */}
        {attraction.openingTime && attraction.closingTime && (
          <div className="text-xs text-gray-600 mb-2">
            🕐 Funcionamento: {attraction.openingTime} - {attraction.closingTime}
          </div>
        )}

        {/* Conflicts */}
        {conflicts.length > 0 && (
          <div className="mt-2 space-y-1">
            {conflicts.map((conflict, index) => (
              <div
                key={index}
                className={`
                  flex items-start gap-2 text-sm p-2 rounded
                  ${conflict.severity === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
                `}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{conflict.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        {attraction.notes && (
          <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
            💡 {attraction.notes}
          </div>
        )}
      </div>
    </div>
  )
}
