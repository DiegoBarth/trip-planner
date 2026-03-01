import { useState, useCallback, useRef } from 'react'
import { searchLocations } from '@/api/location'
import type { LocationResult } from '@/api/location'

export function useLocationSearch() {
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);

  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (name: string, city?: string, country?: string) => {
      try {
        setLoading(true);

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        const data = await searchLocations(
          name,
          city,
          country,
        );

        setResults(data);
      }
      catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error(err);
        }
      }
      finally {
        setLoading(false);
      }
    },
    []
  );

  const clear = useCallback(() => {
    setResults([]);
    abortRef.current?.abort();
  }, []);

  return {
    results,
    loading,
    search,
    clear,
  };
}