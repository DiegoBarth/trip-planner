import { useState } from 'react'
import type { Expense, ExpenseCategory } from '@/types/Expense'
import type { BudgetOrigin, Currency } from '@/types/Attraction'
import { EXPENSE_CATEGORIES, BUDGET_ORIGINS, COUNTRIES } from '@/config/constants'
import { convertToBRL } from '@/utils/formatters'
import { ModalBase } from '@/components/ui/ModalBase'
import { CustomSelect } from '@/components/ui/CustomSelect'

interface ModalExpenseProps {
  expense?: Expense
  isOpen: boolean
  onClose: () => void
  onSave: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function ModalExpense({ expense, isOpen, onClose, onSave }: ModalExpenseProps) {
  const [formData, setFormData] = useState<Partial<Expense>>({
    category: expense?.category || 'food',
    description: expense?.description || '',
    amount: expense?.amount || 0,
    currency: expense?.currency || 'BRL',
    amountInBRL: expense?.amountInBRL || 0,
    budgetOrigin: expense?.budgetOrigin || 'couple',
    date: expense?.date || new Date().toISOString().split('T')[0],
    country: expense?.country,
    attractionId: expense?.attractionId,
    notes: expense?.notes || '',
    receiptUrl: expense?.receiptUrl || ''
  })

  const handleChange = (field: keyof Expense, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-calculate BRL amount when amount or currency changes
      if (field === 'amount' || field === 'currency') {
        const amount = field === 'amount' ? value : updated.amount || 0
        const currency = field === 'currency' ? value : updated.currency || 'BRL'
        updated.amountInBRL = convertToBRL(amount, currency as Currency)
      }

      return updated
    })
  }

  const handleSubmit = () => {
    onSave(formData as Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>)
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={expense ? 'Editar Gasto' : 'Novo Gasto'}
      type={expense ? 'edit' : 'create'}
      onSave={handleSubmit}
      size="lg"
    >
      <div className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2">Categoria *</label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(EXPENSE_CATEGORIES) as [ExpenseCategory, typeof EXPENSE_CATEGORIES[ExpenseCategory]][]).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('category', key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.category === key
                      ? 'border-red-500 bg-red-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{config.icon}</div>
                  <div className={`font-semibold text-sm ${formData.category === key ? 'text-red-700' : 'text-gray-700'}`}>
                    {config.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Descrição *</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Ex: Almoço no restaurante"
            />
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Valor *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Moeda *</label>
              <CustomSelect
                value={formData.currency === 'BRL' ? 'R$ Real (BRL)' : formData.currency === 'JPY' ? '¥ Iene (JPY)' : '₩ Won (KRW)'}
                onChange={(val) => {
                  const currencyMap: Record<string, Currency> = {
                    'R$ Real (BRL)': 'BRL',
                    '¥ Iene (JPY)': 'JPY',
                    '₩ Won (KRW)': 'KRW'
                  }
                  handleChange('currency', currencyMap[val])
                }}
                options={['R$ Real (BRL)', '¥ Iene (JPY)', '₩ Won (KRW)']}
              />
            </div>
          </div>

          {/* Converted amount preview */}
          {formData.currency !== 'BRL' && formData.amount && formData.amount > 0 && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <span className="text-sm text-blue-700">Valor em reais: </span>
              <span className="font-bold text-blue-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.amountInBRL || 0)}
              </span>
            </div>
          )}

          {/* Budget Origin */}
          <div>
            <label className="block text-sm font-medium mb-2">Origem do Pagamento *</label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(BUDGET_ORIGINS) as [BudgetOrigin, typeof BUDGET_ORIGINS[BudgetOrigin]][]).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('budgetOrigin', key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.budgetOrigin === key
                      ? 'border-current shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    borderColor: formData.budgetOrigin === key ? config.color : undefined,
                    backgroundColor: formData.budgetOrigin === key ? `${config.color}10` : undefined
                  }}
                >
                  <div className="text-2xl mb-1">{config.icon}</div>
                  <div 
                    className="font-semibold text-sm"
                    style={{ color: formData.budgetOrigin === key ? config.color : undefined }}
                  >
                    {config.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Date and Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Data *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">País</label>
              <CustomSelect
                value={formData.country ? `${COUNTRIES[formData.country].flag} ${COUNTRIES[formData.country].name}` : ''}
                onChange={(val) => {
                  if (!val) {
                    handleChange('country', undefined)
                    return
                  }
                  const countryKey = Object.entries(COUNTRIES).find(([_, c]) => `${c.flag} ${c.name}` === val)?.[0]
                  if (countryKey) handleChange('country', countryKey)
                }}
                options={['', ...Object.entries(COUNTRIES).map(([_, country]) => `${country.flag} ${country.name}`)].filter(Boolean)}
                placeholder="Selecione o país"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Observações</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
              placeholder="Anotações adicionais sobre este gasto..."
            />
          </div>

          {/* Preview */}
          {formData.amount && formData.amount > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {EXPENSE_CATEGORIES[formData.category as ExpenseCategory].icon}
                  </span>
                  <div>
                    <p className="font-semibold">{formData.description || 'Sem descrição'}</p>
                    <p className="text-sm text-gray-500">
                      {EXPENSE_CATEGORIES[formData.category as ExpenseCategory].label} • 
                      {BUDGET_ORIGINS[formData.budgetOrigin as BudgetOrigin].icon} {BUDGET_ORIGINS[formData.budgetOrigin as BudgetOrigin].label}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-red-600">
                    {formData.currency === 'BRL' ? '¥' : formData.currency === 'JPY' ? '¥' : '₩'} {formData.amount.toLocaleString('pt-BR')}
                  </p>
                  {formData.currency !== 'BRL' && (
                    <p className="text-sm text-gray-500">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.amountInBRL || 0)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

      </div>
    </ModalBase>
  )
}
