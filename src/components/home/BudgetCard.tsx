import { Wallet, TrendingDown, TrendingUp } from 'lucide-react'
import { BUDGET_ORIGINS } from '@/config/constants'
import { formatCurrency } from '@/utils/formatters'

interface BudgetCardProps {
  origin: 'diego' | 'pamela' | 'couple'
  total: number
  spent: number
  remaining: number
}

export function BudgetCard({ origin, total, spent, remaining }: BudgetCardProps) {
  const config = BUDGET_ORIGINS[origin]
  const percentSpent = (spent / total) * 100

  return (
    <div 
      className="rounded-lg p-4 shadow-md border-2 transition-all hover:shadow-lg"
      style={{ borderColor: config.color }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <h3 className="font-semibold text-lg">{config.label}</h3>
        </div>
        <Wallet className="w-5 h-5 text-gray-400" />
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-gray-600">Total</span>
          <span className="text-lg font-bold" style={{ color: config.color }}>
            {formatCurrency(total)}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <TrendingDown className="w-3 h-3" />
            Gasto
          </span>
          <span className="text-sm text-red-600 font-medium">
            {formatCurrency(spent)}
          </span>
        </div>

        <div className="flex justify-between items-baseline">
          <span className="text-sm text-gray-600 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Restante
          </span>
          <span className="text-sm text-green-600 font-medium">
            {formatCurrency(remaining)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
          <div
            className="h-2 rounded-full transition-all"
            style={{
              width: `${Math.min(percentSpent, 100)}%`,
              backgroundColor: config.color
            }}
          />
        </div>
        <p className="text-xs text-gray-500 text-right">
          {percentSpent.toFixed(1)}% utilizado
        </p>
      </div>
    </div>
  )
}
