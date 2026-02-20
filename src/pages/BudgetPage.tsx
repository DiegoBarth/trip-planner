import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { BudgetList } from '@/components/budget/BudgetList'
import { PageHeader } from '@/components/ui/PageHeader'
import { BudgetOriginFilter } from '@/components/expense/BudgetOriginFilter'
import { Fab } from '@/components/ui/Fab'
import { ModalBudget } from '@/components/budget/ModalBudget'
import { useBudget } from '@/hooks/useBudget'
import { useCountry } from '@/contexts/CountryContext'
import { useToast } from '@/contexts/toast'
import type { BudgetOrigin } from '@/types/Attraction'
import type { CreateBudgetPayload, UpdateBudgetPayload } from '@/api/budget'

export default function BudgetPage() {
  const [showModal, setShowModal] = useState(false);
  const [budgetOrigin, setBudgetOrigin] = useState<BudgetOrigin | 'all'>('all');
  const { createBudget, updateBudget, deleteBudget } = useBudget();
  const { budgets, isReady } = useCountry();
  const toast = useToast();

  const filteredBudgets = useMemo(() => {
    if (budgetOrigin === 'all') return budgets;

    return budgets.filter((b) => b.origin === budgetOrigin);

  }, [budgets, budgetOrigin]);

  const handleCreate = async (payload: CreateBudgetPayload) => {
    try {
      const result = await createBudget(payload);

      toast.success('Orçamento criado com sucesso!');

      return result;
    }
    catch (error) {
      console.error('Error creating budget:', error);
      toast.error('Erro ao criar orçamento');

      throw error;
    }
  };

  const handleUpdate = async (payload: UpdateBudgetPayload) => {
    try {
      const result = await updateBudget(payload);

      toast.success('Orçamento atualizado com sucesso!');

      return result;
    }
    catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Erro ao atualizar orçamento');

      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteBudget(id);

      toast.success('Orçamento excluído com sucesso!');
    }
    catch (error) {
      console.error('Error deleting budget:', error);

      toast.error('Erro ao excluir orçamento');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
      <PageHeader
        title="Orçamento"
        subtitle="Gerencie o orçamento da sua viagem"
        filter={<BudgetOriginFilter value={budgetOrigin} onChange={setBudgetOrigin} />}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 mb-12">
        <BudgetList
          budgets={filteredBudgets}
          isLoading={!isReady}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      </main>

      <Fab
        onClick={() => setShowModal(true)}
        icon={<Plus className="w-6 h-6" />}
        label="Adicionar"
      />

      {showModal && (
        <ModalBudget
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await handleCreate(data)
            setShowModal(false)
          }}
        />
      )}
    </div>
  );
}