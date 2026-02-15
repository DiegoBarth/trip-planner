import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useCountry } from '@/contexts/CountryContext'
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react'
import { dateToInputFormat } from '@/utils/formatters'

export function NextDaySummary() {
   const { attractions } = useCountry()

   const nextDayData = useMemo(() => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const futureAttractions = attractions
         .filter(a => a.date && a.lat && a.lng)
         .map(a => ({
            ...a,
            parsedDate: new Date(dateToInputFormat(a.date))
         }))
         .filter(a => a.parsedDate >= today)
         .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())

      if (futureAttractions.length === 0) return null

      const nextDate = futureAttractions[0].parsedDate
      const dayAttractions = futureAttractions.filter(
         a => a.parsedDate.getTime() === nextDate.getTime()
      )

      return {
         date: nextDate,
         day: futureAttractions[0].day,
         attractionsCount: dayAttractions.length,
         attractions: dayAttractions.slice(0, 3) // Pega apenas as 3 primeiras
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
                  <span className="text-sm font-medium">Próximo Dia</span>
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
