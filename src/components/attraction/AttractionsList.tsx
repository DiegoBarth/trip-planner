import { useState } from 'react'
import { Plus } from 'lucide-react'
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
}

export function AttractionsList({
   attractions,
   isLoading,
   onUpdate,
   onCreate,
   onDelete,
   onToggleVisited
}: AttractionsListProps) {
   const [isModalOpen, setIsModalOpen] = useState(false)
   const [editingAttraction, setEditingAttraction] =
      useState<Attraction | undefined>()

   const handleSave = async (data: Omit<Attraction, 'id'>) => {
      if (editingAttraction) {
         await onUpdate({ ...data, id: editingAttraction.id } as Attraction)
      } else {
         await onCreate(data)
      }
      setIsModalOpen(false)
      setEditingAttraction(undefined)
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

            <button
               onClick={() => setIsModalOpen(true)}
               className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
               <Plus className="w-5 h-5" />
               Nova Atração
            </button>
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