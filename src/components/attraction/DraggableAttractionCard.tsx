import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useState, useEffect } from 'react'
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
   const [isMobile, setIsMobile] = useState(() => {
      if (typeof window !== 'undefined') {
         return window.innerWidth <= 768
      }
      return false
   })
   const [isPressing, setIsPressing] = useState(false)

   useEffect(() => {
      const checkMobile = () => {
         setIsMobile(window.innerWidth <= 768)
      }
      
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
   }, [])

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

   const cardListeners = isMobile ? {
      ...attributes,
      ...listeners,
      onTouchStart: (e: React.TouchEvent) => {
         setIsPressing(true)
         listeners?.onTouchStart?.(e)
      },
      onTouchEnd: (e: React.TouchEvent) => {
         setIsPressing(false)
         listeners?.onTouchEnd?.(e)
      },
      onTouchCancel: (e: React.TouchEvent) => {
         setIsPressing(false)
         listeners?.onTouchCancel?.(e)
      }
   } : attributes
   
   const handleListeners = isMobile ? {} : listeners

   return (
      <div 
         ref={setNodeRef} 
         style={style} 
         className={`relative group ${isMobile && isPressing ? 'scale-[0.98] transition-transform' : ''}`}
         {...cardListeners}
      >
         {isMobile && isPressing && !isDragging && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg z-10 pointer-events-none border-2 border-blue-400 animate-pulse" />
         )}

         {!isMobile && (
            <div
               {...handleListeners}
               className={`
                  absolute top-0 left-0 right-0 h-14 z-20 flex items-center gap-2 px-3 
                  bg-gradient-to-b from-gray-900 to-gray-800 bg-opacity-60 
                  hover:bg-opacity-90 group-hover:bg-opacity-80
                  rounded-t-lg transition-all
                  cursor-grab active:cursor-grabbing
                  ${isDragging ? 'bg-opacity-90 ring-2 ring-blue-500' : ''}
               `}
               title="Clique e arraste para reordenar esta atração"
            >
               <div className="flex flex-col gap-0.5">
                  <GripVertical className="w-5 h-5 text-white" />
               </div>
               <span className="text-white text-sm font-medium">Reordenar</span>
            </div>
         )}

         <div className={isMobile ? '' : 'pt-12'}>
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
