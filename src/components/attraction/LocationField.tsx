import { Controller } from 'react-hook-form'
import { useLocationSearch } from '@/hooks/useLocationSearch'
import { useEffect, useRef } from 'react'

interface Props {
  control: any
  register: any
  setValue: any
  getValues: any
}

export function LocationField({ control, register, setValue, getValues }: Props) {
  const { results, loading, search, clear } = useLocationSearch();
  const containerRef = useRef<HTMLDivElement>(null);

  async function handleSearch() {
    const values = getValues();

    if (!values.name || !values.city) return;

    await search(values.name, values.city, values.country);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        clear();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [clear]);

  const values = getValues();

  return (
    <div ref={containerRef}>
      <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-2">
        Localização (Google Maps)
      </label>

      <div className="flex gap-2">
        <Controller
          name="location"
          control={control}
          render={({ field }) => (
            <input
              type="url"
              autoComplete="off"
              value={field.value || ''}
              onChange={(e) => {
                const value = e.target.value
                field.onChange(value)

                const coords = extractLatLngFromGoogleMaps(value)

                if (coords) {
                  setValue('lat', coords.lat, { shouldDirty: true })
                  setValue('lng', coords.lng, { shouldDirty: true })
                }
              }}

              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleSearch()
                }
              }}
              className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
              placeholder="https://maps.google.com/..."
            />
          )}
        />

        <button
          type="button"
          onClick={handleSearch}
          disabled={!values.name || !values.city || loading}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      <input type="hidden" autoComplete="off" {...register('lat', { valueAsNumber: true })} />
      <input type="hidden" autoComplete="off" {...register('lng', { valueAsNumber: true })} />

      {results.length > 0 && (
        <div className="mt-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm max-h-60 overflow-auto">
          {results.map((place) => (
            <div
              key={`${place.lat}-${place.lon}`}
              onClick={() => {
                const lat = parseFloat(place.lat)
                const lon = parseFloat(place.lon)

                const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lon}`

                setValue('location', googleMapsUrl, { shouldDirty: true })
                setValue('lat', lat, { shouldDirty: true })
                setValue('lng', lon, { shouldDirty: true })

                clear()
              }}
              className="p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm"
            >
              {place.displayName}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function extractLatLngFromGoogleMaps(url: string) {
  if (!url) return null;

  try {
    const matchQ = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);

    if (matchQ) {
      return {
        lat: parseFloat(matchQ[1]),
        lng: parseFloat(matchQ[2]),
      };
    }

    const matchAt = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);

    if (matchAt) {
      return {
        lat: parseFloat(matchAt[1]),
        lng: parseFloat(matchAt[2]),
      }
    }

    return null;
  }
  catch {
    return null;
  }
}