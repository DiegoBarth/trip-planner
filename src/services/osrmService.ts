import { OSRM_FETCH_TIMEOUT_MS, OSRM_ROUTE_FETCH_CONCURRENCY } from '@/config/constants'



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

  legs?: OSRMLeg[]

}



function haversineKm(a: Coordinate, b: Coordinate): number {

  const R = 6371;

  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);

  const dLng = toRad(b.lng - a.lng);

  const lat1 = toRad(a.lat);

  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);

  const sinDLng = Math.sin(dLng / 2);

  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));

}



/**
 * Straight-line approximation between waypoints (Haversine), no network.
 * Keeps map and timeline usable when the public OSRM instance fails or times out.
 */

export function straightLineRouteFromCoordinates(coordinates: Coordinate[]): OSRMResult {

  const legs: OSRMLeg[] = [];

  let totalKm = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {

    const d = haversineKm(coordinates[i], coordinates[i + 1]);

    totalKm += d;

    legs.push({

      distanceKm: d,

      durationMinutes: Math.ceil((d / 5) * 60),

    });

  }

  const path: [number, number][] = coordinates.map((c) => [c.lat, c.lng]);

  return { path, distanceKm: totalKm, legs };

}



function createConcurrencyLimiter(maxConcurrent: number) {

  let active = 0;

  const queue: Array<() => void> = [];



  function pump() {

    while (active < maxConcurrent && queue.length > 0) {

      const start = queue.shift()!;

      active++;

      start();

    }

  }



  return function runLimited<T>(task: () => Promise<T>): Promise<T> {

    return new Promise((resolve, reject) => {

      queue.push(() => {

        task()

          .then(resolve, reject)

          .finally(() => {

            active--;

            pump();

          });

      });

      pump();

    });

  };

}



const runOsrmFetch = createConcurrencyLimiter(Math.max(1, OSRM_ROUTE_FETCH_CONCURRENCY));



async function doFetchOSRMRoute(

  coordinates: Coordinate[],

  externalSignal?: AbortSignal

): Promise<OSRMResult | null> {

  const controller = new AbortController();

  const timeout = setTimeout(() => controller.abort(), OSRM_FETCH_TIMEOUT_MS);



  const onExternalAbort = () => {

    clearTimeout(timeout);

    controller.abort();

  };



  if (externalSignal) {

    if (externalSignal.aborted) {

      clearTimeout(timeout);

      throw new DOMException('Aborted', 'AbortError');

    }

    externalSignal.addEventListener('abort', onExternalAbort, { once: true });

  }



  try {

    const coordsString = coordinates.map(c => `${c.lng},${c.lat}`).join(';');

    /** simplified overview = smaller payload; legs and total distance stay useful for the timeline. */

    const url =

      `https://router.project-osrm.org/route/v1/walking/${coordsString}` +

      '?overview=simplified&geometries=geojson&alternatives=false';



    const response = await fetch(url, {

      signal: controller.signal,

    });



    if (!response.ok) {

      console.warn('OSRM response not ok');



      return null;

    }



    const data = await response.json();



    if (!data.routes || !data.routes.length) {

      return null;

    }



    const route = data.routes[0];



    const path: [number, number][] =

      route.geometry?.coordinates?.map(

        ([lng, lat]: [number, number]) => [lat, lng]

      ) ?? [];



    const distanceKm = route.distance / 1000;



    const legs: OSRMLeg[] | undefined = route.legs?.map((leg: { distance: number; duration: number }) => ({

      distanceKm: leg.distance / 1000,

      durationMinutes: Math.ceil(leg.duration / 60),

    }));



    return { path, distanceKm, legs };

  }

  catch (error: unknown) {

    const aborted =

      error instanceof DOMException

        ? error.name === 'AbortError'

        : error instanceof Error && error.name === 'AbortError';

    if (aborted && externalSignal?.aborted) {

      throw error;

    }

    console.warn('OSRM unavailable. Showing only markers.');



    return null;

  }

  finally {

    clearTimeout(timeout);

    externalSignal?.removeEventListener('abort', onExternalAbort);

  }

}



export async function fetchOSRMRoute(

  coordinates: Coordinate[],

  externalSignal?: AbortSignal

): Promise<OSRMResult | null> {

  if (coordinates.length < 2) return null;

  if (externalSignal?.aborted) {

    throw new DOMException('Aborted', 'AbortError');

  }

  return runOsrmFetch(() => doFetchOSRMRoute(coordinates, externalSignal));

}



/** Try OSRM; on failure or timeout, fall back to straight-line geometry (consistent path and legs). */

export async function fetchOSRMRouteWithFallback(

  coordinates: Coordinate[],

  externalSignal?: AbortSignal

): Promise<OSRMResult | null> {

  if (coordinates.length < 2) return null;

  const fromServer = await fetchOSRMRoute(coordinates, externalSignal);

  return fromServer ?? straightLineRouteFromCoordinates(coordinates);

}
