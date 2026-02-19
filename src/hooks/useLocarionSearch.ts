import { useState, useCallback } from 'react'
import { searchPlaces } from '@/services/locationService'

export function useLocationSearch() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (name: string, city: string, country: string) => {
    try {
      setLoading(true)
      const data = await searchPlaces(name, city, country);
      setResults(data);
    }
    catch (err) {
      console.error(err);
    }
    finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    search,
    clear: () => setResults([])
  }
}