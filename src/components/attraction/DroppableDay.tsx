import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { DraggableAttractionCard } from './DraggableAttractionCard'
import type { Attraction } from '@/types/Attraction'

interface DroppableDayProps {
   day: number
   attractions: Attraction[]
   onToggleVisited?: (id: number) => void
   onDelete?: (id: number) => void
   onEdit?: (attraction: Attraction) => void
}

export function DroppableDay({
   day: _,
   attractions,
   onToggleVisited,
   onDelete,
   onEdit
}: DroppableDayProps) {
   return (
      <div className="space-y-3">
         <SortableContext
            items={attractions.map(a => a.id)}
            strategy={verticalListSortingStrategy}
         >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {attractions.map(attraction => (
                  <DraggableAttractionCard
                     key={attraction.id}
                     attraction={attraction}
                     onCheckVisited={onToggleVisited}
                     onDelete={onDelete}
                     onClick={() => onEdit?.(attraction)}
                  />
               ))}
            </div>
         </SortableContext>
      </div>
   )
}
