import { useEffect } from 'react';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import { useCountry } from '@/contexts/CountryContext'
import { useAttraction } from '@/hooks/useAttraction';
import { useFilterSheet } from '@/contexts/FilterSheetContext'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { COUNTRIES, TRIP_FILTER_KEY } from '@/config/constants'
import type { Country, CountryFilterValue } from '@/types/Attraction'

const FILTER_OPTIONS: { key: CountryFilterValue; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'general', label: `${COUNTRIES.general.flag} ${COUNTRIES.general.name}` },
  ...Object.entries(COUNTRIES)
    .filter(([key]) => key !== 'general')
    .map(([key, c]) => ({ key: key as Country, label: `${c.flag} ${c.name}`, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(({ key, label }) => ({ key, label })),
];

interface CountryFilterProps {
  showDayFilter?: boolean
  hideGeneralOption?: boolean,
  variant?: 'default' | 'glass' | undefined
};

export function CountryFilter({ showDayFilter = true, hideGeneralOption = false, variant = 'default' }: CountryFilterProps) {
  const { country, setCountry, day, setDay } = useCountry()
  const { availableDays } = useAttraction(country)
  const dropdownPosition = useFilterSheet()

  useEffect(() => {
    const saved = localStorage.getItem(TRIP_FILTER_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      if (parsed?.day !== undefined && parsed.day !== 'all' && typeof parsed.day === 'number') {
        setDay(parsed.day)
      }
    } catch {
      // ignore invalid stored value
    }
  }, [setDay])

  const visibleOptions = hideGeneralOption
    ? FILTER_OPTIONS.filter(o => o.key !== 'general')
    : FILTER_OPTIONS;

  const countryOptions = visibleOptions.map(o => o.label);

  function countryToLabel(value: CountryFilterValue): string {
    if (hideGeneralOption && value === 'general') return 'Todos';

    const opt = FILTER_OPTIONS.find(o => o.key === value);

    return opt?.label ?? 'Todos';
  }

  function labelToCountry(label: string): CountryFilterValue {
    const opt = visibleOptions.find(o => o.label === label);

    return opt?.key ?? 'all';
  }

  const dayOptions = ['Todos os dias', ...availableDays.map((d) => `Dia ${d}`)];
  const dayValue = day === 'all' ? 'Todos os dias' : `Dia ${day}`;

  const handleDayChange = (val: string) => {
    if (val === 'Todos os dias') setDay('all')
    else setDay(Number(val.replace('Dia ', '')));
  };

  return (
    <div className="flex gap-2 flex-wrap md:flex-nowrap">
      <div className="flex-1 min-w-[140px] md:max-w-[200px]">
        <CustomSelect
          id="country-filter"
          value={countryToLabel(country)}
          onChange={(val) => setCountry(labelToCountry(val))}
          options={countryOptions}
          variant={variant}
          leftIcon={variant == 'default' ? undefined : <MapPin />}
          placeholder="País"
          dropdownPosition={dropdownPosition}
        />
      </div>
      {showDayFilter && (
        <div className="flex-1 min-w-[140px] md:max-w-[200px]">
          <CustomSelect
            id="day-filter"
            value={dayValue}
            onChange={handleDayChange}
            options={dayOptions}
            variant={variant}
            leftIcon={variant == 'default' ? undefined : <Calendar />}
            placeholder="Dia"
            disabled={availableDays.length === 0}
            dropdownPosition={dropdownPosition}
          />
        </div>
      )}
    </div>
  )
}