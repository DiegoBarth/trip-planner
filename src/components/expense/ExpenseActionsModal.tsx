import { useEffect } from 'react'
import X from 'lucide-react/dist/esm/icons/x';
import Pencil from 'lucide-react/dist/esm/icons/pencil';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { formatCurrency } from '@/utils/formatters'
import { BUDGET_ORIGINS, COUNTRIES, getBudgetOriginFromLabel } from '@/config/constants'
import type { Expense } from '@/types/Expense'

interface ExpenseActionsModalProps {
  expense: Expense | null
  isOpen: boolean
  onClose: () => void
  onEdit: (expense: Expense) => void
  onDelete: (expense: Expense) => void
}

export function ExpenseActionsModal({ expense, isOpen, onClose, onEdit, onDelete }: ExpenseActionsModalProps) {
  const trapRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    document.addEventListener('keydown', handleEscape);

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  if (!expense) return null;

  const originKey = BUDGET_ORIGINS[expense.budgetOrigin as keyof typeof BUDGET_ORIGINS]
    ? expense.budgetOrigin
    : getBudgetOriginFromLabel(expense.budgetOrigin as string);

  const originConfig = BUDGET_ORIGINS[originKey as keyof typeof BUDGET_ORIGINS];
  const countryConfig = expense.country && COUNTRIES[expense.country];

  const handleEdit = () => {
    onClose();
    onEdit(expense);
  };

  const handleDelete = () => {
    onClose();
    onDelete(expense);
  };

  return (
    <div
      className="fixed inset-0 z-[600] flex justify-center items-end md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="expense-actions-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={trapRef}
        className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl shadow-2xl flex flex-col"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="expense-actions-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate pr-2"
          >
            {expense.description}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-3 flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {formatCurrency(expense.amount, expense.currency)}
          </span>
          {originConfig && (
            <span className="flex items-center gap-1.5">
              <span>{originConfig.icon}</span>
              <span>{originConfig.label}</span>
            </span>
          )}
          {countryConfig && (
            <span className="flex items-center gap-1.5">
              <span>{countryConfig.flag}</span>
              <span>{countryConfig.name}</span>
            </span>
          )}
        </div>
        <div className="flex gap-3 px-4 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <Pencil className="w-4 h-4" />
            Editar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}