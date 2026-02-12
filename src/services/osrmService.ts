export interface OSRMRouteResult {
   path: [number, number][]
   distanceKm: number
}

export async function fetchOSRMRoute(
   coordinates: { lat: number; lng: number }[]
): Promise<OSRMRouteResult | null> {
   if (coordinates.length < 2) return null

   const coordString = coordinates
      .map(c => `${c.lng},${c.lat}`)
      .join(';')

   const url = `https://router.project-osrm.org/route/v1/foot/${coordString}?overview=full&geometries=geojson`

   try {
      const res = await fetch(url)
      const data = await res.json()

      if (data.code !== 'Ok') return null

      return {
         path: data.routes[0].geometry.coordinates.map(
            (c: number[]) => [c[1], c[0]]
         ),
         distanceKm: data.routes[0].distance / 1000,
      }
   } catch (err) {
      console.error('OSRM error', err)
      return null
   }
}
