type Coordinate = {
   lat: number
   lng: number
}

export type OSRMLeg = {
   distanceKm: number
   durationMinutes: number
}

export type OSRMResult = {
   path: [number, number][]
   distanceKm: number
   /** Legs entre waypoints consecutivos (length === coordinates.length - 1). Só presente quando há 2+ coordenadas. */
   legs?: OSRMLeg[]
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
         `https://router.project-osrm.org/route/v1/walking/${coordsString}` +
         `?overview=full&geometries=geojson`

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000)

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
         route.geometry?.coordinates?.map(
            ([lng, lat]: [number, number]) => [lat, lng]
         ) ?? []

      const distanceKm = route.distance / 1000

      const legs: OSRMLeg[] | undefined = route.legs?.map((leg: { distance: number; duration: number }) => ({
         distanceKm: leg.distance / 1000,
         durationMinutes: Math.ceil(leg.duration / 60),
      }))

      return { path, distanceKm, legs }
   } catch (error) {
      console.warn('OSRM unavailable. Showing only markers.')
      return null
   }
}