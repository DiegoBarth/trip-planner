import { Marker, Popup } from 'react-leaflet'
import MarkerClusterGroup from 'react-leaflet-markercluster'
import { AttractionCard } from '../attraction/AttractionCard'
import { createCustomIcon } from './markers'
import { PolylineWithArrows } from './PolylineWithArrows'
import type { MappableAttraction } from '@/types/MappableAttraction'
import type { Accommodation } from '@/types/Accommodation'

type Props = {
  groupedByDay: Record<number, MappableAttraction[]>
  routes: Record<number, [number, number][]>
  accommodations: Accommodation[]
  getColor: (day: number) => string
  highlightAttractionId?: number | null
}

const HIGHLIGHT_COLOR = '#16a34a';

export function MapRoutes({ groupedByDay, routes, accommodations, getColor, highlightAttractionId }: Props) {
  return (
    <>
      {Object.entries(groupedByDay).map(([dayNum]) => {
        const dNum = Number(dayNum);
        return routes[dNum] ? (
          <PolylineWithArrows
            key={`route-${dayNum}`}
            positions={routes[dNum]}
            pathOptions={{
              color: getColor(dNum),
              weight: 5,
              opacity: 0.6,
            }}
          />
        ) : null;
      })}

      <MarkerClusterGroup
        zoomToBoundsOnClick
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
        maxClusterRadius={60}
      >
        {accommodations.map(acc => {
          const mapsUrl = `https://www.google.com/maps?q=${acc.lat},${acc.lng}`;

          return (
            <Marker
              key={`acc-${acc.id}`}
              position={[acc.lat, acc.lng]}
              icon={createCustomIcon('#111827', 'accommodation')}
              eventHandlers={{
                add: (e: { target: { _icon?: HTMLElement } }) => {
                  e.target._icon?.setAttribute('aria-label', `Hospedagem: ${acc.description}. Abrir detalhes.`)
                },
              }}
            >
              <Popup>
                <div className="p-2 space-y-2">
                  <h3 className="font-bold">{acc.description}</h3>
                  <p className="text-sm">{acc.address}</p><br />

                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 text-sm underline"
                  >
                    Abrir no Google Maps
                  </a>
                </div>
              </Popup>
            </Marker>
          )
        })}

        {Object.entries(groupedByDay).flatMap(([, points]) =>
          points.map(point => {
            const isHighlight = highlightAttractionId != null && point.id === highlightAttractionId
            return (
              <Marker
                key={point.id}
                position={[point.lat, point.lng]}
                icon={createCustomIcon(isHighlight ? HIGHLIGHT_COLOR : getColor(point.day), 'attraction', point)}
                eventHandlers={{
                  add: (e: { target: { _icon?: HTMLElement } }) => {
                    e.target._icon?.setAttribute('aria-label', `${point.name ?? 'Atração'}. Abrir detalhes.`)
                  },
                }}
              >
                <Popup maxWidth={300} minWidth={280} className="custom-attraction-popup">
                  <AttractionCard
                    attraction={point}
                    onCheckVisited={() => { }}
                  />
                </Popup>
              </Marker>
            )
          })
        )}
      </MarkerClusterGroup>
    </>
  );
}