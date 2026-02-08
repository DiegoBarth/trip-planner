import { useState } from 'react'
import type { Budget } from '@/types/Budget'
import type { BudgetOrigin } from '@/types/Attraction'
import { BUDGET_ORIGINS } from '@/config/constants'
import { ModalBase } from '@/components/ui/ModalBase'

interface ModalBudgetProps {
  budget?: Budget
  isOpen: boolean
  onClose: () => void
  onSave: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function ModalBudget({ budget, isOpen, onClose, onSave }: ModalBudgetProps) {
  const [formData, setFormData] = useState<Partial<Budget>>({
    origin: budget?.origin || 'diego',
    description: budget?.description || '',
    amount: budget?.amount || 0,
    type: budget?.type || 'income',
    date: budget?.date || new Date().toISOString().split('T')[0]
  })

  const handleChange = (field: keyof Budget, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = () => {
    onSave(formData as Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>)
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={budget ? 'Editar Orçamento' : 'Novo Orçamento'}
      type={budget ? 'edit' : 'create'}
      onSave={handleSubmit}
      size="md"
    >
      <div className="space-y-6">
          {/* Origem do Orçamento */}
          <div>
            <label className="block text-sm font-medium mb-2">Origem do Orçamento *</label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.entries(BUDGET_ORIGINS) as [BudgetOrigin, typeof BUDGET_ORIGINS[BudgetOrigin]][]).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleChange('origin', key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.origin === key
                      ? 'border-current shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{
                    borderColor: formData.origin === key ? config.color : undefined,
                    backgroundColor: formData.origin === key ? `${config.color}10` : undefined
                  }}
                >
                  <div className="text-3xl mb-2">{config.icon}</div>
                  <div 
                    className="font-semibold"
                    style={{ color: formData.origin === key ? config.color : undefined }}
                  >
                    {config.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium mb-2">Tipo *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('type', 'income')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'income'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">💰</div>
                <div className={`font-semibold ${formData.type === 'income' ? 'text-green-700' : 'text-gray-700'}`}>
                  Receita
                </div>
                <p className="text-xs text-gray-500 mt-1">Adicionar dinheiro</p>
              </button>

              <button
                type="button"
                onClick={() => handleChange('type', 'adjustment')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  formData.type === 'adjustment'
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-3xl mb-2">⚖️</div>
                <div className={`font-semibold ${formData.type === 'adjustment' ? 'text-blue-700' : 'text-gray-700'}`}>
                  Ajuste
                </div>
                <p className="text-xs text-gray-500 mt-1">Correção de saldo</p>
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium mb-2">Descrição *</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Ex: Orçamento inicial da viagem"
            />
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Valor (R$) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange('amount', Number(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Data *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Preview */}
          {formData.amount && formData.amount > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {BUDGET_ORIGINS[formData.origin as BudgetOrigin].icon}
                  </span>
                  <div>
                    <p className="font-semibold">{formData.description || 'Sem descrição'}</p>
                    <p className="text-sm text-gray-500">
                      {BUDGET_ORIGINS[formData.origin as BudgetOrigin].label} • 
                      {formData.type === 'income' ? ' Receita' : ' Ajuste'}
                    </p>
                  </div>
                </div>
                <p 
                  className="text-2xl font-bold"
                  style={{ color: BUDGET_ORIGINS[formData.origin as BudgetOrigin].color }}
                >
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.amount)}
                </p>
              </div>
            </div>
          )}

      </div>
    </ModalBase>
  )
}
