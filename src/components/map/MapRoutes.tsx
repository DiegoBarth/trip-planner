import { Marker, Popup, Polyline } from 'react-leaflet'
import { AttractionCard } from '../attraction/AttractionCard'
import { createCustomIcon } from './markers'
import type { MappableAttraction } from '@/types/MappableAttraction'
import type { Accommodation } from '@/types/Accommodation'

type Props = {
   groupedByDay: Record<number, MappableAttraction[]>
   routes: Record<number, [number, number][]>
   accommodations: Accommodation[]
   getColor: (day: number) => string
}

export function MapRoutes({ groupedByDay, routes, accommodations, getColor }: Props) {
   return (
      <>
         {accommodations.map(acc => {
            const mapsUrl = `https://www.google.com/maps?q=${acc.lat},${acc.lng}`

            return (
               <Marker
                  key={`acc-${acc.id}`}
                  position={[acc.lat, acc.lng]}
                  icon={createCustomIcon('#111827', 'accommodation')}
               >
                  <Popup>
                     <div className="p-2 space-y-2">
                        <h3 className="font-bold">{acc.description}</h3>
                        <p className="text-sm">{acc.address}</p><br/>

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

         {Object.entries(groupedByDay).map(([dayNum, points]) => {
            const dNum = Number(dayNum)

            return (
               <div key={dayNum}>
                  {routes[dNum] && (
                     <Polyline
                        positions={routes[dNum]}
                        pathOptions={{
                           color: getColor(dNum),
                           weight: 5,
                           opacity: 0.6,
                        }}
                     />
                  )}

                  {points.map(point => (
                     <Marker
                        key={point.id}
                        position={[point.lat, point.lng]}
                        icon={createCustomIcon(getColor(point.day), 'attraction', point)}
                     >
                        <Popup maxWidth={300} minWidth={280} className="custom-attraction-popup">
                           <div className="w-[310px] -m-1">
                              <AttractionCard
                                 attraction={point}
                                 onCheckVisited={() => { }}
                              />
                           </div>
                        </Popup>
                     </Marker>
                  ))}
               </div>
            )
         })}
      </>
   )
}
