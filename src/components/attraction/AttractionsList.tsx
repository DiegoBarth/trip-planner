import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AttractionCard } from './AttractionCard'
import { ModalAttraction } from './ModalAttraction'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/SkeletonList'
import type { Attraction } from '@/types/Attraction'
import { formatDate } from '@/utils/formatters'

interface AttractionsListProps {
  attractions: Attraction[]
  isLoading?: boolean
  onUpdate: (attraction: Attraction) => Promise<void>
  onCreate: (attraction: Omit<Attraction, 'id'>) => Promise<void>
  onDelete: (id: number) => void
  onToggleVisited: (id: number) => void
}

export function AttractionsList({ attractions, isLoading, onUpdate, onCreate, onDelete, onToggleVisited }: AttractionsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAttraction, setEditingAttraction] = useState<Attraction | undefined>()

  // Agrupar por dia
  const groupedByDay = attractions.reduce((acc, attraction) => {
    if (!acc[attraction.day]) {
      acc[attraction.day] = []
    }
    acc[attraction.day].push(attraction)
    return acc
  }, {} as Record<number, Attraction[]>)

  // Ordenar cada dia pela ordem
  Object.keys(groupedByDay).forEach(day => {
    groupedByDay[Number(day)].sort((a, b) => a.order - b.order)
  })

  const handleOpenModal = (attraction?: Attraction) => {
    setEditingAttraction(attraction)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingAttraction(undefined)
    setIsModalOpen(false)
  }

  const handleSave = async (data: Omit<Attraction, 'id'>) => {
    if (editingAttraction) {
      await onUpdate({
        ...data,
        id: editingAttraction.id
      } as Attraction)
    } else {
      await onCreate(data)
    }
    handleCloseModal()
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
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nova Atração
        </button>
      </div>

      {isLoading ? (
        <SkeletonList />
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedByDay).length === 0 ? (
            <EmptyState
              icon="🗺️"
              title="Nenhuma atração encontrada"
              description="Comece adicionando sua primeira atração!"
            />
          ) : (
            Object.entries(groupedByDay)
              .sort(([a], [b]) => Number(a) - Number(b))
              .map(([day, dayAttractions]) => (
                <section key={day}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📅</span>
                    <h3 className="text-xl font-bold text-gray-900">
                      Dia {day}
                    </h3>
                    {dayAttractions[0]?.date && (
                      <span className="text-sm text-gray-500">
                        {formatDate(dayAttractions[0].date)}
                      </span>
                    )}
                    <span className="text-sm text-gray-400">
                      {dayAttractions.length} {dayAttractions.length === 1 ? 'atração' : 'atrações'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {dayAttractions.map(attraction => (
                      <AttractionCard
                        key={attraction.id}
                        attraction={attraction}
                        onCheckVisited={onToggleVisited}
                        onDelete={onDelete}
                        onClick={() => handleOpenModal(attraction)}
                      />
                    ))}
                  </div>
                </section>
              ))
          )}
        </div>
      )}

      <ModalAttraction
        attraction={editingAttraction}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  )
}
