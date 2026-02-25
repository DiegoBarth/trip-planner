import { useState, useMemo, lazy, Suspense } from 'react'
import GripVertical from 'lucide-react/dist/esm/icons/grip-vertical';
import { AttractionsGrid } from '@/components/attraction/AttractionsGrid'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

const ModalAttraction = lazy(() =>
  import('@/components/attraction/ModalAttraction').then((m) => ({ default: m.ModalAttraction }))
)

const AttractionsGridWithDnD = lazy(() =>
  import('@/components/attraction/AttractionsGridWithDnD').then((m) => ({ default: m.AttractionsGridWithDnD }))
)
import { getAutoDayForDate, getNextOrderForDate } from '@/utils/attractionDayUtils'
import { dateToInputFormat, formatCurrency } from '@/utils/formatters'
import type { Attraction } from '@/types/Attraction'

interface AttractionsListProps {
  attractions: Attraction[]
  isLoading?: boolean
  onUpdate: (attraction: Attraction) => Promise<void>
  onCreate: (attraction: Omit<Attraction, 'id'>) => Promise<void>
  onDelete: (id: number) => void
  onToggleVisited: (id: number) => void
  onBulkUpdate?: (attractions: Attraction[]) => Promise<void>
  /** When provided (e.g. from page header), reorder button is not rendered here */
  isDragEnabled?: boolean
  onToggleDragEnabled?: (value: boolean) => void
}

export default function AttractionsList({
  attractions,
  isLoading,
  onUpdate,
  onCreate,
  onDelete,
  onToggleVisited,
  onBulkUpdate,
  isDragEnabled: isDragEnabledProp,
  onToggleDragEnabled
}: AttractionsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAttraction, setEditingAttraction] = useState<Attraction | undefined>()
  const [attractionToDelete, setAttractionToDelete] = useState<Attraction | null>(null)
  const [isDragEnabledLocal, setIsDragEnabledLocal] = useState(false)
  const isDragEnabled = isDragEnabledProp ?? isDragEnabledLocal
  const setDragEnabled = onToggleDragEnabled ?? setIsDragEnabledLocal

  const handleSave = async (data: Omit<Attraction, 'id' | 'day' | 'order'>) => {
    const autoDay = getAutoDayForDate(
      attractions,
      data.country,
      data.date,
      editingAttraction?.id
    );

    const isSameGroup = editingAttraction
      ? editingAttraction.country === data.country
      && dateToInputFormat(editingAttraction.date) === dateToInputFormat(data.date)
      : false;

    const order = isSameGroup
      ? editingAttraction?.order ?? 1
      : getNextOrderForDate(attractions, data.country, data.date, editingAttraction?.id);

    const payload = { ...data, day: autoDay, order };

    if (editingAttraction) {
      await onUpdate({ ...payload, id: editingAttraction.id } as Attraction);
    }
    else {
      await onCreate(payload as Omit<Attraction, 'id'>);
    }

    setIsModalOpen(false);
    setEditingAttraction(undefined);
  }

  const handleReorder = async (reorderedAttractions: Attraction[]) => {
    if (!onBulkUpdate) return;

    const changedAttractions = reorderedAttractions.filter(updated => {
      const original = attractions.find(a => a.id === updated.id);

      return original && (original.day !== updated.day || original.order !== updated.order);
    });

    if (changedAttractions.length > 0) {
      await onBulkUpdate(changedAttractions);
    }
  }

  const handleDeleteRequest = (id: number) => {
    const a = attractions.find(x => x.id === id);

    if (a) setAttractionToDelete(a);
  }

  const handleConfirmDelete = async () => {
    if (!attractionToDelete) return;

    await onDelete(attractionToDelete.id);

    setAttractionToDelete(null);
  }

  const countriesCount = useMemo(() => {
    const unique = new Set(attractions.map(a => a.country ?? 'outros'));

    return unique.size;
  }, [attractions]);

  const shouldShowGlobalTotal = countriesCount > 1;
  const globalTotal = useMemo(() => {
    if (!attractions.length) {
      return 0;
    }

    let totalBrl = 0;

    for (const attr of attractions) {
      totalBrl += Number(attr.priceInBRL) || 0;
    }

    return totalBrl;
  }, [attractions]);

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center justify-between gap-4 flex-wrap w-full">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Todas as Atrações
            </h2>

            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {attractions.length} {attractions.length === 1 ? 'item' : 'itens'}
            </span>
          </div>

          {shouldShowGlobalTotal && globalTotal && (
            <div className="flex flex-col text-right">
              <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(globalTotal)}
              </span>
            </div>
          )}
        </div>

        {onBulkUpdate && onToggleDragEnabled === undefined && (
          <button
            onClick={() => setDragEnabled(!isDragEnabled)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${isDragEnabled
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            title={isDragEnabled ? 'Desabilitar reordenação' : 'Habilitar reordenação'}
            aria-pressed={isDragEnabled}
          >
            <GripVertical className="w-4 h-4" />
            {isDragEnabled ? 'Reordenação ativa' : 'Reordenar'}
          </button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-6 animate-pulse" aria-hidden>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[3/2] rounded-2xl bg-gray-200 dark:bg-gray-700 min-h-[120px]" />
            ))}
          </div>
        </div>
      )}
      {!isLoading &&
        (isDragEnabled && onBulkUpdate ? (
          <Suspense
            fallback={
              <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-xl w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[3/2] rounded-2xl bg-gray-200 dark:bg-gray-700" />
                  ))}
                </div>
              </div>
            }
          >
            <AttractionsGridWithDnD
              attractions={attractions}
              onToggleVisited={onToggleVisited}
              onDelete={handleDeleteRequest}
              onEdit={(attraction) => {
                setEditingAttraction(attraction)
                setIsModalOpen(true)
              }}
              emptyTitle="Nenhuma atração encontrada"
              emptyDescription="Comece adicionando sua primeira atração!"
              onReorder={handleReorder}
            />
          </Suspense>
        ) : (
          <AttractionsGrid
            attractions={attractions}
            onToggleVisited={onToggleVisited}
            onDelete={handleDeleteRequest}
            onEdit={(attraction) => {
              setEditingAttraction(attraction)
              setIsModalOpen(true)
            }}
            emptyTitle="Nenhuma atração encontrada"
            emptyDescription="Comece adicionando sua primeira atração!"
          />
        ))}

      {isModalOpen && (
        <Suspense fallback={null}>
          <ModalAttraction
            attraction={editingAttraction}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setEditingAttraction(undefined)
            }}
            onSave={handleSave}
          />
        </Suspense>
      )}

      <ConfirmModal
        isOpen={!!attractionToDelete}
        onClose={() => setAttractionToDelete(null)}
        title="Excluir atração"
        message={
          attractionToDelete ? (
            <>Tem certeza que deseja excluir &quot;{attractionToDelete.name}&quot;?</>
          ) : null
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}