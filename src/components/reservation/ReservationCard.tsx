import { useState } from 'react'
import { Edit2, Trash2, ExternalLink, FileText, MapPin, Calendar, Clock } from 'lucide-react'
import type { Reservation } from '@/types/Reservation'
import { RESERVATION_TYPES, BOOKING_STATUS } from '@/config/constants'
import { formatDate } from '@/utils/formatters'

interface ReservationCardProps {
  reservation: Reservation
  onEdit: () => void
  onDelete: (id: number) => void
}

export function ReservationCard({ reservation, onEdit, onDelete }: ReservationCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const typeConfig = RESERVATION_TYPES[reservation.type]
  const statusConfig = BOOKING_STATUS[reservation.status]

  const handleDelete = async () => {
    if (window.confirm(`Tem certeza que deseja excluir "${reservation.title}"?`)) {
      setIsDeleting(true)
      try {
        await onDelete(reservation.id)
      } catch (error) {
        console.error('Error deleting reservation:', error)
        setIsDeleting(false)
      }
    }
  }

  const formatDateRange = () => {
    if (!reservation.date) return null
    if (reservation.endDate) {
      return `${formatDate(reservation.date)} - ${formatDate(reservation.endDate)}`
    }
    return formatDate(reservation.date)
  }

  return (
    <div
      className={`relative bg-white rounded-lg border-2 p-4 transition-all hover:shadow-lg ${
        isDeleting ? 'opacity-50 pointer-events-none' : ''
      }`}
      style={{ borderColor: typeConfig.color }}
    >
      {/* Status badge */}
      <div
        className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold text-white"
        style={{ backgroundColor: statusConfig.color }}
      >
        {statusConfig.label}
      </div>

      {/* Type indicator */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
          style={{ backgroundColor: typeConfig.color }}
        >
          {typeConfig.icon}
        </div>
        <div className="flex-1">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {typeConfig.label}
          </span>
          <h3 className="text-lg font-bold text-gray-900">
            {reservation.title}
          </h3>
        </div>
      </div>

      {/* Description */}
      {reservation.description && (
        <p className="text-sm text-gray-600 mb-3">
          {reservation.description}
        </p>
      )}

      {/* Details */}
      <div className="space-y-2 mb-3">
        {/* Date */}
        {reservation.date && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDateRange()}</span>
          </div>
        )}

        {/* Time */}
        {reservation.time && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{reservation.time}</span>
          </div>
        )}

        {/* Location */}
        {reservation.location && (
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="line-clamp-1">{reservation.location}</span>
          </div>
        )}

        {/* Provider */}
        {reservation.provider && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Provedor:</span> {reservation.provider}
          </div>
        )}

        {/* Confirmation code */}
        {reservation.confirmationCode && (
          <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200">
            <span className="font-medium text-gray-700">Código:</span>{' '}
            <span className="font-bold text-gray-900">{reservation.confirmationCode}</span>
          </div>
        )}
      </div>

      {/* Links */}
      {(reservation.bookingUrl || reservation.documentUrl) && (
        <div className="flex gap-2 mb-3">
          {reservation.bookingUrl && (
            <a
              href={reservation.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
              Reserva
            </a>
          )}
          {reservation.documentUrl && (
            <a
              href={reservation.documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 rounded hover:bg-purple-100 transition-colors"
            >
              <FileText className="w-3 h-3" />
              Documento
            </a>
          )}
        </div>
      )}

      {/* Notes */}
      {reservation.notes && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-200 mb-3">
          {reservation.notes}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={onEdit}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
          Editar
        </button>
        <button
          onClick={handleDelete}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Excluir
        </button>
      </div>
    </div>
  )
}
