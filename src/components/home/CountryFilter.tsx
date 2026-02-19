import { MapPin, Calendar } from 'lucide-react'
import { useCountry } from '@/contexts/CountryContext'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { COUNTRIES } from '@/config/constants'
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
  hideGeneralOption?: boolean
};

export function CountryFilter({ showDayFilter = true, hideGeneralOption = false }: CountryFilterProps) {
  const { country, setCountry, day, setDay, availableDays } = useCountry();

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
  );
}