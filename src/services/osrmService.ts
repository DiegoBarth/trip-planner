type Coordinate = {
   lat: number
   lng: number
}

type OSRMResult = {
   path: [number, number][]
   distanceKm: number
}

export async function fetchOSRMRoute(
   coordinates: Coordinate[]
): Promise<OSRMResult | null> {

   if (coordinates.length < 2) return null

   try {
      const coordsString = coordinates
         .map(c => `${c.lng},${c.lat}`)
         .join(';')

      const url =
         `https://router.project-osrm.org/route/v1/driving/${coordsString}` +
         `?overview=full&geometries=geojson`

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(url, {
         signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
         console.warn('OSRM response not ok')
         return null
      }

      const data = await response.json()

      if (!data.routes || !data.routes.length) {
         return null
      }

      const route = data.routes[0]

      const path: [number, number][] =
         route.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
         )

      const distanceKm = route.distance / 1000

      return { path, distanceKm }

   } catch (error) {
      console.warn('OSRM unavailable. Showing only markers.')
      return null
   }
}