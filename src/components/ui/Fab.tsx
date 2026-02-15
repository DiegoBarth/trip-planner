import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

interface FabProps {
  onClick: () => void
  icon?: ReactNode
  label?: string
  className?: string
}

export function Fab({ onClick, icon, label, className }: FabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-20 right-4 md:bottom-6 md:right-6',
        'flex items-center gap-2 px-4 py-4 rounded-full',
        'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
        'shadow-lg hover:shadow-xl active:scale-95',
        'transition-all duration-200',
        'focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none',
        'z-40',
        className
      )}
      aria-label={label || 'Adicionar'}
    >
      {icon || <Plus className="w-6 h-6" />}
      {label && (
        <span className="font-medium pr-2">{label}</span>
      )}
    </button>
  )
}
