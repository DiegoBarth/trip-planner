import { useEffect } from 'react'
import { X, Pencil, Trash2 } from 'lucide-react'
import type { Reservation } from '@/types/Reservation'
import { RESERVATION_TYPES, BOOKING_STATUS } from '@/config/constants'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface ReservationActionsModalProps {
  reservation: Reservation | null
  isOpen: boolean
  onClose: () => void
  onEdit: (reservation: Reservation) => void
  onDelete: (reservation: Reservation) => void
}

export function ReservationActionsModal({
  reservation,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ReservationActionsModalProps) {
  const trapRef = useFocusTrap(isOpen)

  useEffect(() => {
    if (!isOpen) return
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null
  if (!reservation) return null

  const typeConfig = RESERVATION_TYPES[reservation.type]
  const statusConfig = BOOKING_STATUS[reservation.status]

  const handleEdit = () => {
    onClose()
    onEdit(reservation)
  }

  const handleDelete = () => {
    onClose()
    onDelete(reservation)
  }

  return (
    <div
      className="fixed inset-0 z-[600] flex justify-center items-end md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-actions-title"
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
            id="reservation-actions-title"
            className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate pr-2"
          >
            {reservation.title}
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
        <div className="px-4 py-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span style={{ color: typeConfig.color }}>{typeConfig.icon}</span>
          <span>{typeConfig.label}</span>
          <span
            className="px-2 py-0.5 rounded-md text-xs font-semibold text-white"
            style={{ backgroundColor: statusConfig.color }}
          >
            {statusConfig.label}
          </span>
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
  )
}
