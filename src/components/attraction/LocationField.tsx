import { Controller } from 'react-hook-form'
import { useLocationSearch } from '@/hooks/useLocarionSearch'

interface Props {
   control: any
   register: any
   setValue: any
   nameValue: string
   cityValue: string
   countryValue: string
}

export function LocationField({
   control,
   register,
   setValue,
   nameValue,
   cityValue,
   countryValue
}: Props) {
   const { results, loading, search, clear } = useLocationSearch()

   async function handleSearch() {
      await search(nameValue, cityValue, countryValue)
   }

   return (
      <div>
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
                     onChange={(e) => field.onChange(e.target.value)}
                     className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100"
                     placeholder="https://maps.google.com/..."
                  />
               )}
            />

            <button
               type="button"
               onClick={handleSearch}
               disabled={!nameValue  || !cityValue  || loading}
               className="px-4 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
            >
               {loading ? 'Buscando...' : 'Buscar'}
            </button>
         </div>

         <input type="hidden" autoComplete="off" {...register('lat', { valueAsNumber: true })} />
         <input type="hidden" autoComplete="off" {...register('lng', { valueAsNumber: true })} />

         {results.length > 0 && (
            <div className="mt-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm max-h-60 overflow-auto">

               {results.map((place, index) => (
                  <div
                     key={index}
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