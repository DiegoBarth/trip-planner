import type { Country } from '@/types/Attraction'
import { COUNTRIES } from '@/config/constants'
import { useCountry } from '@/contexts/CountryContext'
import { MapPin, Calendar } from 'lucide-react'
import { CustomSelect } from '@/components/ui/CustomSelect'

const countryOptions = Object.entries(COUNTRIES).map(([, c]) => `${c.flag} ${c.name}`)

function countryToLabel(country: Country | 'all'): string {
   const c = COUNTRIES[country]
   return c ? `${c.flag} ${c.name}` : countryOptions[0]
}

function labelToCountry(label: string): Country | 'all' {
   const entry = Object.entries(COUNTRIES).find(
      ([, c]) => `${c.flag} ${c.name}` === label
   )
   return (entry?.[0] as Country | 'all') ?? 'all'
}

interface CountryFilterProps {
   /** Exibe o seletor de dia. Default: true */
   showDayFilter?: boolean
}

export function CountryFilter({ showDayFilter = true }: CountryFilterProps) {
   const { country, setCountry, day, setDay, availableDays } = useCountry()

   const dayOptions = ['Todos os dias', ...availableDays.map((d) => `Dia ${d}`)]
   const dayValue = day === 'all' ? 'Todos os dias' : `Dia ${day}`

   const handleDayChange = (val: string) => {
      if (val === 'Todos os dias') setDay('all')
      else setDay(Number(val.replace('Dia ', '')))
   }

   return (
      <div className="flex gap-2 flex-wrap md:flex-nowrap">
         <div className="flex-1 min-w-[140px] md:max-w-[200px]">
            <CustomSelect
               id="country-filter"
               value={countryToLabel(country)}
               onChange={(val) => setCountry(labelToCountry(val))}
               options={countryOptions}
               variant="glass"
               leftIcon={<MapPin />}
               placeholder="País"
               dropdownPosition="below"
            />
         </div>
         {showDayFilter && (
            <div className="flex-1 min-w-[140px] md:max-w-[200px]">
               <CustomSelect
                  id="day-filter"
                  value={dayValue}
                  onChange={handleDayChange}
                  options={dayOptions}
                  variant="glass"
                  leftIcon={<Calendar />}
                  placeholder="Dia"
                  disabled={availableDays.length === 0}
                  dropdownPosition="below"
               />
            </div>
         )}
      </div>
   )
}
