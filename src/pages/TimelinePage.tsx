import { useMemo, useState, useEffect, lazy, Suspense, useCallback, startTransition } from 'react'
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import FileDown from 'lucide-react/dist/esm/icons/file-down';
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { CountryFilter } from '@/components/home/CountryFilter'
import { useAttraction } from '@/hooks/useAttraction'
import { useOSRMRoutesQuery } from '@/hooks/useOSRMRoutesQuery'
import { useCountry } from '@/contexts/CountryContext'
import { useAccommodation } from '@/hooks/useAccommodation';
import { useToast } from '@/contexts/toast'
import { buildDayTimeline, suggestStartTime, recomputeTimelineWithStartTime } from '@/services/timelineService'
import type { Attraction, Country } from '@/types/Attraction'
import type { Accommodation } from '@/types/Accommodation'
import type { TimelineDay } from '@/types/Timeline'
import { TimelinePanelSkeleton } from '@/components/skeletons/TimelineSkeletons'

const Timeline = lazy(() => import('@/components/timeline/Timeline'))

/** First segment above this (km) is considered wrong accommodation – recalc from timeline list. */
const MAX_REASONABLE_FIRST_LEG_KM = 100

function normalizeCityKey(city: string): string {
  return city.trim().toLowerCase();
}

/** City that appears most often in the day (avoids wrong accommodation when first attraction is in another city). */
function mainCityForDay(attractions: Attraction[]): string {
  const countByCity = new Map<string, string>();
  for (const a of attractions) {
    const key = normalizeCityKey(a.city);
    if (!countByCity.has(key)) countByCity.set(key, a.city);
  }
  const count: Record<string, number> = {};
  for (const a of attractions) {
    const key = normalizeCityKey(a.city);
    count[key] = (count[key] ?? 0) + 1;
  }
  let maxCount = 0;
  let mainKey = '';
  for (const [key, n] of Object.entries(count)) {
    if (n > maxCount) {
      maxCount = n;
      mainKey = key;
    }
  }
  return mainKey ? (countByCity.get(mainKey) ?? attractions[0].city) : attractions[0].city;
}

function addAccommodationToDay(dayAttractions: Attraction[], accommodationByCity: Map<string, Accommodation>): Attraction[] {
  if (dayAttractions.length === 0) return dayAttractions;

  const sorted = [...dayAttractions].sort((a, b) => a.order - b.order);
  const city = mainCityForDay(sorted);
  const acc = accommodationByCity.get(normalizeCityKey(city));

  if (!acc?.lat || !acc?.lng) return sorted;

  const accAttraction: Attraction = {
    id: -999,
    name: acc.description,
    lat: acc.lat,
    lng: acc.lng,
    city: acc.city,
    region: sorted[0].region,
    country: acc.country as Country,
    order: 0,
    date: sorted[0].date,
    day: sorted[0].day,
    dayOfWeek: sorted[0].dayOfWeek,
    type: 'other',
    duration: 0,
    couplePrice: 0,
    priceInBRL: 0,
    currency: sorted[0].currency,
    visited: false,
    needsReservation: false,
    openingTime: undefined,
    closingTime: undefined,
    imageUrl: undefined,
  };

  return [accAttraction, ...sorted];
}

export default function TimelinePage() {
  const [searchParams] = useSearchParams();
  const { country, day, setDay } = useCountry();
  const { attractions, isLoading: isAttractionsLoading, toggleVisited } = useAttraction(country);
  const { accommodations, isLoading: isAccommodationsLoading } = useAccommodation(country);
  const { success, error } = useToast();
  const dataReady = !isAttractionsLoading && !isAccommodationsLoading;

  useEffect(() => {
    const dayParam = searchParams.get('day');
    if (dayParam) {
      const dayNum = Number(dayParam);
      if (Number.isInteger(dayNum) && dayNum > 0) setDay(dayNum);
    }
  }, [searchParams, setDay]);

  const accommodationByCity = useMemo(() => {
    const map = new Map<string, Accommodation>();
    accommodations.forEach(a => map.set(normalizeCityKey(a.city), a));
    return map;
  }, [accommodations]);

  const mappableAttractions = useMemo(() => {
    return attractions.filter(a => a.lat != null && a.lng != null);
  }, [attractions]);

  const groupedByDayForRoutes = useMemo(() => {
    const grouped: Record<number, Attraction[]> = {};

    mappableAttractions.forEach(a => {
      if (!grouped[a.day]) grouped[a.day] = [];
      grouped[a.day].push(a);
    });

    return grouped;
  }, [mappableAttractions]);

  const { segmentsByDay, isRoutesLoading } =
    useOSRMRoutesQuery(groupedByDayForRoutes, accommodations, { enabled: dataReady });

  const [isExporting, setIsExporting] = useState(false);

  const handleToggleVisited = useCallback(async (id: number) => {
    try {
      await toggleVisited(id);
      success('Status da atração atualizado');
    } catch (err) {
      error('Erro ao atualizar atração');
      console.error(err);
    }
  }, [toggleVisited, success, error]);

  const timelineAttractions = useMemo(() => {
    if (day === 'all') return [];

    const filtered = mappableAttractions.filter(a => a.day === day);

    return addAccommodationToDay(filtered, accommodationByCity);
  }, [mappableAttractions, day, accommodationByCity]);

  const dayGroups = useMemo(() => {
    if (day !== 'all') return [];

    const sortedDays = Object.keys(groupedByDayForRoutes)
      .map(Number)
      .sort((a, b) => a - b);

    return sortedDays.map(dayNum => {
      const arr = groupedByDayForRoutes[dayNum];
      const withAcc = addAccommodationToDay(arr, accommodationByCity);

      return {
        day: dayNum,
        date: arr[0].date,
        attractions: withAcc
      };
    });

  }, [day, groupedByDayForRoutes, accommodationByCity]);

  const dayLabel = useMemo(() => {
    if (day === 'all') {
      if (dayGroups.length === 0) return 'Todos os dias';
      return `${dayGroups.length} ${dayGroups.length === 1 ? 'dia' : 'dias'}`;
    }

    if (timelineAttractions.length === 0) return '';

    return `Dia ${day}`;
  }, [day, dayGroups.length, timelineAttractions.length]);

  const canExport =
    day === 'all'
      ? dayGroups.length > 0
      : timelineAttractions.length > 0;

  const timelineBuildKey = useMemo(() => {
    if (day === 'all') {
      return JSON.stringify(dayGroups.map((g) => ({
        day: g.day,
        ids: g.attractions.map((a) => ({
          id: a.id,
          visited: a.visited
        }))
      })));
    }
    return JSON.stringify(
      timelineAttractions.map((a) => ({
        id: a.id,
        visited: a.visited
      }))
    );

  }, [day, dayGroups, timelineAttractions]);

  const [singleTimeline, setSingleTimeline] = useState<TimelineDay | null>(null);
  const [dayTimelines, setDayTimelines] = useState<(TimelineDay | null)[]>([]);
  const [overrideStartTime, setOverrideStartTime] = useState<string | null>(null);

  const displayedTimeline = useMemo(() => {
    if (!singleTimeline) return null;
    if (overrideStartTime) return recomputeTimelineWithStartTime(singleTimeline, overrideStartTime);
    return singleTimeline;
  }, [singleTimeline, overrideStartTime]);

  const suggestedStartTime = useMemo(() => {
    return singleTimeline ? suggestStartTime(singleTimeline.attractions, singleTimeline.segments) : null;
  }, [singleTimeline]);

  const handleStartTimeChange = useCallback((newStartTime: string) => {
    setOverrideStartTime(newStartTime);
  }, []);

  useEffect(() => {

    if (isRoutesLoading) return;

    if (day !== 'all') {
      if (timelineAttractions.length === 0) {
        setSingleTimeline(null);
        return;
      }

      let cancelled = false;

      startTransition(() => {
        setDayTimelines([]);
      });

      const cached = segmentsByDay[Number(day)];
      const firstLegAbnormal =
        cached?.[0]?.distanceKm != null && cached[0].distanceKm > MAX_REASONABLE_FIRST_LEG_KM;
      const precomputed =
        cached &&
        cached.length === timelineAttractions.length - 1 &&
        !firstLegAbnormal
          ? cached
          : undefined;

      buildDayTimeline(timelineAttractions, precomputed)
        .then((t) => {
          if (!cancelled) {
            startTransition(() => {
              setSingleTimeline(t);
              setOverrideStartTime(null);
            });
          }
        });

      return () => {
        cancelled = true;
      };
    }

    if (dayGroups.length === 0) {
      setDayTimelines([]);
      setSingleTimeline(null);
      return;
    }

    let cancelled = false;

    setSingleTimeline(null);

    Promise.all(
      dayGroups.map(async (g) => {

        await new Promise(r => setTimeout(r, 0));

        const cached = segmentsByDay[g.day];
        const firstLegAbnormal =
          cached?.[0]?.distanceKm != null && cached[0].distanceKm > MAX_REASONABLE_FIRST_LEG_KM;
        const precomputed =
          cached &&
          cached.length === g.attractions.length - 1 &&
          !firstLegAbnormal
            ? cached
            : undefined;

        return buildDayTimeline(g.attractions, precomputed);
      })
    ).then((results) => {
      if (!cancelled) {
        startTransition(() => {
          setDayTimelines(results);
        });
      }
    });

    return () => {
      cancelled = true;
    };

  }, [timelineBuildKey, segmentsByDay, isRoutesLoading]);

  const handleExportPDF = async () => {
    if (!canExport) return;

    setIsExporting(true);

    try {

      const { exportTimelineToPDF } =
        await import('@/utils/exportTimelineToPDF');

      if (day === 'all') {

        const timelineDays =
          dayTimelines.length === dayGroups.length
            ? dayTimelines
            :             await Promise.all(
              dayGroups.map((g) => {
                const cached = segmentsByDay[g.day];
                const firstLegAbnormal =
                  cached?.[0]?.distanceKm != null && cached[0].distanceKm > MAX_REASONABLE_FIRST_LEG_KM;
                const precomputed =
                  cached &&
                  cached.length === g.attractions.length - 1 &&
                  !firstLegAbnormal
                    ? cached
                    : undefined;

                return buildDayTimeline(g.attractions, precomputed);
              })
            );

        const valid =
          timelineDays.filter(
            (d): d is NonNullable<typeof d> => d != null
          );

        if (valid.length > 0) {
          exportTimelineToPDF(valid);
          success('PDF exportado com sucesso!');
        }
        else {
          error('Nenhuma timeline gerada para exportar');
        }
      }
      else {
        const cached = segmentsByDay[Number(day)];
        const firstLegAbnormal =
          cached?.[0]?.distanceKm != null && cached[0].distanceKm > MAX_REASONABLE_FIRST_LEG_KM;
        const precomputed =
          cached &&
          cached.length === timelineAttractions.length - 1 &&
          !firstLegAbnormal
            ? cached
            : undefined;

        const single =
          singleTimeline ??
          (await buildDayTimeline(timelineAttractions, precomputed));

        if (single) {
          exportTimelineToPDF([single]);
          success('PDF exportado com sucesso!');
        }
        else {
          error('Nenhuma timeline gerada para exportar');
        }
      }
    }
    catch (err) {
      console.error(err);
      error('Erro ao exportar PDF');
    }
    finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
      <PageHeader
        title="Timeline"
        subtitle={`${dayLabel} - Visualize seu dia com rotas e clima`}
        filter={<CountryFilter hideGeneralOption />}
        action={
          canExport && (
            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <FileDown className="w-4 h-4" />
              {isExporting ? 'Exportando…' : 'Exportar PDF'}
            </button>
          )
        }
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 min-h-screen">
        {isAttractionsLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 min-h-[420px]">
            <TimelinePanelSkeleton />
          </div>
        ) : (day === 'all'
          ? dayGroups.length === 0
          : timelineAttractions.length === 0) ? (

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {day === 'all'
                ? 'Nenhuma atração com coordenadas'
                : `Nenhuma atração para o Dia ${day}`}
            </h3>

            <Link
              to="/attractions"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Ir para Atrações
            </Link>
          </div>
        ) : isRoutesLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 min-h-[420px]">
            <TimelinePanelSkeleton />
          </div>
        ) : day === 'all' ? (
          <div className="space-y-10">
            <Suspense
              fallback={
                <TimelinePanelSkeleton />
              }
            >
              {dayGroups.map((group, idx) => (
                <div
                  key={group.day}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 min-h-[calc(100dvh-160px)]"
                >
                  <Timeline
                    timeline={dayTimelines[idx] ?? null}
                    city={group.attractions[0]?.city}
                    date={group.date}
                    onToggleVisited={handleToggleVisited}
                  />
                </div>
              ))}
            </Suspense>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 min-h-[420px]">
            <Suspense
              fallback={
                <TimelinePanelSkeleton />
              }
            >
              <Timeline
                timeline={displayedTimeline}
                city={timelineAttractions[0]?.city}
                date={timelineAttractions[0]?.date}
                onToggleVisited={handleToggleVisited}
                suggestedStartTime={suggestedStartTime}
                onStartTimeChange={handleStartTimeChange}
              />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
}