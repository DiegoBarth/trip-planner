import { ArrowDown, Car, TrendingUp, Clock } from 'lucide-react'
import type { TimelineSegment as TimelineSegmentType } from '@/types/Timeline'

interface TimelineSegmentProps {
  segment: TimelineSegmentType
}

export function TimelineSegment({ segment }: TimelineSegmentProps) {
  const getTravelIcon = () => {
    switch (segment.travelMode) {
      case 'walking':
        return <TrendingUp className="w-4 h-4" />;
      case 'driving':
        return <Car className="w-4 h-4" />;
      case 'transit':
        return <Car className="w-4 h-4" />;
      default:
        return <ArrowDown className="w-4 h-4" />;
    }
  };

  const getTravelModeLabel = () => {
    switch (segment.travelMode) {
      case 'walking':
        return 'A pé';
      case 'driving':
        return 'Carro';
      case 'transit':
        return 'Transporte';
      default:
        return 'Deslocamento';
    }
  };

  return (
    <div className="relative flex items-center pb-6">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 z-10 -translate-x-1/2" aria-hidden />

      <div className="ml-4 md:ml-6 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 px-4 py-3 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full md:w-auto">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
          <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {getTravelIcon()}
          </span>
          <span className="text-sm md:text-base font-semibold">{getTravelModeLabel()}</span>
        </div>

        <div className="hidden md:block h-5 w-px bg-gray-200 dark:bg-gray-600" />

        <div className="flex items-center gap-3 md:gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            <span className="font-semibold text-gray-900 dark:text-gray-100">{segment.durationMinutes}</span>
            <span>min</span>
          </div>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-300">
            <span className="font-semibold text-gray-900 dark:text-gray-100">{segment.distanceKm.toFixed(1)}</span>
            <span>km</span>
          </div>
        </div>
      </div>
    </div>
  );
}