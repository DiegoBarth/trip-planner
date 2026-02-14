import type { Country } from '@/types/Attraction'
import { COUNTRIES } from '@/config/constants'
import { useCountry } from '@/contexts/CountryContext'
import { MapPin, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export function CountryFilter() {
   const { country, setCountry, day, setDay, availableDays } = useCountry()

   return (
      <div className="flex gap-2 flex-wrap">
         <div className="relative flex-1 min-w-[140px]">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
            <select
               value={country}
               onChange={(e) => setCountry(e.target.value as Country | 'all')}
               className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-xl',
                  'bg-white/15 backdrop-blur-sm text-white text-sm font-medium',
                  'border border-white/20',
                  'focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20',
                  'transition-all duration-200',
                  'appearance-none cursor-pointer'
               )}
            >
               {Object.entries(COUNTRIES).map(([key, c]) => (
                  <option key={key} value={key} className="text-gray-900 bg-white">
                     {c.flag} {c.name}
                  </option>
               ))}
            </select>
         </div>

         <div className="relative flex-1 min-w-[140px]">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70 pointer-events-none" />
            <select
               value={day}
               onChange={(e) =>
                  setDay(e.target.value === 'all' ? 'all' : Number(e.target.value))
               }
               className={cn(
                  'w-full pl-10 pr-4 py-2.5 rounded-xl',
                  'bg-white/15 backdrop-blur-sm text-white text-sm font-medium',
                  'border border-white/20',
                  'focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/20',
                  'transition-all duration-200',
                  'appearance-none cursor-pointer',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
               )}
               disabled={availableDays.length === 0}
            >
               <option value="all" className="text-gray-900 bg-white">
                  Todos os dias
               </option>
               {availableDays.map(d => (
                  <option key={d} value={d} className="text-gray-900 bg-white">
                     Dia {d}
                  </option>
               ))}
            </select>
         </div>
      </div>
   )
}
