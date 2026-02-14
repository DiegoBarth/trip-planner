import { useState } from 'react'
import { Edit2, Trash2, Package } from 'lucide-react'
import type { ChecklistItem } from '@/types/ChecklistItem'
import { CHECKLIST_CATEGORIES } from '@/config/constants'

interface ChecklistCardProps {
  item: ChecklistItem
  onEdit: () => void
  onDelete: (id: number) => void
  onTogglePacked: (id: number, isPacked: boolean) => void
}

export function ChecklistCard({ item, onEdit, onDelete, onTogglePacked }: ChecklistCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const category = CHECKLIST_CATEGORIES[item.category]

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir "${item.description}"?`)) {
      setIsDeleting(true)
      try {
        await onDelete(item.id)
      } catch (error) {
        console.error('Error deleting item:', error)
        setIsDeleting(false)
      }
    }
  }

  const handleToggle = async () => {
    try {
      await onTogglePacked(item.id, !item.isPacked)
    } catch (error) {
      console.error('Error toggling item:', error)
    }
  }

  return (
    <div
      className={`relative bg-white rounded-lg border-2 p-4 transition-all hover:shadow-md ${
        item.isPacked
          ? 'border-green-300 bg-green-50 opacity-75'
          : 'border-gray-200 hover:border-gray-300'
      } ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {/* Header with checkbox and actions */}
      <div className="flex items-start gap-3 mb-2">
        {/* Checkbox */}
        <button
          onClick={handleToggle}
          className={`flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
            item.isPacked
              ? 'bg-green-500 border-green-500'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {item.isPacked && (
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7"></path>
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Category badge */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{category.icon}</span>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {category.label}
            </span>
          </div>

          {/* Description */}
          <h3
            className={`text-base font-semibold mb-1 ${
              item.isPacked ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}
          >
            {item.description}
          </h3>

          {/* Quantity */}
          {item.quantity && item.quantity > 1 && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
              <Package className="w-4 h-4" />
              <span>Quantidade: {item.quantity}</span>
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {item.notes}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Editar"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Excluir"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Packed badge */}
      {item.isPacked && (
        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          ✓ Empacotado
        </div>
      )}
    </div>
  )
}
