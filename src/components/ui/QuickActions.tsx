import { Link } from 'react-router-dom'
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Ticket from 'lucide-react/dist/esm/icons/ticket';
import TrendingDown from 'lucide-react/dist/esm/icons/trending-down';
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up';
import { cn } from '@/lib/utils'

interface QuickAction {
  to: string
  icon: typeof DollarSign
  label: string
  color: string
  darkColor: string
  bgColor: string
  hoverColor: string
}

/* Cores com contraste WCAG AA: texto mais escuro no claro, mais claro no escuro */
const quickActions: QuickAction[] = [
  {
    to: '/budgets',
    icon: TrendingUp,
    label: 'Orçamento',
    color: 'text-emerald-800',
    darkColor: 'dark:text-emerald-300',
    bgColor: 'bg-emerald-100',
    hoverColor: 'hover:bg-emerald-100',
  },
  {
    to: '/expenses',
    icon: TrendingDown,
    label: 'Gastos',
    color: 'text-rose-800',
    darkColor: 'dark:text-rose-300',
    bgColor: 'bg-rose-100',
    hoverColor: 'hover:bg-rose-100',
  },
  {
    to: '/attractions',
    icon: Plus,
    label: 'Atrações',
    color: 'text-purple-700',
    darkColor: 'dark:text-purple-300',
    bgColor: 'bg-purple-100',
    hoverColor: 'hover:bg-purple-100',
  },
  {
    to: '/reservations',
    icon: Ticket,
    label: 'Reservas',
    color: 'text-indigo-700',
    darkColor: 'dark:text-indigo-300',
    bgColor: 'bg-indigo-100',
    hoverColor: 'hover:bg-indigo-100',
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {quickActions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.to}
            to={action.to}
            className={cn(
              'flex flex-col items-center justify-center gap-3 p-4 rounded-2xl',
              'transition-all duration-200 active:scale-95',
              action.bgColor,
              action.hoverColor,
              'dark:bg-gray-800 dark:border dark:border-gray-700',
              'focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none'
            )}
          >
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              'bg-white dark:bg-gray-700 shadow-sm',
              action.color,
              action.darkColor
            )}>
              <Icon className="w-6 h-6" />
            </div>
            <span className={cn('text-sm font-semibold', action.color, action.darkColor)}>
              {action.label}
            </span>
          </Link>
        )
      })}
    </div>
  );
}