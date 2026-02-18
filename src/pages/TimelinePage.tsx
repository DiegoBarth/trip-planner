import { useMemo, useState, useEffect } from 'react'
import { Calendar, CloudSun, FileDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAttraction } from '@/hooks/useAttraction'
import { Timeline } from '@/components/timeline/Timeline'
import { useCountry } from '@/contexts/CountryContext'
import { useOSRMRoutesQuery } from '@/hooks/useOSRMRoutesQuery'
import { PageHeader } from '@/components/ui/PageHeader'
import { CountryFilter } from '@/components/home/CountryFilter'
import { useToast } from '@/contexts/toast'
import { buildDayTimeline } from '@/services/timelineService'
import { exportTimelineToPDF } from '@/utils/exportTimelineToPDF'
import type { Attraction, Country } from '@/types/Attraction'
import type { Accommodation } from '@/types/Accommodation'
import type { TimelineDay } from '@/types/Timeline'

function addAccommodationToDay(
   dayAttractions: Attraction[],
   accommodations: Accommodation[]
): Attraction[] {
   if (dayAttractions.length === 0 || accommodations.length === 0) return dayAttractions
   const city = dayAttractions[0].city
   const acc = accommodations.find(a => a.city === city)
   if (!acc?.lat || !acc?.lng) return dayAttractions
   const accAttraction: Attraction = {
      id: -999,
      name: acc.description,
      lat: acc.lat,
      lng: acc.lng,
      city: acc.city,
      region: dayAttractions[0].region,
      country: acc.country as Country,
      order: 0,
      date: dayAttractions[0].date,
      day: dayAttractions[0].day,
      dayOfWeek: dayAttractions[0].dayOfWeek,
      type: 'other',
      duration: 0,
      couplePrice: 0,
      priceInBRL: 0,
      currency: dayAttractions[0].currency,
      visited: false,
      needsReservation: false,
      openingTime: undefined,
      closingTime: undefined,
      imageUrl: undefined,
   }
   return [accAttraction, ...dayAttractions]
}

export function TimelinePage() {
   const { country, day, accommodations, attractions, isReady } = useCountry()
   const { toggleVisited } = useAttraction(country)

   const groupedByDayForRoutes = useMemo(() => {
      const grouped: Record<number, Attraction[]> = {}
      attractions
         .filter(a => a.lat != null && a.lng != null)
         .forEach(a => {
            if (!grouped[a.day]) grouped[a.day] = []
            grouped[a.day].push(a)
         })
      return grouped
   }, [attractions])

   const { segmentsByDay, isRoutesLoading } = useOSRMRoutesQuery(
      groupedByDayForRoutes,
      accommodations
   )
   const { success, error } = useToast()
   const [isExporting, setIsExporting] = useState(false)

   const handleToggleVisited = async (id: number) => {
      try {
         await toggleVisited(id)
         success('Status da atração atualizado')
      } catch (err) {
         error('Erro ao atualizar atração')
         console.error(err)
      }
   }

   const mappableAttractions = useMemo(
      () => attractions.filter(a => a.lat && a.lng),
      [attractions]
   )

   const timelineAttractions = useMemo(() => {
      if (mappableAttractions.length === 0) return []
      if (day === 'all') return []
      let filtered = mappableAttractions.filter(a => a.day === day)
      return addAccommodationToDay(filtered, accommodations)
   }, [mappableAttractions, day, accommodations])

   const dayGroups = useMemo(() => {
      if (day !== 'all' || mappableAttractions.length === 0) return []
      const byDay: Record<number, Attraction[]> = {}
      mappableAttractions.forEach(a => {
         if (!byDay[a.day]) byDay[a.day] = []
         byDay[a.day].push(a)
      })
      const sortedDays = Object.keys(byDay)
         .map(Number)
         .sort((a, b) => a - b)
      return sortedDays.map(dayNum => {
         const arr = byDay[dayNum]
         const withAcc = addAccommodationToDay(arr, accommodations)
         return { day: dayNum, date: arr[0].date, attractions: withAcc }
      })
   }, [day, mappableAttractions, accommodations])

   const dayLabel = useMemo(() => {
      if (day === 'all') {
         if (dayGroups.length === 0) return 'Todos os dias'
         return `${dayGroups.length} ${dayGroups.length === 1 ? 'dia' : 'dias'}`
      }
      if (timelineAttractions.length === 0) return ''
      return `Dia ${day}`
   }, [day, dayGroups.length, timelineAttractions.length])

   const canExport = day === 'all' ? dayGroups.length > 0 : timelineAttractions.length > 0

   // Chave estável para evitar requisições duplicadas: só refaz quando o conjunto de dias/atrações muda
   const timelineBuildKey = useMemo(() => {
      if (day === 'all') {
         return JSON.stringify(dayGroups.map((g) => ({ day: g.day, ids: g.attractions.map((a) => a.id) })))
      }
      return JSON.stringify(timelineAttractions.map((a) => a.id))
   }, [day, dayGroups, timelineAttractions])

   const [singleTimeline, setSingleTimeline] = useState<TimelineDay | null>(null)
   const [dayTimelines, setDayTimelines] = useState<(TimelineDay | null)[]>([])
   const [isTimelineLoading, setIsTimelineLoading] = useState(false)

   useEffect(() => {
      if (isRoutesLoading) {
         return
      }
      if (day !== 'all') {
         if (timelineAttractions.length === 0) {
            setSingleTimeline(null)
            setIsTimelineLoading(false)
            return
         }
         let cancelled = false
         setIsTimelineLoading(true)
         setDayTimelines([])
         const cached = segmentsByDay[Number(day)]
         const precomputed =
            cached && cached.length === timelineAttractions.length - 1 ? cached : undefined
         buildDayTimeline(timelineAttractions, precomputed)
            .then((t) => {
               if (!cancelled) setSingleTimeline(t)
            })
            .finally(() => {
               if (!cancelled) setIsTimelineLoading(false)
            })
         return () => {
            cancelled = true
         }
      }
      if (dayGroups.length === 0) {
         setDayTimelines([])
         setSingleTimeline(null)
         setIsTimelineLoading(false)
         return
      }
      let cancelled = false
      setIsTimelineLoading(true)
      setSingleTimeline(null)
      Promise.all(
         dayGroups.map((g) => {
            const cached = segmentsByDay[g.day]
            const precomputed = cached && cached.length === g.attractions.length - 1 ? cached : undefined
            return buildDayTimeline(g.attractions, precomputed)
         })
      )
         .then((results) => {
            if (!cancelled) setDayTimelines(results)
         })
         .finally(() => {
            if (!cancelled) setIsTimelineLoading(false)
         })
      return () => {
         cancelled = true
      }
   }, [timelineBuildKey, segmentsByDay, isRoutesLoading])

   const handleExportPDF = async () => {
      if (!canExport) return
      setIsExporting(true)
      try {
         if (day === 'all') {
            const timelineDays =
               dayTimelines.length === dayGroups.length
                  ? dayTimelines
                  : await Promise.all(
                       dayGroups.map((g) => {
                          const cached = segmentsByDay[g.day]
                          const precomputed =
                             cached && cached.length === g.attractions.length - 1 ? cached : undefined
                          return buildDayTimeline(g.attractions, precomputed)
                       })
                    )
            const valid = timelineDays.filter((d): d is NonNullable<typeof d> => d != null)
            if (valid.length > 0) {
               exportTimelineToPDF(valid)
               success('PDF exportado com sucesso!')
            } else {
               error('Nenhuma timeline gerada para exportar')
            }
         } else {
            const cached = segmentsByDay[Number(day)]
            const precomputed =
               cached && cached.length === timelineAttractions.length - 1 ? cached : undefined
            const single =
               singleTimeline ?? (await buildDayTimeline(timelineAttractions, precomputed))
            if (single) {
               exportTimelineToPDF([single])
               success('PDF exportado com sucesso!')
            } else {
               error('Nenhuma timeline gerada para exportar')
            }
         }
      } catch (err) {
         console.error(err)
         error('Erro ao exportar PDF')
      } finally {
         setIsExporting(false)
      }
   }

   if (!isReady) {
      return (
         <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
         </div>
      )
   }

   return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
         <PageHeader
            title="Timeline"
            subtitle={`${dayLabel} - Visualize seu dia com rotas e clima`}
            filter={<CountryFilter />}
            action={
               canExport ? (
                  <button
                     type="button"
                     onClick={handleExportPDF}
                     disabled={isExporting}
                     className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                     title="Exportar timeline em PDF"
                  >
                     <FileDown className="w-4 h-4" />
                     {isExporting ? 'Exportando…' : 'Exportar PDF'}
                  </button>
               ) : undefined
            }
         />

         {/* Main content */}
         <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
            {/* Weather info banner */}
            {!import.meta.env.VITE_OPENWEATHER_API_KEY && (
               <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded-lg">
                  <div className="flex items-start gap-3">
                     <CloudSun className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                     <div className="flex-1">
                        <h3 className="text-sm font-semibold text-blue-900 mb-1">
                           🌤️ Clima Integrado Disponível
                        </h3>
                        <p className="text-sm text-blue-800">
                           Configure sua chave da API OpenWeather no arquivo <code className="bg-blue-100 px-1 rounded">.env</code> para
                           ver previsões do tempo integradas à timeline. É grátis!
                           <a
                              href="https://openweathermap.org/api"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline hover:text-blue-600 ml-1"
                           >
                              Obtenha sua chave aqui
                           </a>
                        </p>
                     </div>
                  </div>
               </div>
            )}

            {(day === 'all' ? dayGroups.length === 0 : timelineAttractions.length === 0) ? (
               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                     {day === 'all' ? 'Nenhuma atração com coordenadas' : `Nenhuma atração para o Dia ${day}`}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                     {day === 'all'
                        ? 'Adicione coordenadas (lat/lng) às suas atrações para visualizar as timelines por dia'
                        : 'Adicione coordenadas (lat/lng) às suas atrações para visualizar a timeline'
                     }
                  </p>
                  <Link
                     to="/attractions"
                     className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                     Ir para Atrações
                  </Link>
               </div>
            ) : isRoutesLoading ? (
               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Carregando rotas em segundo plano...</p>
               </div>
            ) : isTimelineLoading ? (
               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 flex items-center justify-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-200 dark:border-gray-700 border-t-slate-600 dark:border-t-slate-400" />
               </div>
            ) : day === 'all' ? (
               <div className="space-y-10">
                  {dayGroups.map((group, idx) => (
                     <div key={group.day} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                        <Timeline
                           timeline={dayTimelines[idx] ?? null}
                           city={group.attractions[0]?.city}
                           date={group.date}
                           onToggleVisited={handleToggleVisited}
                        />
                     </div>
                  ))}
               </div>
            ) : (
               <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                  <Timeline
                     timeline={singleTimeline}
                     city={timelineAttractions[0]?.city}
                     date={timelineAttractions[0]?.date}
                     onToggleVisited={handleToggleVisited}
                  />
               </div>
            )}
         </main>

         {/* Info footer */}
         {(day === 'all' ? dayGroups.length > 0 : timelineAttractions.length > 0) && (
            <div className="max-w-6xl mx-auto px-6 pb-6">
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                     <Calendar className="w-4 h-4" />
                     Como funciona a Timeline
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                     <li>• Rotas calculadas automaticamente usando OSRM</li>
                     <li>• Tempo de deslocamento estimado com base na distância</li>
                     <li>• Conflitos detectados automaticamente (horários, fechamentos)</li>
                     <li>• Duração: use o campo "Duração" da atração (padrão: 60min se não informado)</li>
                     <li>• Use o filtro na home para selecionar o dia da timeline</li>
                  </ul>
               </div>
            </div>
         )}
      </div>
   )
}