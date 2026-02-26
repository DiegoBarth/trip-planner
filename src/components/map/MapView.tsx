import { useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { useCountry } from '@/contexts/CountryContext'
import { FitBounds } from '@/components/map/FitBounds'
import { MapRoutes } from '@/components/map/MapRoutes'
import { useOSRMRoutesQuery } from '@/hooks/useOSRMRoutesQuery'
import { isMappableAttraction } from '@/utils/typeGuards'
import type { Attraction } from '@/types/Attraction'
import type { MappableAttraction } from '@/types/MappableAttraction'

const dayColors = ['#2563eb', '#16a34a', '#9333ea', '#ea580c', '#dc2626', '#0891b2'];

function getColorForDay(day: number) {
  return dayColors[(day - 1) % dayColors.length];
}

export function MapView() {
  const { attractions, accommodations, day } = useCountry();
  const location = useLocation();

  const mappable = useMemo(() => attractions.filter(isMappableAttraction), [attractions]);

  const filtered = useMemo(() => {
    if (day !== 'all') return mappable.filter(a => a.day === Number(day));

    return mappable;
  }, [mappable, day]);

  const groupedByDay = useMemo(() => {
    const grouped: Record<number, MappableAttraction[]> = {};

    filtered.forEach(a => {
      if (!grouped[a.day]) grouped[a.day] = [];

      grouped[a.day].push(a);
    });

    return grouped;
  }, [filtered]);

  const accommodationsForMap = useMemo(() => {
    if (!accommodations || accommodations.length === 0) return [];

    if (day === 'all') return accommodations;

    if (filtered.length === 0) return [];

    const firstAttraction = [...filtered].sort((a, b) => a.order - b.order)[0];
    const firstCity = firstAttraction?.city?.trim().toLowerCase();

    if (!firstCity) return accommodations;

    return accommodations.filter(
      acc => acc.city?.trim().toLowerCase() === firstCity
    );
  }, [accommodations, day, filtered]);

  const { routes } = useOSRMRoutesQuery(
    groupedByDay as Record<number, Attraction[]>,
    accommodationsForMap
  );

  const highlightAttractionId = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.order - b.order)
    const next = sorted.find(a => a.id !== -999 && !a.visited)
    return next?.id ?? null
  }, [filtered])

  const mapPoints = useMemo(() => {
    if (accommodationsForMap.length === 0) return filtered;

    const filteredIds = new Set(filtered.map(a => a.id));
    const accs = accommodationsForMap.filter(acc => !filteredIds.has(acc.id));

    return [...filtered, ...accs];
  }, [filtered, accommodationsForMap]);

  useEffect(() => {
    import('leaflet/dist/leaflet.css')
  }, [])

  return (
    <div className="h-[calc(100vh-122px)] md:h-[calc(100vh-147px-4rem)]">
      <MapContainer
        key={location.pathname}
        className="h-full w-full"
        zoom={13}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds attractions={mapPoints} />

        <MapRoutes
          groupedByDay={groupedByDay}
          routes={routes}
          accommodations={accommodationsForMap}
          getColor={getColorForDay}
          highlightAttractionId={highlightAttractionId}
        />
      </MapContainer>
    </div>
  );
}