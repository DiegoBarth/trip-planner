import { useState } from 'react'
import { Pencil, Trash2, ExternalLink, FileText, MapPin, Calendar, Clock } from 'lucide-react'
import type { Reservation } from '@/types/Reservation'
import { RESERVATION_TYPES, BOOKING_STATUS, COUNTRIES } from '@/config/constants'
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
      return `${formatDate(reservation.date)} – ${formatDate(reservation.endDate)}`
    }
    return formatDate(reservation.date)
  }

  return (
    <div
      className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-all hover:shadow-lg ${
        isDeleting ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Faixa superior por tipo - identidade da tela de reservas */}
      <div
        className="h-1"
        style={{ backgroundColor: typeConfig.color }}
      />

      <div className="p-4">
        {/* Linha 1: ícone + tipo + status + ações */}
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${typeConfig.color}20` }}
            >
              {typeConfig.icon}
            </div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {typeConfig.label}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span
              className="px-2 py-0.5 rounded-md text-xs font-semibold text-white"
              style={{ backgroundColor: statusConfig.color }}
            >
              {statusConfig.label}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Editar"
              aria-label="Editar"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete() }}
              className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Excluir"
              aria-label="Excluir"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Linha 2: título em uma linha (rolagem horizontal se muito longo) */}
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg overflow-x-auto whitespace-nowrap mb-3 pr-1" title={reservation.title}>
          {reservation.title}
        </h3>

        {reservation.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {reservation.description}
          </p>
        )}

        <div className="space-y-1.5 mb-3">
          {reservation.date && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{formatDateRange()}</span>
            </div>
          )}
          {reservation.time && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span>{reservation.time}</span>
            </div>
          )}
          {(reservation.location || (reservation.country && reservation.country !== 'all')) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {reservation.location && (
                <span className="line-clamp-1">{reservation.location}</span>
              )}
              <span className="whitespace-nowrap"> - </span>
              {reservation.country && reservation.country !== 'all' && COUNTRIES[reservation.country] && (
                <span className="whitespace-nowrap">
                  {COUNTRIES[reservation.country].name}
                </span>
              )}
            </div>
          )}
          {reservation.provider && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Provedor:</span> {reservation.provider}
            </p>
          )}
          {reservation.confirmationCode && (
            <p className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded-md inline-block">
              {reservation.confirmationCode}
            </p>
          )}
        </div>

        {(reservation.bookingUrl || reservation.documentUrl) && (
          <div className="flex flex-wrap gap-2 mb-3">
            {reservation.bookingUrl && (
              <a
                href={reservation.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
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
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <FileText className="w-3 h-3" />
                Documento
              </a>
            )}
          </div>
        )}

        {reservation.notes && (
          <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
            {reservation.notes}
          </p>
        )}
      </div>
    </div>
  )
}
