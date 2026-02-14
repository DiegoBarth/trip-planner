import { useState, useMemo } from 'react'
import { Plus, ListChecks } from 'lucide-react'
import { ChecklistCard } from './ChecklistCard'
import { ModalChecklistItem } from './ModalChecklistItem'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/SkeletonList'
import type { ChecklistItem } from '@/types/ChecklistItem'
import { CHECKLIST_CATEGORIES } from '@/config/constants'

interface ChecklistListProps {
  items: ChecklistItem[]
  onUpdate: (item: ChecklistItem) => void
  onCreate: (item: Omit<ChecklistItem, 'id'>) => void
  onDelete: (id: number) => void
  onTogglePacked: (id: number, isPacked: boolean) => void
  isLoading?: boolean
}

export function ChecklistList({
  items,
  onUpdate,
  onCreate,
  onDelete,
  onTogglePacked,
  isLoading = false
}: ChecklistListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItem | undefined>()

  // Group by category
  const groupedByCategory = useMemo(() => {
    const grouped = items.reduce((acc, item) => {
      const category = item.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    }, {} as Record<string, ChecklistItem[]>)

    // Sort items within each category (unpacked first, then by description)
    Object.values(grouped).forEach(categoryItems => {
      categoryItems.sort((a, b) => {
        if (a.isPacked !== b.isPacked) {
          return a.isPacked ? 1 : -1
        }
        return a.description.localeCompare(b.description)
      })
    })

    return grouped
  }, [items])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = items.length
    const packed = items.filter(item => item.isPacked).length
    const percentage = total > 0 ? Math.round((packed / total) * 100) : 0

    return { total, packed, unpacked: total - packed, percentage }
  }, [items])

  const handleOpenModal = (item?: ChecklistItem) => {
    setEditingItem(item)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingItem(undefined)
    setIsModalOpen(false)
  }

  const handleSave = (data: Omit<ChecklistItem, 'id'>) => {
    if (editingItem) {
      onUpdate({
        ...data,
        id: editingItem.id
      } as ChecklistItem)
    } else {
      onCreate(data)
    }
    handleCloseModal()
  }

  // Show loading skeleton
  if (isLoading) {
    return <SkeletonList />
  }

  return (
    <div className="p-6">
      {/* Header with stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <ListChecks className="w-6 h-6" />
              Checklist de Viagem
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total} {stats.total === 1 ? 'item' : 'itens'} no total
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Novo Item
          </button>
        </div>

        {/* Progress bar */}
        {stats.total > 0 && (
          <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progresso da Mala
              </span>
              <span className="text-sm font-bold text-blue-600">
                {stats.packed} de {stats.total} ({stats.percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>🎒 {stats.unpacked} faltando</span>
              <span>✅ {stats.packed} empacotado{stats.packed !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}
      </div>

      {/* Items by category */}
      <div className="space-y-8">
        {Object.keys(groupedByCategory).length === 0 ? (
          <EmptyState
            icon="📋"
            title="Nenhum item no checklist"
            description="Comece adicionando itens que você precisa levar na viagem!"
          />
        ) : (
          Object.entries(groupedByCategory)
            .sort(([keyA], [keyB]) => {
              // Sort categories by their order in CHECKLIST_CATEGORIES
              const order = Object.keys(CHECKLIST_CATEGORIES)
              return order.indexOf(keyA) - order.indexOf(keyB)
            })
            .map(([category, categoryItems]) => {
              const categoryConfig = CHECKLIST_CATEGORIES[category as keyof typeof CHECKLIST_CATEGORIES]
              const packedCount = categoryItems.filter(item => item.isPacked).length
              const totalCount = categoryItems.length

              return (
                <section key={category} className="space-y-4">
                  {/* Category header */}
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-200">
                    <span className="text-3xl">{categoryConfig.icon}</span>
                    <h3 className="text-xl font-bold text-gray-900">
                      {categoryConfig.label}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {packedCount}/{totalCount}
                    </span>
                    {packedCount === totalCount && totalCount > 0 && (
                      <span className="ml-auto text-green-600 font-semibold text-sm flex items-center gap-1">
                        <span>✓</span> Completo!
                      </span>
                    )}
                  </div>

                  {/* Items grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryItems.map(item => (
                      <ChecklistCard
                        key={item.id}
                        item={item}
                        onEdit={() => handleOpenModal(item)}
                        onDelete={onDelete}
                        onTogglePacked={onTogglePacked}
                      />
                    ))}
                  </div>
                </section>
              )
            })
        )}
      </div>

      <ModalChecklistItem
        item={editingItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  )
}
