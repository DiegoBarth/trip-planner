import { Marker, Popup, Polyline } from 'react-leaflet'
import { AttractionCard } from '../attraction/AttractionCard'
import { createCustomIcon } from './markers'
import type { MappableAttraction } from '@/types/MappableAttraction'

type Props = {
   groupedByDay: Record<number, MappableAttraction[]>
   routes: Record<number, [number, number][]>
   getColor: (day: number) => string
}

export function MapRoutes({ groupedByDay, routes, getColor }: Props) {
   return (
      <>
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
                        icon={createCustomIcon(getColor(dNum), false)}
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
