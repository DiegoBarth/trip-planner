import { useState, useEffect } from 'react'
import { GripVertical } from 'lucide-react'
import { AttractionsGrid } from './AttractionsGrid'
import { ModalAttraction } from './ModalAttraction'
import { SkeletonList } from '@/components/ui/SkeletonList'
import type { Attraction } from '@/types/Attraction'
import { getAutoDayForDate, getNextOrderForDate } from '@/utils/attractionDayUtils'
import { dateToInputFormat } from '@/utils/formatters'

interface AttractionsListProps {
   attractions: Attraction[]
   isLoading?: boolean
   onUpdate: (attraction: Attraction) => Promise<void>
   onCreate: (attraction: Omit<Attraction, 'id'>) => Promise<void>
   onDelete: (id: number) => void
   onToggleVisited: (id: number) => void
   onBulkUpdate?: (attractions: Attraction[]) => Promise<void>
}

export function AttractionsList({
   attractions,
   isLoading,
   onUpdate,
   onCreate,
   onDelete,
   onToggleVisited,
   onBulkUpdate
}: AttractionsListProps) {
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [editingAttraction, setEditingAttraction] =
      useState<Attraction | undefined>()
   const [isDragEnabled, setIsDragEnabled] = useState(false)
   const [isMobile, setIsMobile] = useState(() => {
      if (typeof window !== 'undefined') {
         return window.innerWidth <= 768
      }
      return false
   })

   useEffect(() => {
      const checkMobile = () => {
         setIsMobile(window.innerWidth <= 768)
      }
      
      checkMobile()
      window.addEventListener('resize', checkMobile)
      return () => window.removeEventListener('resize', checkMobile)
   }, [])

   const handleSave = async (data: Omit<Attraction, 'id' | 'day' | 'order'>) => {
      const autoDay = getAutoDayForDate(
         attractions,
         data.country,
         data.date,
         editingAttraction?.id
      )

      const isSameGroup = editingAttraction
         ? editingAttraction.country === data.country
            && dateToInputFormat(editingAttraction.date) === dateToInputFormat(data.date)
         : false

      const order = isSameGroup
         ? editingAttraction?.order ?? 1
         : getNextOrderForDate(attractions, data.country, data.date, editingAttraction?.id)

      const payload = { ...data, day: autoDay, order }

      if (editingAttraction) {
         await onUpdate({ ...payload, id: editingAttraction.id } as Attraction)
      } else {
         await onCreate(payload as Omit<Attraction, 'id'>)
      }
      setIsModalOpen(false)
      setEditingAttraction(undefined)
   }

   const handleReorder = async (reorderedAttractions: Attraction[]) => {
      if (!onBulkUpdate) return

      // Find which attractions changed
      const changedAttractions = reorderedAttractions.filter(updated => {
         const original = attractions.find(a => a.id === updated.id)
         return original && (original.day !== updated.day || original.order !== updated.order)
      })

      if (changedAttractions.length > 0) {
         await onBulkUpdate(changedAttractions)
      }
   }

   return (
      <div>
         <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
            <div className="flex items-center gap-2">
               <h2 className="text-lg font-semibold text-gray-900">
                  Todas as Atrações
               </h2>
               <span className="text-sm text-gray-500 font-medium">
                  {attractions.length} {attractions.length === 1 ? 'item' : 'itens'}
               </span>
            </div>

            {onBulkUpdate && !isMobile && (
               <button
                  onClick={() => setIsDragEnabled(!isDragEnabled)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                     isDragEnabled
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={isDragEnabled ? 'Desabilitar reordenação' : 'Habilitar reordenação'}
               >
                  <GripVertical className="w-4 h-4" />
                  {isDragEnabled ? 'Reordenação ativa' : 'Reordenar'}
               </button>
            )}
         </div>

         {isLoading ? (
            <SkeletonList />
         ) : (
            <AttractionsGrid
               attractions={attractions}
               groupBy="country"
               onToggleVisited={onToggleVisited}
               onDelete={onDelete}
               onEdit={(attraction) => {
                  setEditingAttraction(attraction)
                  setIsModalOpen(true)
               }}
               emptyTitle="Nenhuma atração encontrada"
               emptyDescription="Comece adicionando sua primeira atração!"
               enableDragDrop={isMobile ? true : isDragEnabled}
               onReorder={handleReorder}
            />
         )}

         <ModalAttraction
            attraction={editingAttraction}
            isOpen={isModalOpen}
            onClose={() => {
               setIsModalOpen(false)
               setEditingAttraction(undefined)
            }}
            onSave={handleSave}
         />
      </div>
   )
}