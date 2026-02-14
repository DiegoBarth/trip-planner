import { useEffect, useState } from 'react'
import { Calendar, MapPin, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import type { TimelineDay } from '@/types/Timeline'
import type { Attraction } from '@/types/Attraction'
import { buildDayTimeline, calculateArrivalTime } from '@/services/timelineService'
import { TimelineCard } from './TimelineCard'
import { TimelineSegment } from './TimelineSegment'
import { WeatherBadge } from './WeatherBadge'
import { formatDate, dateToInputFormat } from '@/utils/formatters'
import { useWeather } from '@/hooks/useWeather'
import { getWeatherForDate } from '@/services/weatherService'

interface TimelineProps {
  attractions: Attraction[]
}

export function Timeline({ attractions }: TimelineProps) {
  const [timeline, setTimeline] = useState<TimelineDay | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Get city from first attraction for weather (always call hook, even with empty string)
  const city = attractions[0]?.city || ''
  const { forecast } = useWeather(city)

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

  // Get weather for the timeline date (always calculate, even if timeline is null)
  const weather = timeline ? getWeatherForDate(forecast, dateToInputFormat(timeline.date)) : null

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
      {/* Weather badge */}
      {weather && (
        <WeatherBadge weather={weather} />
      )}

      {/* Day header */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-2xl p-5 md:p-6 shadow-lg">
        <div className="space-y-4">
          {/* Date and Time */}
          <div>
            <div className="text-sm font-medium opacity-90 mb-1">Dia {timeline.dayNumber}</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 capitalize">{formatDate(timeline.date)}</h2>
            <div className="flex items-center gap-2 text-base md:text-lg opacity-90">
              <Clock className="w-5 h-5" />
              <span className="font-semibold">{timeline.startTime}</span>
              <span>→</span>
              <span className="font-semibold">{timeline.endTime}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="flex items-center gap-6 pt-4 border-t border-white/20 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 md:w-6 md:h-6" />
              <div>
                <div className="font-bold text-lg md:text-xl">{timeline.attractions.length}</div>
                <div className="text-xs opacity-75">locais</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
              <div>
                <div className="font-bold text-lg md:text-xl">{timeline.totalDistance.toFixed(1)} km</div>
                <div className="text-xs opacity-75">distância</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 md:w-6 md:h-6" />
              <div>
                <div className="font-bold text-lg md:text-xl">{timeline.totalTravelTime}min</div>
                <div className="text-xs opacity-75">viagem</div>
              </div>
            </div>
          </div>

          {/* Conflicts summary */}
          {timeline.conflicts.length > 0 && (
            <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-base">
                  {timeline.conflicts.length} {timeline.conflicts.length === 1 ? 'conflito detectado' : 'conflitos detectados'}
                </div>
                <div className="text-sm opacity-90 mt-1">
                  Verifique os avisos abaixo
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-3 md:pl-6">
        {/* Vertical line background */}
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-blue-300 to-blue-400" />

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
