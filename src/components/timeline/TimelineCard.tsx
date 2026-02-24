import { memo } from 'react';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Clock from 'lucide-react/dist/esm/icons/clock';
import Banknote from 'lucide-react/dist/esm/icons/banknote';
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle';
import CheckCircle2 from 'lucide-react/dist/esm/icons/check-circle-2';
import Navigation from 'lucide-react/dist/esm/icons/navigation';
import { formatCurrency } from '@/utils/formatters'
import { ATTRACTION_TYPES, RESERVATION_STATUS } from '@/config/constants'
import type { Attraction } from '@/types/Attraction'
import type { TimelineConflict } from '@/types/Timeline'

interface TimelineCardProps {
  attraction: Attraction
  arrivalTime: string
  departureTime: string
  duration: number
  conflicts: TimelineConflict[]
  onToggleVisited?: (id: number) => void
}

function openInMaps(lat: number, lng: number) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  window.open(url, '_blank');
}

export const TimelineCard = memo(function TimelineCard({
  attraction,
  arrivalTime,
  departureTime,
  duration,
  conflicts,
  onToggleVisited
}: TimelineCardProps) {
  const typeConfig = ATTRACTION_TYPES[attraction.type];
  const hasError = conflicts.some(c => c.severity === 'error');
  const hasWarning = conflicts.some(c => c.severity === 'warning');
  const isVisited = attraction.visited;
  const isAccommodation = attraction.id === -999;
  const hasLocation = attraction.lat && attraction.lng;

  return (
    <div className="relative">
      <div
        className={`
          absolute left-0 top-6 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white shadow z-20 -translate-x-1/2
          ${isVisited ? 'bg-emerald-500' : 'bg-slate-400'}
        `}
      />

      <div
        className={`
          relative ml-4 md:ml-6 rounded-2xl shadow-xl overflow-hidden border-l-4
          min-h-[180px] md:min-h-[200px]
          ${hasError ? 'border-l-red-500' : ''}
          ${hasWarning && !hasError ? 'border-l-amber-500' : ''}
          ${isVisited && !hasError && !hasWarning ? 'border-l-emerald-500' : ''}
          ${!hasError && !hasWarning && !isVisited ? 'border-l-slate-400' : ''}
          ${isVisited ? 'opacity-95' : ''}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600">
          {(attraction.thumbnailUrl || attraction.imageUrl)?.trim() ? (
            <img
              src={(attraction.thumbnailUrl || attraction.imageUrl || '').trim()}
              alt={attraction.name}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              width={800}
              height={400}
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : null}
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/50 pointer-events-none" />

        <div className="relative z-10 pl-4 pr-5 pt-4 pb-4 text-white">
          <div className="flex items-center gap-3 mb-3 pb-2 border-b border-white/20 min-w-0">
            <Clock className="w-4 h-4 text-white/80 flex-shrink-0 self-start mt-0.5" />
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm font-medium flex-1 min-w-0 text-shadow">
              <span className="font-bold">{arrivalTime}</span>
              <span className="text-white/60">→</span>
              <span className="font-bold">{departureTime}</span>
              <span className="text-xs text-white/70 whitespace-nowrap">({duration}min)</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {hasLocation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    openInMaps(attraction.lat!, attraction.lng!)
                  }}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all"
                  title="Abrir no Google Maps"
                >
                  <Navigation className="w-5 h-5 text-white" />
                </button>
              )}
              {!isAccommodation && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleVisited?.(attraction.id)
                  }}
                  className={`
                    p-1.5 rounded-full backdrop-blur-sm transition-all
                    ${isVisited
                      ? 'bg-emerald-500/30 hover:bg-emerald-500/40'
                      : 'bg-white/20 hover:bg-white/30'}
                  `}
                  title={isVisited ? 'Marcar como não visitado' : 'Marcar como visitado'}
                >
                  <CheckCircle2 className={`w-5 h-5 ${isVisited ? 'text-emerald-300' : 'text-white'}`} />
                </button>
              )}
            </div>
          </div>

          <h3 className="text-lg font-bold mb-2 line-clamp-2 drop-shadow-md text-shadow">
            {attraction.name}
          </h3>

          <div className="flex items-center gap-2 text-sm text-white/80 mb-2 text-shadow">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              {attraction.region ? `${attraction.region}, ` : ''}
              {attraction.city}
            </span>
          </div>

          {!isAccommodation && (
            <div className="flex items-center gap-2 text-sm mb-3">
              <Banknote className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />
              {attraction.couplePrice ? (
                <>
                  <span className="font-semibold text-emerald-300">
                    {formatCurrency(attraction.couplePrice, attraction.currency)}
                  </span>
                  <span className="text-white/70 text-xs">
                    ({formatCurrency(attraction.priceInBRL)})
                  </span>
                </>
              ) : (
                <span className="font-semibold text-emerald-300">
                  Gratuito
                </span>
              )}
            </div>
          )}

          {!isAccommodation && (
            <div className="flex flex-wrap gap-2 mb-3">
              {typeConfig && (
                <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-md backdrop-blur-sm">
                  {typeConfig.label}
                </span>
              )}

              {attraction.needsReservation && attraction.reservationStatus && (
                <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-md backdrop-blur-sm flex items-center gap-1">
                  <span>{RESERVATION_STATUS[attraction.reservationStatus].icon}</span>
                  <span>{RESERVATION_STATUS[attraction.reservationStatus].label}</span>
                </span>
              )}
            </div>
          )}

          {conflicts.length > 0 && (
            <div className="space-y-2 mb-3">
              {conflicts.map((conflict, index) => (
                <div
                  key={index}
                  className={`
                    flex items-start gap-2 text-sm p-2.5 rounded-lg backdrop-blur-sm border
                    ${conflict.severity === 'error'
                      ? 'bg-red-500/20 border-red-400/40 text-red-200'
                      : 'bg-amber-500/20 border-amber-400/40 text-amber-200'}
                  `}
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{conflict.message}</span>
                </div>
              ))}
            </div>
          )}

          {attraction.notes && (
            <div className="text-sm bg-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/20">
              <span className="font-semibold">💡</span> {attraction.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
})