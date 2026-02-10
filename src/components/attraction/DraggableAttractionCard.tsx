import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { AttractionCard } from './AttractionCard'
import type { Attraction } from '@/types/Attraction'

interface DraggableAttractionCardProps {
   attraction: Attraction
   onCheckVisited?: (id: number) => void
   onDelete?: (id: number) => void
   onClick?: () => void
}

export function DraggableAttractionCard({
   attraction,
   onCheckVisited,
   onDelete,
   onClick
}: DraggableAttractionCardProps) {
   const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging
   } = useSortable({ id: attraction.id })

   const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.6 : 1,
      zIndex: isDragging ? 1000 : 'auto'
   }

   return (
      <div ref={setNodeRef} style={style} className="relative group">
         {/* Large drag handle - mobile friendly - only for reordering */}
         <div
            {...attributes}
            {...listeners}
            className={`
               absolute top-0 left-0 right-0 h-14 z-20 flex items-center gap-2 px-3 
               bg-gradient-to-b from-gray-900 to-gray-800 bg-opacity-60 
               hover:bg-opacity-90 group-hover:bg-opacity-80
               rounded-t-lg transition-all
               cursor-grab active:cursor-grabbing
               ${isDragging ? 'bg-opacity-90 ring-2 ring-blue-500' : ''}
            `}
            title="Segure e arraste para reordenar esta atração"
         >
            <div className="flex flex-col gap-0.5">
               <GripVertical className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-sm font-medium">Reordenar</span>
         </div>

         {/* Invisible expanded touch target */}
         <div
            {...attributes}
            {...listeners}
            className="absolute top-0 left-0 right-0 h-14 z-10"
         />

         <div className="pt-12">
            <AttractionCard
               attraction={attraction}
               onCheckVisited={onCheckVisited}
               onDelete={onDelete}
               onClick={onClick}
            />
         </div>
      </div>
   )
}
