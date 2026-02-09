import type { Country } from '@/types/Attraction'
import { COUNTRIES } from '@/config/constants'
import { useCountry } from '@/contexts/CountryContext'

export function CountryFilter() {
   const { country, setCountry, day, setDay } = useCountry()

   return (
      <div className="max-w-6xl mx-auto">
         <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold flex items-center gap-2">
               🗾 Viagem Japão & Coreia
            </h1>
            <button className="text-2xl">🌙</button>
         </div>

         <div className="flex gap-3 flex-wrap">
            <select
               value={country}
               onChange={(e) => setCountry(e.target.value as Country | 'all')}
               className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
               <option value="all">Todos os países</option>
               {Object.entries(COUNTRIES).map(([key, c]) => (
                  <option key={key} value={key} className="text-gray-900">
                     {c.flag} {c.name}
                  </option>
               ))}
            </select>

            <select
               value={day}
               onChange={(e) =>
                  setDay(e.target.value === 'all' ? 'all' : Number(e.target.value))
               }
               className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur text-white border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
               <option value="all">Todos os dias</option>
               {Array.from({ length: 15 }, (_, i) => i + 1).map(d => (
                  <option key={d} value={d} className="text-gray-900">
                     Dia {d}
                  </option>
               ))}
            </select>
         </div>
      </div>
   )
}
