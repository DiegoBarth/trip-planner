import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCountry } from '@/contexts/CountryContext'
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react'

export function NextDaySummary() {
   const { attractions } = useCountry()

   const nextDayData = useMemo(() => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const attractionsWithDate = attractions
         .filter(a => a.date && a.lat && a.lng)
         .map(a => ({
            ...a,
            parsedDate: new Date(a.date)
         }))
         .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())

      if (attractionsWithDate.length === 0) return null

      const isTodayInTrip = attractionsWithDate.some(a => {
         const d = a.parsedDate
         return d.getFullYear() === today.getFullYear() &&
            d.getMonth() === today.getMonth() &&
            d.getDate() === today.getDate()
      })

      const targetDate = isTodayInTrip
         ? today
         : attractionsWithDate.find(a => a.parsedDate >= today)?.parsedDate ?? null

      if (!targetDate) return null

      const dayAttractions = attractionsWithDate.filter(a => {
         const d = a.parsedDate
         return d.getFullYear() === targetDate.getFullYear() &&
            d.getMonth() === targetDate.getMonth() &&
            d.getDate() === targetDate.getDate()
      })

      if (dayAttractions.length === 0) return null

      return {
         date: targetDate,
         day: dayAttractions[0].day,
         isToday: isTodayInTrip,
         attractionsCount: dayAttractions.length,
         attractions: dayAttractions.slice(0, 3)
      }
   }, [attractions])

   if (!nextDayData) {
      return (
         <div className="bg-white rounded-2xl shadow-md p-6 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhum dia planejado</p>
         </div>
      )
   }

   const dateStr = nextDayData.date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
   })

   return (
      <Link
         to="/timeline"
         className="block bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-[1.02] focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none"
      >
         <div className="flex items-start justify-between mb-4">
            <div>
               <div className="flex items-center gap-2 mb-1 opacity-90">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">
                     {nextDayData.isToday ? 'Dia Atual' : 'Próximo Dia'}
                  </span>
               </div>
               <h3 className="text-2xl font-bold capitalize">
                  {dateStr}
               </h3>
               <p className="text-sm opacity-90 mt-1">Dia {nextDayData.day} da viagem</p>
            </div>
            <ChevronRight className="w-6 h-6 opacity-80" />
         </div>

         <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm opacity-90">
               <MapPin className="w-4 h-4" />
               <span>{nextDayData.attractionsCount} {nextDayData.attractionsCount === 1 ? 'local' : 'locais'} planejados</span>
            </div>

            {nextDayData.attractions.length > 0 && (
               <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
                     <Clock className="w-4 h-4" />
                     <span>Primeiros locais:</span>
                  </div>
                  <ul className="space-y-1 text-sm">
                     {nextDayData.attractions.map((attraction, idx) => (
                        <li key={attraction.id} className="opacity-90">
                           {idx + 1}. {attraction.name}
                        </li>
                     ))}
                     {nextDayData.attractionsCount > 3 && (
                        <li className="opacity-75 italic">
                           + {nextDayData.attractionsCount - 3} mais...
                        </li>
                     )}
                  </ul>
               </div>
            )}
         </div>
      </Link>
   )
}
