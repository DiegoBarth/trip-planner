import { Trash2, Edit2, Calendar, Banknote } from 'lucide-react'
import type { Expense } from '@/types/Expense'
import { EXPENSE_CATEGORIES, BUDGET_ORIGINS, COUNTRIES, getCategoryFromLabel, getBudgetOriginFromLabel } from '@/config/constants'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface ExpenseCardProps {
  expense: Expense
  onEdit?: (expense: Expense) => void
  onDelete?: (id: number) => void
}

export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  // Handle both category key and label from backend
  const categoryKey = EXPENSE_CATEGORIES[expense.category as keyof typeof EXPENSE_CATEGORIES] 
    ? expense.category 
    : getCategoryFromLabel(expense.category as string)
  
  // Handle both budget origin key and label from backend
  const budgetOriginKey = BUDGET_ORIGINS[expense.budgetOrigin as keyof typeof BUDGET_ORIGINS]
    ? expense.budgetOrigin
    : getBudgetOriginFromLabel(expense.budgetOrigin as string)
  
  const categoryConfig = EXPENSE_CATEGORIES[categoryKey as keyof typeof EXPENSE_CATEGORIES]
  const originConfig = BUDGET_ORIGINS[budgetOriginKey as keyof typeof BUDGET_ORIGINS]
  const countryConfig = expense.country ? COUNTRIES[expense.country] : null
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all border-l-4"
      style={{ borderLeftColor: originConfig.color }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-gray-100"
          >
            {categoryConfig.icon}
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-gray-900 leading-tight">
              {expense.description}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span 
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ 
                  backgroundColor: `${originConfig.color}20`,
                  color: originConfig.color 
                }}
              >
                {originConfig.icon} {originConfig.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">
                {categoryConfig.icon} {categoryConfig.label}
              </span>
              {countryConfig && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700">
                  {countryConfig.flag} {countryConfig.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          <button
            onClick={() => onEdit?.(expense)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(expense.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Amount and Date */}
      <div className="flex items-center justify-between pt-3 border-t">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(expense.date)}</span>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <Banknote className="w-4 h-4 text-red-600" />
            <span className="text-xl font-bold text-red-600">
              {formatCurrency(expense.amount, expense.currency)}
            </span>
          </div>
          {expense.currency !== 'BRL' && (
            <p className="text-xs text-gray-500 mt-0.5">
              {formatCurrency(expense.amountInBRL)}
            </p>
          )}
        </div>
      </div>

      {/* Notes */}
      {expense.notes && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm text-gray-600 italic line-clamp-2">
            💭 {expense.notes}
          </p>
        </div>
      )}
    </div>
  )
}
