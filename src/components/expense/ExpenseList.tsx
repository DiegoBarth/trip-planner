import { useState, useMemo } from 'react'
import Receipt from 'lucide-react/dist/esm/icons/receipt';
import { ExpenseCard } from '@/components/expense/ExpenseCard'
import { ModalExpense } from '@/components/expense/ModalExpense'
import { ExpenseActionsModal } from '@/components/expense/ExpenseActionsModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, dateToInputFormat } from '@/utils/formatters'
import { COUNTRIES } from '@/config/constants'
import type { Expense } from '@/types/Expense'

const COUNTRY_DISPLAY_ORDER = ['japan', 'south-korea', 'general', 'outros'];

interface ExpenseListProps {
  expenses: Expense[]
  onUpdate: (expense: Expense) => void
  onCreate: (expense: Omit<Expense, 'id'>) => void
  onDelete: (id: number) => void
  isLoading?: boolean
}

export function ExpenseList({ expenses, onUpdate, onCreate, onDelete, isLoading = false }: ExpenseListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [expenseForActions, setExpenseForActions] = useState<Expense | null>(null);

  const { groupedByCountry, orderedCountryKeys } = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const country = expense.country ?? 'outros';

      if (!acc[country]) acc[country] = [];

      acc[country].push(expense);

      return acc;
    }, {} as Record<string, Expense[]>);

    const parseDate = (d: string) => {
      const s = dateToInputFormat(d || '');

      return s ? new Date(s).getTime() : 0;
    };

    Object.values(grouped).forEach((list) => {
      list.sort((a, b) => parseDate(a.date) - parseDate(b.date))
    });

    const ordered = [
      ...COUNTRY_DISPLAY_ORDER.filter((k) => grouped[k]),
      ...Object.keys(grouped).filter((k) => !COUNTRY_DISPLAY_ORDER.includes(k)).sort(),
    ];

    return { groupedByCountry: grouped, orderedCountryKeys: ordered };
  }, [expenses]);

  const handleCardClick = (expense: Expense) => {
    setExpenseForActions(expense);
  };

  const handleOpenEditFromActions = (expense: Expense) => {
    setExpenseForActions(null);
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleOpenDeleteFromActions = (expense: Expense) => {
    setExpenseForActions(null);
    setExpenseToDelete(expense);
  };

  const handleCloseModal = () => {
    setEditingExpense(undefined);
    setIsModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (!expenseToDelete) return;

    await onDelete(expenseToDelete.id);

    setExpenseToDelete(null);
  };

  const handleSave = async (data: Omit<Expense, 'id'>) => {
    if (editingExpense) {
      await Promise.resolve(onUpdate({ ...data, id: editingExpense.id } as Expense));
    }
    else {
      await Promise.resolve(onCreate(data));
    }
  };

  if (isLoading) return null;

  const totalBRL = expenses.reduce((sum, e) => sum + (e.amountInBRL ?? 0), 0);
  const hasExpenses = expenses.length > 0;

  return (
    <div>
      {hasExpenses && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-900/30 dark:to-orange-900/30 border border-rose-100 dark:border-rose-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-rose-700 dark:text-rose-300" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total em gastos</p>
              <p className="text-xl font-bold text-rose-700 tabular-nums">
                {formatCurrency(totalBRL)}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {orderedCountryKeys.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="Nenhum gasto encontrado"
            description="Comece registrando seu primeiro gasto!"
          />
        ) : (
          orderedCountryKeys.map((country) => {
            const countryExpenses = groupedByCountry[country];
            const countryConfig = COUNTRIES[country as keyof typeof COUNTRIES];
            const countryName = countryConfig?.name ?? (country === 'outros' ? 'Outros' : country);
            const countryFlag = countryConfig?.flag ?? '🌍';
            const sectionTotal = countryExpenses.reduce(
              (s, e) => s + (e.amountInBRL ?? 0),
              0
            );

            if (!countryExpenses?.length) return null;

            return (
              <section key={country} className="space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                    <span className="text-xl" aria-hidden>
                      {countryFlag}
                    </span>
                    <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {countryName}
                    </h2>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {countryExpenses.length}{' '}
                      {countryExpenses.length === 1 ? 'gasto' : 'gastos'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-rose-800 dark:text-rose-300 tabular-nums">
                    {formatCurrency(sectionTotal)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {countryExpenses.map(expense => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>
              </section>
            )
          })
        )}
      </div>

      <ModalExpense
        expense={editingExpense}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      <ExpenseActionsModal
        expense={expenseForActions}
        isOpen={!!expenseForActions}
        onClose={() => setExpenseForActions(null)}
        onEdit={handleOpenEditFromActions}
        onDelete={handleOpenDeleteFromActions}
      />

      <ConfirmModal
        isOpen={!!expenseToDelete}
        onClose={() => setExpenseToDelete(null)}
        title="Excluir gasto"
        message={
          expenseToDelete ? (
            <>Tem certeza que deseja excluir este gasto ({formatCurrency(expenseToDelete.amount, expenseToDelete.currency)})?</>
          ) : null
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}