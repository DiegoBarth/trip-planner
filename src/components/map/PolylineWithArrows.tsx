import { useEffect, useMemo } from 'react'
import { useMap } from 'react-leaflet'
import 'leaflet-polylinedecorator'

type PathOptions = {
  color: string
  weight?: number
  opacity?: number
}

type Props = {
  positions: [number, number][]
  pathOptions: PathOptions
}

export function PolylineWithArrows({ positions, pathOptions }: Props) {
  const map = useMap();
  const positionsKey = useMemo(() => JSON.stringify(positions), [positions]);

  useEffect(() => {
    if (!positions || positions.length < 2) return;

    const L = window.L;
    if (!L) return;

    const color = pathOptions.color ?? '#3388ff';
    const weight = pathOptions.weight ?? 5;
    const opacity = pathOptions.opacity ?? 0.6;

    const polyline = L.polyline(positions, { color, weight, opacity }).addTo(map);

    const decorator = (L as any).polylineDecorator(positions, {
      patterns: [
        {
          offset: 0,
          repeat: 80,
          symbol: (L as any).Symbol.arrowHead({
            pixelSize: 10,
            polygon: true,
            pathOptions: { color, weight: 1, opacity, fillOpacity: 0.8 },
          }),
        },
      ],
    }).addTo(map);

    return () => {
      map.removeLayer(polyline);
      map.removeLayer(decorator);
    };
  }, [map, positionsKey, pathOptions.color, pathOptions.weight, pathOptions.opacity]);

  return null;
}
