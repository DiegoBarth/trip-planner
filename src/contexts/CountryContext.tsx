import type { ReactNode } from 'react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import type { CountryFilterValue } from '@/types/Attraction'

type DayFilter = number | 'all'
type CountryFilter = CountryFilterValue

interface CountryContextType {
  country: CountryFilter
  setCountry: (country: CountryFilter) => void
  day: DayFilter
  setDay: (day: DayFilter) => void
}

function getInitialFilter(): { country: CountryFilter; day: DayFilter } {
  const saved = sessionStorage.getItem('trip_filter');

  if (!saved) return { country: 'all', day: 'all' };

  try {
    const parsed = JSON.parse(saved);

    if (parsed && typeof parsed.country !== 'undefined' && typeof parsed.day !== 'undefined') {
      return parsed;
    }
  }
  catch {
    sessionStorage.removeItem('trip_filter');
  }

  return { country: 'all', day: 'all' };
}

export const CountryContext = createContext<CountryContextType>({
  country: 'all',
  setCountry: () => { },
  day: 'all',
  setDay: () => { }
})

export function CountryProvider({ children }: { children: ReactNode }) {
  const initialFilter = getInitialFilter();
  const [country, setCountry] = useState<CountryFilter>(initialFilter.country);
  const [day, setDay] = useState<DayFilter>(initialFilter.day);
  const prevCountryRef = useRef<CountryFilter | null>(null);

  useEffect(() => {
    if (prevCountryRef.current !== null && prevCountryRef.current !== country) {
      setDay('all');
    }
    prevCountryRef.current = country;
  }, [country]);

  useEffect(() => {
    sessionStorage.setItem('trip_filter', JSON.stringify({ country, day }));
  }, [country, day]);

  return (
    <CountryContext.Provider
      value={{
        country,
        setCountry,
        day,
        setDay
      }}
    >
      {children}
    </CountryContext.Provider>
  );
}

export const useCountry = () => useContext(CountryContext)