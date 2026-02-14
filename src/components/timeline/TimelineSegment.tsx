import { ArrowDown, Car, TrendingUp, Clock } from 'lucide-react'
import type { TimelineSegment as TimelineSegmentType } from '@/types/Timeline'

interface TimelineSegmentProps {
  segment: TimelineSegmentType
}

export function TimelineSegment({ segment }: TimelineSegmentProps) {
  const getTravelIcon = () => {
    switch (segment.travelMode) {
      case 'walking':
        return <TrendingUp className="w-4 h-4" />
      case 'driving':
        return <Car className="w-4 h-4" />
      case 'transit':
        return <Car className="w-4 h-4" />
      default:
        return <ArrowDown className="w-4 h-4" />
    }
  }

  const getTravelModeLabel = () => {
    switch (segment.travelMode) {
      case 'walking':
        return 'A pé'
      case 'driving':
        return 'Carro'
      case 'transit':
        return 'Transporte'
      default:
        return 'Deslocamento'
    }
  }

  return (
    <div className="relative flex items-center py-4 md:py-3">
      {/* Vertical line */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-blue-200" />

      {/* Travel info */}
      <div className="ml-4 md:ml-6 flex flex-col md:flex-row md:items-center gap-2 md:gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl w-full md:w-auto">
        <div className="flex items-center gap-2 text-blue-700">
          {getTravelIcon()}
          <span className="text-sm md:text-base font-semibold">{getTravelModeLabel()}</span>
        </div>

        <div className="hidden md:block h-5 w-px bg-blue-300" />

        <div className="flex items-center gap-4 md:gap-3">
          <div className="flex items-center gap-2 text-blue-700">
            <Clock className="w-5 h-5 md:w-4 md:h-4" />
            <span className="text-base md:text-sm">
              <span className="font-bold">{segment.durationMinutes}</span> min
            </span>
          </div>

          <div className="text-gray-300">•</div>

          <div className="text-base md:text-sm text-blue-700">
            <span className="font-bold">{segment.distanceKm.toFixed(1)}</span> km
          </div>
        </div>
      </div>
    </div>
  )
}
