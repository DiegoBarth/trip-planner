import { Calendar, MapPin, Clock, AlertCircle, TrendingUp } from 'lucide-react'
import type { TimelineDay } from '@/types/Timeline'
import { TimelineCard } from './TimelineCard'
import { TimelineSegment } from './TimelineSegment'
import { WeatherBadge } from './WeatherBadge'
import { formatDate, dateToInputFormat } from '@/utils/formatters'
import { useWeather } from '@/hooks/useWeather'
import { getWeatherForDate } from '@/services/weatherService'

interface TimelineProps {
   /** Timeline já construída pela página (uma requisição OSRM por dia). */
   timeline: TimelineDay | null
   /** Cidade do dia (para buscar clima mesmo antes da timeline carregar; obrigatório quando day='all'). */
   city?: string
   /** Data do dia no formato da atração (YYYY-MM-DD ou DD/MM/YYYY) para lookup do clima. */
   date?: string
   onToggleVisited?: (id: number) => void
}

export function Timeline({ timeline, city: cityProp, date: dateProp, onToggleVisited }: TimelineProps) {
   const city = cityProp ?? timeline?.attractions[0]?.city ?? ''
   const { forecast } = useWeather(city)
   const dateForWeather = dateProp ?? timeline?.date ?? ''
   const weather =
      dateForWeather && forecast.length > 0
         ? getWeatherForDate(forecast, dateToInputFormat(dateForWeather))
         : null

   if (!timeline) {
      return (
         <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">Nenhuma atração para mostrar na timeline</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
               Adicione atrações com coordenadas para visualizar o roteiro
            </p>
         </div>
      )
   }

   return (
      <div className="space-y-6">
         {/* Weather: exibe previsão da data do dia ou mensagem se fora da janela de 5 dias */}
         {dateForWeather && (
            weather ? (
               <WeatherBadge weather={weather} />
            ) : (
               <div className="rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-4 text-amber-800 dark:text-amber-200 text-sm">
                  Clima não disponível para esta data. A previsão cobre apenas os próximos 5 dias.
               </div>
            )
         )}

         {/* Day header - neutro para não competir com o restante */}
         <div className="bg-gradient-to-br from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800 text-white rounded-2xl p-5 md:p-6 shadow-lg">
            <div className="space-y-4">
               {/* Date and Time */}
               <div className='flex items-center justify-between'>
                  <div className="text-sm font-medium opacity-90 mb-1">Dia {timeline.dayNumber}</div>
                  <h2 className="text-lg md:text-3xl font-bold mb-2 capitalize">{formatDate(timeline.date)}</h2>
               </div>
               <div className="flex items-center gap-2 text-base md:text-lg opacity-90">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">{timeline.startTime}</span>
                  <span>→</span>
                  <span className="font-semibold">{timeline.endTime}</span>
               </div>

               {/* Summary */}
               <div className="flex items-center gap-6 pt-4 border-t border-white/20 text-sm md:text-base">
                  <div className="flex items-center gap-2">
                     <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                     <div>
                        <div className="font-bold text-md:text-xl">{timeline.attractions.length}</div>
                        <div className="text-xs opacity-75">locais</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <TrendingUp className="w-5 h-5 md:w-6 md:h-6" />
                     <div>
                        <div className="font-bold text-md md:text-xl">{timeline.totalDistance.toFixed(1)} km</div>
                        <div className="text-xs opacity-75">distância</div>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                     <Clock className="w-5 h-5 md:w-6 md:h-6" />
                     <div>
                        <div className="font-bold text-md md:text-xl">{timeline.totalTravelTime}min</div>
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

         {/* Timeline - linha contínua à esquerda, itens com espaçamento */}
         <div className="relative pl-3 md:pl-6 pt-2">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 rounded-full" aria-hidden />

            <div className="space-y-6">
               {timeline.attractions.map((attraction, index) => {
                  const segment = index > 0 ? timeline.segments[index - 1] : null
                  const attractionConflicts = timeline.conflicts.filter(
                     c => c.attractionId === attraction.id
                  )
                  const arrivalTime = (attraction as any).arrivalTime || timeline.startTime
                  const departureTime = (attraction as any).departureTime || timeline.startTime
                  const duration = attraction.duration || 60

                  return (
                     <div key={attraction.id} className="relative">
                        {segment && <TimelineSegment segment={segment} />}
                        <TimelineCard
                           attraction={attraction}
                           arrivalTime={arrivalTime}
                           departureTime={departureTime}
                           duration={duration}
                           conflicts={attractionConflicts}
                           onToggleVisited={onToggleVisited}
                        />
                     </div>
                  )
               })}
            </div>
         </div>
      </div>
   )
}
