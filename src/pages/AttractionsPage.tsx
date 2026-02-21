import { useState, useMemo, lazy, Suspense } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader } from '@/components/ui/PageHeader'
import { CountryFilter } from '@/components/home/CountryFilter'
import { Fab } from '@/components/ui/Fab'
import { AttractionsList } from '@/components/attraction/AttractionsList'
import { useAttraction } from '@/hooks/useAttraction'
import { useToast } from '@/contexts/toast'
import { useCountry } from '@/contexts/CountryContext'
import type { Attraction } from '@/types/Attraction'

const ModalAttraction = lazy(() =>
  import('@/components/attraction/ModalAttraction').then((m) => ({ default: m.ModalAttraction }))
)

export default function AttractionsPage() {
  const [showModal, setShowModal] = useState(false);
  const { country, day, attractions, isReady } = useCountry();

  const filteredAttractions = useMemo(() => {
    if (day === 'all') return attractions;

    return attractions.filter((a) => a.day === day);
  }, [attractions, day]);

  const {
    createAttraction,
    updateAttraction,
    deleteAttraction,
    toggleVisited,
    bulkUpdate
  } = useAttraction(country);

  const { success, error } = useToast();

  const handleCreate = async (data: Omit<Attraction, 'id'>) => {
    try {
      await createAttraction(data as any);

      success('Atração criada com sucesso!');
    }
    catch (err) {
      error('Erro ao criar atração');

      console.error(err);
    }
  };

  const handleUpdate = async (attraction: Attraction) => {
    try {
      await updateAttraction(attraction as any);

      success('Atração atualizada com sucesso!');
    }
    catch (err) {
      error('Erro ao atualizar atração');

      console.error(err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAttraction(id);

      success('Atração excluída com sucesso!');
    }
    catch (err) {
      error('Erro ao excluir atração');

      console.error(err);
    }
  };

  const handleToggleVisited = async (id: number) => {
    try {
      await toggleVisited(id);

      success('Status da atração atualizado');
    }
    catch (err) {
      error('Erro ao atualizar atração');

      console.error(err);
    }
  };

  const handleBulkUpdate = async (attractions: Attraction[]) => {
    try {
      await bulkUpdate(attractions);

      success('Atrações reordenadas com sucesso!');
    }
    catch (err) {
      error('Erro ao reordenar atrações');

      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
      <PageHeader
        title="Atrações"
        subtitle="Planeje seus pontos turísticos"
        filter={<CountryFilter hideGeneralOption />}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 mb-12">
        <AttractionsList
          attractions={filteredAttractions}
          isLoading={!isReady}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onToggleVisited={handleToggleVisited}
          onBulkUpdate={handleBulkUpdate}
        />
      </main>

      <Fab
        onClick={() => setShowModal(true)}
        icon={<Plus className="w-6 h-6" />}
        label="Adicionar"
      />

      {showModal && (
        <Suspense fallback={null}>
          <ModalAttraction
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={async (data) => {
              await handleCreate(data as any)
              setShowModal(false)
            }}
          />
        </Suspense>
      )}
    </div>
  );
}