export interface LocationResult {
   displayName: string
   lat: string
   lon: string
}

export async function searchPlaces(
   name: string,
   city?: string,
   country?: string,
   signal?: AbortSignal
): Promise<LocationResult[]> {
   if (!name) return []

   const queryParts = [name, city, country].filter(Boolean)
   const query = queryParts.join(', ')

   const languageMap: Record<string, string> = {
      BR: 'pt-BR',
      PT: 'pt-PT',
      JP: 'ja,en',
      KR: 'ko,en'
   }

   const language = languageMap[country || ''] || 'en'

   const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
   )}&addressdetails=1`

   const response = await fetch(url, {
      signal,
      headers: {
         'Accept-Language': language,
      },
   })

   if (!response.ok) {
      throw new Error('Failed to fetch location')
   }

   const data = await response.json()

   return data.map((item: any) => ({
      displayName: item.display_name,
      lat: item.lat,
      lon: item.lon,
   }))
}
