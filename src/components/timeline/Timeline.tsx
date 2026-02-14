import { useEffect, useState } from 'react'
import { Calendar, MapPin, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import type { TimelineDay } from '@/types/Timeline'
import type { Attraction } from '@/types/Attraction'
import { buildDayTimeline, calculateArrivalTime } from '@/services/timelineService'
import { TimelineCard } from './TimelineCard'
import { TimelineSegment } from './TimelineSegment'
import { formatDate } from '@/utils/formatters'

interface TimelineProps {
  attractions: Attraction[]
}

export function Timeline({ attractions }: TimelineProps) {
  const [timeline, setTimeline] = useState<TimelineDay | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function loadTimeline() {
      setIsLoading(true)
      try {
        if (attractions.length === 0) {
          setTimeline(null)
          return
        }

        const dayTimeline = await buildDayTimeline(attractions)
        setTimeline(dayTimeline)
      } catch (error) {
        console.error('Error loading timeline:', error)
        setTimeline(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadTimeline()
  }, [attractions])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!timeline) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">Nenhuma atração para mostrar na timeline</p>
        <p className="text-sm text-gray-500 mt-1">
          Adicione atrações com coordenadas para visualizar o roteiro
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Day header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium opacity-90">Dia {timeline.dayNumber}</div>
            <h2 className="text-2xl font-bold capitalize">{formatDate(timeline.date)}</h2>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Horário</div>
            <div className="text-xl font-bold">{timeline.startTime} - {timeline.endTime}</div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            <div>
              <div className="text-xs opacity-75">Locais</div>
              <div className="font-bold">{timeline.attractions.length}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <div>
              <div className="text-xs opacity-75">Distância</div>
              <div className="font-bold">{timeline.totalDistance.toFixed(1)} km</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <div>
              <div className="text-xs opacity-75">Deslocamento</div>
              <div className="font-bold">{timeline.totalTravelTime}min</div>
            </div>
          </div>
        </div>

        {/* Conflicts summary */}
        {timeline.conflicts.length > 0 && (
          <div className="mt-4 bg-white/10 backdrop-blur rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm">
                {timeline.conflicts.length} {timeline.conflicts.length === 1 ? 'conflito detectado' : 'conflitos detectados'}
              </div>
              <div className="text-xs opacity-90">
                Verifique os avisos nos cards abaixo
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="relative pl-20">
        {/* Vertical line background */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-blue-300 to-blue-500" />

        {timeline.attractions.map((attraction, index) => {
          const segment = timeline.segments[index]
          const attractionConflicts = timeline.conflicts.filter(
            c => c.attractionId === attraction.id
          )
          
          const arrivalTime = calculateArrivalTime(
            timeline.attractions,
            timeline.segments,
            index,
            timeline.startTime
          )
          
          // Calculate departure time (arrival + duration)
          const duration = attraction.duration || 60
          const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number)
          const departureMinutes = arrHours * 60 + arrMinutes + duration
          const departureTime = `${Math.floor(departureMinutes / 60).toString().padStart(2, '0')}:${(departureMinutes % 60).toString().padStart(2, '0')}`

          return (
            <div key={attraction.id}>
              <TimelineCard
                attraction={attraction}
                arrivalTime={arrivalTime}
                departureTime={departureTime}
                duration={duration}
                conflicts={attractionConflicts}
              />
              {segment && <TimelineSegment segment={segment} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
