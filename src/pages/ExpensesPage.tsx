import { useState, useMemo, lazy, Suspense } from 'react'
import Plus from 'lucide-react/dist/esm/icons/plus';
import { Link, useSearchParams } from 'react-router-dom'
import X from 'lucide-react/dist/esm/icons/x';
import { PageHeader } from '@/components/ui/PageHeader'
import { CountryFilter } from '@/components/home/CountryFilter'
import { BudgetOriginFilter } from '@/components/expense/BudgetOriginFilter'
import { Fab } from '@/components/ui/Fab'
import { ModalExpense } from '@/components/expense/ModalExpense'
import { useCountry } from '@/contexts/CountryContext'
import { useExpense } from '@/hooks/useExpense'
import { formatDate } from '@/utils/formatters'
import { useToast } from '@/contexts/toast'
import type { Expense } from '@/types/Expense'
import type { BudgetOrigin } from '@/types/Attraction'

const ExpenseList = lazy(() => import('@/components/expense/ExpenseList'))

function toYYYYMMDD(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dateStr.split('T')[0];
}

export default function ExpensesPage() {
  const [searchParams] = useSearchParams();
  const { country } = useCountry();
  const { expenses, isLoading, createExpense, updateExpense, deleteExpense } = useExpense(country);

  const [showModal, setShowModal] = useState(false);
  const [budgetOrigin, setBudgetOrigin] = useState<BudgetOrigin | 'all'>('all');

  const dateFilter = searchParams.get('date');

  const filteredExpenses = useMemo(() => {
    let result = expenses;
    if (dateFilter) {
      result = result.filter((e) => toYYYYMMDD(e.date) === dateFilter);
    }
    if (budgetOrigin !== 'all') {
      result = result.filter((e) => e.budgetOrigin === budgetOrigin);
    }
    return result;
  }, [expenses, budgetOrigin, dateFilter]);

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
        subtitle={dateFilter ? `Filtrando por ${formatDate(dateFilter)}` : 'Registre e acompanhe seus gastos'}
        filter={
          <div className="flex gap-2 flex-wrap md:flex-nowrap items-center">
            {dateFilter && (
              <Link
                to="/expenses"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors"
              >
                <X className="w-4 h-4" />
                Limpar filtro de data
              </Link>
            )}
            <CountryFilter showDayFilter={false} />
            <BudgetOriginFilter value={budgetOrigin} onChange={setBudgetOrigin} />
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 mb-12">
        <Suspense fallback={null}>
          <ExpenseList
            expenses={filteredExpenses}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        </Suspense>
      </main>

      <Fab
        onClick={() => setShowModal(true)}
        icon={<Plus className="w-6 h-6" />}
        label="Adicionar"
      />

      {showModal && (
        <Suspense fallback={null}>
          <ModalExpense
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={async (data) => {
              await handleCreate(data)
              setShowModal(false)
            }}
          />
        </Suspense>
      )}
    </div>
  );
}