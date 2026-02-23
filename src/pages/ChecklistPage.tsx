import { useState } from 'react'
import Plus from 'lucide-react/dist/esm/icons/plus';
import { ChecklistList } from '@/components/checklist/ChecklistList'
import { PageHeader } from '@/components/ui/PageHeader'
import { Fab } from '@/components/ui/Fab'
import { useChecklist } from '@/hooks/useChecklist'
import { useCountry } from '@/contexts/CountryContext'
import { useToast } from '@/contexts/toast'
import { ModalChecklistItem } from '@/components/checklist/ModalChecklistItem'
import type { ChecklistItem } from '@/types/ChecklistItem'

export default function ChecklistPage() {
  const [showModal, setShowModal] = useState(false);
  const { checklistItems: items, isReady } = useCountry();
  const { createItem, updateItem, deleteItem, togglePacked } = useChecklist();
  const toast = useToast();

  const handleCreate = async (data: Omit<ChecklistItem, 'id'>) => {
    try {
      await createItem(data);
      toast.success('Item adicionado com sucesso!');
    } catch (error) {
      console.error('Error creating checklist item:', error);
      toast.error('Erro ao adicionar item');
    }
  };

  const handleUpdate = async (item: ChecklistItem) => {
    try {
      await updateItem(item);

      toast.success('Item atualizado com sucesso!');
    }
    catch (error) {
      console.error('Error updating checklist item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteItem(id);

      toast.success('Item excluído com sucesso!');
    }
    catch (error) {
      console.error('Error deleting checklist item:', error);
      toast.error('Erro ao excluir item');
    }
  };

  const handleTogglePacked = async (id: number, isPacked: boolean) => {
    try {
      await togglePacked({ id, isPacked });

      if (isPacked) {
        toast.success('Item marcado como empacotado!');
      }
      else {
        toast.success('Item desmarcado!');
      }
    }
    catch (error) {
      console.error('Error toggling checklist item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
      <PageHeader
        title="Checklist"
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 mb-12">
        <ChecklistList
          items={items}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onTogglePacked={handleTogglePacked}
          isLoading={!isReady}
        />
      </main>

      <Fab
        onClick={() => setShowModal(true)}
        icon={<Plus className="w-6 h-6" />}
        label="Adicionar"
      />

      {showModal && (
        <ModalChecklistItem
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await handleCreate(data as any)
            setShowModal(false)
          }}
        />
      )}
    </div>
  );
}