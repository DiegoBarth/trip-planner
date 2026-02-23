import Package from 'lucide-react/dist/esm/icons/package';
import type { ChecklistItem } from '@/types/ChecklistItem'
import { CHECKLIST_CATEGORIES } from '@/config/constants'

interface ChecklistCardProps {
  item: ChecklistItem
  onClick?: (item: ChecklistItem) => void
  onTogglePacked: (id: number, isPacked: boolean) => void
}

export function ChecklistCard({ item, onClick, onTogglePacked }: ChecklistCardProps) {
  const category = CHECKLIST_CATEGORIES[item.category as keyof typeof CHECKLIST_CATEGORIES];
  const color = category?.color ?? '#6b7280';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      onTogglePacked(item.id, !item.isPacked);
    }
    catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(item)}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick(item)
        }
      }}
      className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border-l-4 transition-all ${onClick ? 'cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50' : ''} ${item.isPacked ? 'bg-emerald-50/50 dark:bg-emerald-900/30 border-emerald-400' : ''
        }`}
      style={!item.isPacked ? { borderLeftColor: color } : undefined}
    >
      <div className="p-4">
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            type="button"
            className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none ${item.isPacked
              ? 'bg-emerald-500 border-emerald-500'
              : 'border-gray-300 hover:border-emerald-400'
              }`}
            aria-label={item.isPacked ? 'Desmarcar empacotado' : 'Marcar como empacotado'}
          >
            {item.isPacked && (
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ backgroundColor: `${color}18` }}
          >
            {category?.icon ?? '📦'}
          </div>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-md flex-shrink-0"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {category?.label ?? item.category}
          </span>
          <div className="flex-1 min-w-0" aria-hidden />
          {item.isPacked && (
            <span className="px-2 py-0.5 rounded-md text-xs font-semibold text-white bg-emerald-500 flex-shrink-0">
              ✓ Empacotado
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mt-2 min-w-0">
          <h3
            className={`font-semibold text-gray-900 dark:text-gray-100 truncate min-w-0 flex-1 ${item.isPacked ? 'text-gray-500 dark:text-gray-400 line-through' : ''}`}
            title={item.description}
          >
            {item.description}
          </h3>
        </div>

        {(item.quantity && item.quantity > 1) || item.notes ? (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
            {item.quantity && item.quantity > 1 && (
              <div className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                <span>Quantidade: {item.quantity}</span>
              </div>
            )}
            {item.notes && (
              <p className="line-clamp-2 min-w-0">{item.notes}</p>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}