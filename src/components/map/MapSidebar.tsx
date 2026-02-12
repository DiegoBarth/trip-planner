interface Props {
   distances: Record<number, number>
   getColor: (day: number) => string
}

export function MapSidebar({ distances, getColor }: Props) {
   if (!Object.keys(distances).length) return null

   return (
      <div className="w-full md:w-72 bg-white border-b md:border-r p-4">
         <h2 className="text-lg font-semibold mb-4">📏 Distance</h2>

         {Object.entries(distances).map(([day, km]) => (
            <div key={day} className="mb-4 p-3 rounded-lg border">
               <div className="flex items-center gap-2 mb-1">
                  <div
                     className="w-3 h-3 rounded-full"
                     style={{ backgroundColor: getColor(Number(day)) }}
                  />
                  <span className="font-medium">Day {day}</span>
               </div>
               <div className="text-sm font-bold text-blue-600">
                  {km.toFixed(2)} km
               </div>
            </div>
         ))}
      </div>
   )
}