import ExternalLink from 'lucide-react/dist/esm/icons/external-link';
import FileText from 'lucide-react/dist/esm/icons/file-text';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Hash from 'lucide-react/dist/esm/icons/hash';
import { formatDate } from '@/utils/formatters'
import { RESERVATION_TYPES, BOOKING_STATUS, COUNTRIES } from '@/config/constants'
import type { Reservation } from '@/types/Reservation'

interface ReservationCardProps {
  reservation: Reservation
  onClick?: (reservation: Reservation) => void
}

export function ReservationCard({ reservation, onClick }: ReservationCardProps) {
  const typeConfig = RESERVATION_TYPES[reservation.type];
  const statusConfig = BOOKING_STATUS[reservation.status];

  const formatDateRange = () => {
    if (!reservation.date) return null;

    if (reservation.endDate) {
      return `${formatDate(reservation.date)} – ${formatDate(reservation.endDate)}`;
    }

    return formatDate(reservation.date);
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={() => onClick?.(reservation)}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick(reservation)
        }
      }}
      className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-all ${onClick ? 'cursor-pointer hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50' : ''}`}
    >
      <div
        className="h-1"
        style={{ backgroundColor: typeConfig.color }}
      />

      <div className="p-4">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ backgroundColor: `${typeConfig.color}20` }}
            >
              {typeConfig.icon}
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {typeConfig.label}
            </span>
          </div>
          <span
            className="px-2 py-0.5 rounded-md text-xs font-semibold text-white flex-shrink-0"
            style={{ backgroundColor: statusConfig.color }}
          >
            {statusConfig.label}
          </span>
        </div>
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg overflow-x-auto whitespace-nowrap mb-3 pr-1" title={reservation.title}>
          {reservation.title}
        </h3>

        {reservation.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {reservation.description}
          </p>
        )}

        <div className="space-y-1.5">
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
          {(reservation.location || (reservation.country && reservation.country !== 'general')) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
              <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              {reservation.location && (
                <span className="line-clamp-1">{reservation.location}</span>
              )}
              {reservation.location && reservation.country && reservation.country !== 'general' && ' - '}
              {reservation.country && reservation.country !== 'general' && COUNTRIES[reservation.country] && (
                <span className="whitespace-nowrap">
                  {COUNTRIES[reservation.country].name}
                </span>
              )}
            </div>
          )}
          {reservation.provider && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Provedor:</span>
              <span>{reservation.provider}</span>
            </div>
          )}
          {reservation.confirmationCode && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Hash className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-medium">Código:</span>
              <span className="font-mono">{reservation.confirmationCode}</span>
            </div>
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
      </div>
    </div>
  );
}