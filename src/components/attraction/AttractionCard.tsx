import { memo } from 'react'
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Banknote from 'lucide-react/dist/esm/icons/banknote';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Trash2 from 'lucide-react/dist/esm/icons/trash-2';
import Map from 'lucide-react/dist/esm/icons/map';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';

import { formatCurrency, formatTime, formatDuration } from '@/utils/formatters'
import { ATTRACTION_TYPES, PERIODS, RESERVATION_STATUS } from '@/config/constants'
import type { Attraction } from '@/types/Attraction'


interface AttractionCardProps {
  attraction: Attraction
  onCheckVisited?: (id: number) => void
  onDelete?: (id: number) => void
  onClick?: () => void
  priority?: boolean
}

export const AttractionCard = memo(function AttractionCard({
  attraction,
  onCheckVisited,
  onDelete,
  onClick,
  priority = false
}: AttractionCardProps) {
  const attractionType = ATTRACTION_TYPES[attraction.type]

  if (!attractionType) {
    console.error(`Invalid attraction type: ${attraction.type}`)
    return null
  }

  const isClosedOnVisitDay =
    attraction.closedDays &&
    attraction.dayOfWeek &&
    attraction.closedDays.split(',').map(d => d.trim()).includes(attraction.dayOfWeek)

  const borderClass = isClosedOnVisitDay
    ? 'border-l-red-500'
    : attraction.visited
      ? 'border-l-emerald-500'
      : 'border-l-blue-500'

  const imageSrc = (attraction.thumbnailUrl || attraction.imageUrl || '').trim()

  return (
    <div
      className={`
        relative rounded-2xl shadow-xl overflow-hidden cursor-pointer border-l-4
        select-none [-webkit-tap-highlight-color:transparent]
        ${borderClass}
      `}
      onClick={onClick}
    >
      <div className="relative w-full aspect-[2/1] min-h-[96px] bg-gradient-to-br from-blue-500 to-purple-600">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={attraction.name}
            referrerPolicy="no-referrer"
            loading="eager"
            fetchPriority={priority ? 'high' : 'low'}
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            decoding="async"
            className="absolute inset-0 z-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <span className="text-5xl opacity-30">{attractionType.icon}</span>
          </div>
        )}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/50 to-black/40 pointer-events-none" />
        <div className="absolute inset-0 z-10 p-3 text-white flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-medium text-white/70">
                  #{attraction.order}
                </span>
                <h3 className="font-bold text-base leading-tight truncate drop-shadow-md">
                  {attraction.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-sm text-white/90">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 opacity-90" />
                <span className="truncate">
                  {attraction.region ? `${attraction.region}, ` : ''}
                  {attraction.city}
                </span>
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(attraction.id)
                  }}
                  className="p-2 rounded-xl backdrop-blur-sm bg-white/10 active:bg-red-500/30"
                  aria-label="Excluir"
                >
                  <Trash2 className="w-4 h-4 text-white drop-shadow" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCheckVisited?.(attraction.id)
                }}
                className={`
                  p-2 rounded-xl backdrop-blur-sm transition-all
                  ${attraction.visited
                    ? 'bg-emerald-500/30 active:bg-emerald-500/40'
                    : 'bg-white/10 active:bg-white/20'}
                `}
                aria-label={attraction.visited ? 'Marcar como não visitado' : 'Marcar como visitado'}
              >
                <CheckCircle2
                  className={`w-4 h-4 ${attraction.visited ? 'text-emerald-300' : 'text-white'} drop-shadow`}
                />
              </button>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2 text-white font-medium drop-shadow-sm">
              <Clock className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />
              <span>
                {attraction.openingTime
                  ? `${formatTime(attraction.openingTime)}${attraction.closingTime ? ` – ${formatTime(attraction.closingTime)}` : ''}`
                  : '24h'}
                {attraction.duration ? ` · ${formatDuration(attraction.duration)}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Banknote className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
              {attraction.couplePrice ? (
                <>
                  <span className="font-semibold text-emerald-300 drop-shadow-sm">
                    {formatCurrency(attraction.couplePrice, attraction.currency)}
                  </span>
                  <span className="text-white/80 text-xs">
                    ({formatCurrency(attraction.priceInBRL)})
                  </span>
                </>
              ) : (
                <span className="font-semibold text-emerald-300 drop-shadow-sm">
                  Gratuito
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {isClosedOnVisitDay && (
              <span className="px-2 py-1 bg-red-500/30 text-red-200 text-xs rounded-md font-medium flex items-center gap-1 backdrop-blur-sm border border-red-400/40">
                <AlertTriangle className="w-3 h-3" />
                Fechado neste dia
              </span>
            )}
            <span className="px-2 py-1 bg-white/15 text-white text-xs rounded-md backdrop-blur-sm">
              {attractionType.label}
            </span>
            {attraction.needsReservation && attraction.reservationStatus && (
              <span className="px-2 py-1 bg-white/15 text-white text-xs rounded-md backdrop-blur-sm flex items-center gap-1">
                {RESERVATION_STATUS[attraction.reservationStatus].icon}
                {RESERVATION_STATUS[attraction.reservationStatus].label}
              </span>
            )}
            {attraction.idealPeriod && (
              <span className="px-2 py-1 bg-blue-500/30 text-blue-200 text-xs rounded-md backdrop-blur-sm">
                {PERIODS[attraction.idealPeriod].label}
              </span>
            )}
          </div>
        </div>
        {(attraction.location || (attraction.lat && attraction.lng)) && (
          <a
            href={
              attraction.location ||
              `https://www.google.com/maps/search/?api=1&query=${attraction.lat},${attraction.lng}`
            }
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-3 right-4 z-20 p-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all touch-manipulation"
            title="Abrir no mapa"
            aria-label="Abrir no mapa"
          >
            <Map className="w-4 h-4 drop-shadow pointer-events-none" />
          </a>
        )}
      </div>
    </div>
  )
})