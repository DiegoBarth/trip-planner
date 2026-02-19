import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { ExpenseList } from '@/components/expense/ExpenseList'
import { PageHeader } from '@/components/ui/PageHeader'
import { CountryFilter } from '@/components/home/CountryFilter'
import { BudgetOriginFilter } from '@/components/expense/BudgetOriginFilter'
import { Fab } from '@/components/ui/Fab'
import { ModalExpense } from '@/components/expense/ModalExpense'
import { useExpense } from '@/hooks/useExpense'
import { useToast } from '@/contexts/toast'
import { useCountry } from '@/contexts/CountryContext'
import type { Expense } from '@/types/Expense'
import type { BudgetOrigin } from '@/types/Attraction'

export function ExpensesPage() {
  const [showModal, setShowModal] = useState(false);
  const [budgetOrigin, setBudgetOrigin] = useState<BudgetOrigin | 'all'>('all');
  const { country, expenses, isReady } = useCountry();

  const filteredExpenses = useMemo(() => {
    if (budgetOrigin === 'all') return expenses;

    return expenses.filter((e) => e.budgetOrigin === budgetOrigin);
  }, [expenses, budgetOrigin]);

  const { createExpense, updateExpense, deleteExpense } = useExpense(country);
  const toast = useToast();

  const handleCreate = async (data: Omit<Expense, 'id'>) => {
    try {
      await createExpense(data);

      toast.success('Gasto criado com sucesso!');
    }
    catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Erro ao criar gasto');
    }
  };

  const handleUpdate = async (expense: Expense) => {
    try {
      await updateExpense(expense);

      toast.success('Gasto atualizado com sucesso!');
    }
    catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Erro ao atualizar gasto');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteExpense(id);

      toast.success('Gasto excluído com sucesso!');
    }
    catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Erro ao excluir gasto');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
      <PageHeader
        title="Gastos"
        subtitle="Registre e acompanhe seus gastos"
        filter={
          <div className="flex gap-2 flex-wrap md:flex-nowrap">
            <CountryFilter showDayFilter={false} />
            <BudgetOriginFilter value={budgetOrigin} onChange={setBudgetOrigin} />
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 mb-12">
        <ExpenseList
          expenses={filteredExpenses}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          isLoading={!isReady}
        />
      </main>

      <Fab
        onClick={() => setShowModal(true)}
        icon={<Plus className="w-6 h-6" />}
        label="Adicionar"
      />

      {showModal && (
        <ModalExpense
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