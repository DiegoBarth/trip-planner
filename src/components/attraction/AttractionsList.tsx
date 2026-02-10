import { useState } from 'react'
import { Plus, GripVertical } from 'lucide-react'
import { AttractionsGrid } from './AttractionsGrid'
import { ModalAttraction } from './ModalAttraction'
import { SkeletonList } from '@/components/ui/SkeletonList'
import type { Attraction } from '@/types/Attraction'

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

   const handleSave = async (data: Omit<Attraction, 'id'>) => {
      if (editingAttraction) {
         await onUpdate({ ...data, id: editingAttraction.id } as Attraction)
      } else {
         await onCreate(data)
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
      <div className="p-6">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
               Todas as Atrações
               <span className="text-sm font-normal text-gray-500 ml-2">
                  ({attractions.length})
               </span>
            </h2>

            <div className="flex items-center gap-3">
               {onBulkUpdate && (
                  <button
                     onClick={() => setIsDragEnabled(!isDragEnabled)}
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors shadow-sm ${
                        isDragEnabled
                           ? 'bg-blue-600 text-white hover:bg-blue-700'
                           : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                     }`}
                     title={isDragEnabled ? 'Desabilitar reordenação' : 'Habilitar reordenação'}
                  >
                     <GripVertical className="w-5 h-5" />
                     {isDragEnabled ? 'Reordenação ativa' : 'Reordenar'}
                  </button>
               )}

               <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
               >
                  <Plus className="w-5 h-5" />
                  Nova Atração
               </button>
            </div>
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
               enableDragDrop={isDragEnabled}
               onReorder={handleReorder}
            />
         )}

         <ModalAttraction
            attraction={editingAttraction}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSave}
         />
      </div>
   )
}