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
    <div className="relative flex items-center py-3">
      {/* Vertical line */}
      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-blue-300" />

      {/* Travel info */}
      <div className="ml-6 flex items-center gap-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2 text-blue-700">
          {getTravelIcon()}
          <span className="text-sm font-medium">{getTravelModeLabel()}</span>
        </div>

        <div className="h-4 w-px bg-blue-300" />

        <div className="flex items-center gap-2 text-sm text-blue-700">
          <Clock className="w-4 h-4" />
          <span className="font-semibold">{segment.durationMinutes}min</span>
        </div>

        <div className="h-4 w-px bg-blue-300" />

        <div className="text-sm text-blue-700">
          <span className="font-semibold">{segment.distanceKm.toFixed(1)}</span> km
        </div>
      </div>
    </div>
  )
}
