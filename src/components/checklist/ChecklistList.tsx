import { useState, useMemo } from 'react'
import { ListChecks, FileDown, Luggage, CheckCircle } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ChecklistCard } from '@/components/checklist/ChecklistCard'
import { ModalChecklistItem } from '@/components/checklist/ModalChecklistItem'
import { ChecklistActionsModal } from '@/components/checklist/ChecklistActionsModal'
import { exportChecklistToPDF } from '@/utils/exportChecklistToPDF'
import { CHECKLIST_CATEGORIES } from '@/config/constants'
import type { ChecklistItem } from '@/types/ChecklistItem'

interface ChecklistListProps {
  items: ChecklistItem[]
  onUpdate: (item: ChecklistItem) => void
  onCreate: (item: Omit<ChecklistItem, 'id'>) => void
  onDelete: (id: number) => void
  onTogglePacked: (id: number, isPacked: boolean) => void
  isLoading?: boolean
}

export function ChecklistList({ items, onUpdate, onCreate, onDelete, onTogglePacked, isLoading = false }: ChecklistListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | undefined>();
  const [itemToDelete, setItemToDelete] = useState<ChecklistItem | null>(null);
  const [itemForActions, setItemForActions] = useState<ChecklistItem | null>(null);

  const groupedByCategory = useMemo(() => {
    const grouped = items.reduce((acc, item) => {
      const category = item.category;

      if (!acc[category]) {
        acc[category] = [];
      }

      acc[category].push(item);

      return acc;
    }, {} as Record<string, ChecklistItem[]>);

    Object.values(grouped).forEach(categoryItems => {
      categoryItems.sort((a, b) => a.description.localeCompare(b.description, 'pt-BR'))
    });

    return grouped;
  }, [items]);

  const stats = useMemo(() => {
    const total = items.length;
    const packed = items.filter(item => item.isPacked).length;
    const percentage = total > 0 ? Math.round((packed / total) * 100) : 0;

    return { total, packed, unpacked: total - packed, percentage };
  }, [items]);

  const handleCloseModal = () => {
    setEditingItem(undefined);
    setIsModalOpen(false);
  };

  const handleSave = async (data: Omit<ChecklistItem, 'id'>) => {
    if (editingItem) {
      await Promise.resolve(onUpdate({
        ...data,
        id: editingItem.id
      } as ChecklistItem));
    }
    else {
      await Promise.resolve(onCreate(data));
    }
  };

  const handleExportPDF = () => {
    exportChecklistToPDF({ items });
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    await onDelete(itemToDelete.id);

    setItemToDelete(null);
  };

  const handleCardClick = (item: ChecklistItem) => {
    setItemForActions(item);
  };

  const handleOpenEditFromActions = (item: ChecklistItem) => {
    setItemForActions(null);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleOpenDeleteFromActions = (item: ChecklistItem) => {
    setItemForActions(null);
    setItemToDelete(item);
  };

  if (isLoading) return null;

  return (
    <div>
      <div className="mb-8">
        <div className="rounded-2xl shadow-lg overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 text-white mb-4">
          <div className="p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <ListChecks className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    Checklist de Viagem
                  </h2>
                  <p className="text-sm opacity-90 mt-0.5">
                    {stats.total} {stats.total === 1 ? 'item' : 'itens'} no total
                  </p>
                </div>
              </div>
              {stats.total > 0 && (
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-white/90 transition-colors shadow-md focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none"
                  title="Exportar para PDF"
                >
                  <FileDown className="w-5 h-5" />
                  Exportar PDF
                </button>
              )}
            </div>

            {stats.total > 0 && (
              <div className="mt-5 pt-5 border-t border-white/25">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">
                    Progresso da mala
                  </span>
                  <span className="text-sm font-bold">
                    {stats.packed} de {stats.total} ({stats.percentage}%)
                  </span>
                </div>
                <div className="h-2.5 bg-white/25 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2.5 text-xs opacity-90">
                  <span className="flex items-center gap-1.5">
                    <Luggage className="w-4 h-4" />
                    {stats.unpacked} faltando
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    {stats.packed} empacotado{stats.packed !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

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
              const labelA = CHECKLIST_CATEGORIES[keyA as keyof typeof CHECKLIST_CATEGORIES]?.label || keyA
              const labelB = CHECKLIST_CATEGORIES[keyB as keyof typeof CHECKLIST_CATEGORIES]?.label || keyB
              return labelA.localeCompare(labelB, 'pt-BR')
            })
            .map(([category, categoryItems]) => {
              const categoryConfig = CHECKLIST_CATEGORIES[category as keyof typeof CHECKLIST_CATEGORIES];
              const packedCount = categoryItems.filter(item => item.isPacked).length;
              const totalCount = categoryItems.length;

              return (
                <section key={category} className="space-y-4">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm w-fit">
                    <span className="text-xl">{categoryConfig?.icon ?? '📦'}</span>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {categoryConfig?.label ?? category}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {packedCount}/{totalCount}
                    </span>
                    {packedCount === totalCount && totalCount > 0 && (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completo
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryItems.map(item => (
                      <ChecklistCard
                        key={item.id}
                        item={item}
                        onClick={handleCardClick}
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

      <ChecklistActionsModal
        item={itemForActions}
        isOpen={!!itemForActions}
        onClose={() => setItemForActions(null)}
        onEdit={handleOpenEditFromActions}
        onDelete={handleOpenDeleteFromActions}
      />

      <ConfirmModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        title="Excluir item"
        message={
          itemToDelete ? (
            <>Tem certeza que deseja excluir &quot;{itemToDelete.description}&quot;?</>
          ) : null
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}