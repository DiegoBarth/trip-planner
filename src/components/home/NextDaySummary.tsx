import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, ChevronRight, Navigation, CheckCircle2, Circle } from 'lucide-react'
import { useCountry } from '@/contexts/CountryContext'
import { useAttraction } from '@/hooks/useAttraction'

function openInMaps(lat: number, lng: number, name: string) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`;

  window.open(url, '_blank');
}

export function NextDaySummary() {
  const { attractions, country } = useCountry();
  const { toggleVisited } = useAttraction(country);

  const nextDayData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attractionsWithDate = attractions
      .filter(a => a.date && a.lat && a.lng)
      .map(a => ({
        ...a,
        parsedDate: new Date(a.date)
      }))
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());

    if (attractionsWithDate.length === 0) return null;

    const isTodayInTrip = attractionsWithDate.some(a => {
      const d = a.parsedDate;

      return d.getFullYear() === today.getFullYear() &&
        d.getMonth() === today.getMonth() &&
        d.getDate() === today.getDate();
    });

    const targetDate = isTodayInTrip
      ? today
      : attractionsWithDate.find(a => a.parsedDate >= today)?.parsedDate ?? null;

    if (!targetDate) return null;

    const dayAttractions = attractionsWithDate.filter(a => {
      const d = a.parsedDate;

      return d.getFullYear() === targetDate.getFullYear() &&
        d.getMonth() === targetDate.getMonth() &&
        d.getDate() === targetDate.getDate();
    });

    if (dayAttractions.length === 0) return null;

    const attractionsAll = [...dayAttractions].sort((a, b) => a.order - b.order);
    const nextAttraction = isTodayInTrip
      ? attractionsAll.find(a => a.id !== -999 && !a.visited)
      : null;

    return {
      date: targetDate,
      day: dayAttractions[0].day,
      isToday: isTodayInTrip,
      attractionsCount: dayAttractions.length,
      attractions: dayAttractions.slice(0, 3),
      attractionsAll,
      nextAttraction: nextAttraction ?? null
    }
  }, [attractions]);

  if (!nextDayData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 text-center">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">Nenhum dia planejado</p>
      </div>
    );
  }

  const dateStr = nextDayData.date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 opacity-90">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">
              {nextDayData.isToday ? 'Hoje' : 'Próximo Dia'}
            </span>
          </div>
          <h3 className="text-2xl font-bold capitalize">
            {dateStr}
          </h3>
          <p className="text-sm opacity-90 mt-1">Dia {nextDayData.day} da viagem</p>
        </div>
        <ChevronRight className="w-6 h-6 opacity-80" />
      </div>

      <div className="flex items-center gap-2 text-sm opacity-90">
        <MapPin className="w-4 h-4" />
        <span>{nextDayData.attractionsCount} {nextDayData.attractionsCount === 1 ? 'local' : 'locais'} planejados</span>
      </div>
    </>
  );

  const isToday = nextDayData.isToday;
  const showTravelMode = isToday && (nextDayData.nextAttraction || nextDayData.attractionsAll.length > 0);

  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg p-6 focus-within:ring-2 focus-within:ring-white/50 focus-within:outline-none">
      <Link
        to="/timeline"
        className="block hover:opacity-95 transition-opacity focus:outline-none"
      >
        {cardContent}
      </Link>

      {showTravelMode && (
        <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
          {nextDayData.nextAttraction && (
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="min-w-0">
                <p className="text-xs font-medium opacity-90">Próxima parada</p>
                <p className="font-semibold truncate">{nextDayData.nextAttraction.name}</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  openInMaps(
                    nextDayData.nextAttraction!.lat!,
                    nextDayData.nextAttraction!.lng!,
                    nextDayData.nextAttraction!.name
                  )
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-medium transition-colors"
              >
                <Navigation className="w-4 h-4" />
                Navegar
              </button>
            </div>
          )}

          <div className="space-y-1.5">
            <p className="text-xs font-medium opacity-90 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Toque para marcar visitado
            </p>
            {nextDayData.attractionsAll.map((attraction) => (
              <button
                key={attraction.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  if (attraction.id === -999) return
                  toggleVisited(attraction.id)
                }}
                disabled={attraction.id === -999}
                className="w-full flex items-center gap-2 text-left py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {attraction.visited ? (
                  <CheckCircle2 className="w-5 h-5 text-green-200 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 opacity-70 flex-shrink-0" />
                )}
                <span className={attraction.visited ? 'line-through opacity-80' : ''}>
                  {attraction.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {!showTravelMode && nextDayData.attractions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/20">
          <div className="flex items-center gap-2 text-sm opacity-90 mb-2">
            <Clock className="w-4 h-4" />
            <span>Primeiros locais:</span>
          </div>
          <ul className="space-y-1 text-sm">
            {nextDayData.attractions.map((attraction, idx) => (
              <li key={attraction.id} className="opacity-90">
                {idx + 1}. {attraction.name}
              </li>
            ))}
            {nextDayData.attractionsCount > 3 && (
              <li className="opacity-75 italic">
                + {nextDayData.attractionsCount - 3} mais...
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}