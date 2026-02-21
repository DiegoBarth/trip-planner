import { useState, useEffect, useMemo, useCallback } from 'react'
import { arrayMove } from '@dnd-kit/sortable'
import { DndContext, closestCenter, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
import { EmptyState } from '@/components/ui/EmptyState'
import { DroppableDay } from '@/components/attraction/DroppableDay'
import { AttractionCard } from '@/components/attraction/AttractionCard'
import { dateToInputFormat, formatDate, formatCurrency } from '@/utils/formatters'
import { useCountry } from '@/contexts/CountryContext'
import { COUNTRIES } from '@/config/constants'
import type { Attraction } from '@/types/Attraction'
import type { DragEndEvent } from '@dnd-kit/core'

interface AttractionsGridProps {
  attractions: Attraction[]
  emptyTitle: string
  emptyDescription: string
  onToggleVisited?: (id: number) => void
  onDelete?: (id: number) => void
  onEdit?: (attraction: Attraction) => void
  onReorder?: (attractions: Attraction[]) => void
  enableDragDrop?: boolean
}

export function AttractionsGrid({
  attractions,
  emptyTitle,
  emptyDescription,
  onToggleVisited,
  onDelete,
  onEdit,
  onReorder,
  enableDragDrop = false
}: AttractionsGridProps) {
  const [displayAttractions, setDisplayAttractions] = useState<Attraction[]>(attractions);
  const { day } = useCountry();

  const isAllDaysView = day === 'all';
  const isReadyForTotals = isAllDaysView && attractions.length === displayAttractions.length;

  useEffect(() => {
    setDisplayAttractions(attractions);
  }, [attractions]);

  const getCountryTotalCouplePrice = useCallback((days: Record<number, Attraction[]>): string | null => {
    const allAttractions = Object.values(days).flat();
    if (!allAttractions.length) return null;
    const total = allAttractions.reduce((sum, attr) => sum + (Number(attr.couplePrice) || 0), 0);
    if (!total) return null;
    const currency = allAttractions.find(a => a.currency)?.currency || 'BRL';
    return formatCurrency(total, currency);
  }, []);

  const getCountryTotalPriceBrl = useCallback((days: Record<number, Attraction[]>): number => {
    return Object.values(days).flat().reduce((sum, attr) => sum + (Number(attr.priceInBRL) || 0), 0);
  }, []);

  const getDayTotalCouplePrice = useCallback((dayAttractions: Attraction[]): string | null => {
    if (!dayAttractions.length) return null;
    const total = dayAttractions.reduce((sum, attr) => sum + (Number(attr.couplePrice) || 0), 0);
    if (!total) return null;
    const currency = dayAttractions.find(a => a.currency)?.currency || 'BRL';
    return formatCurrency(total, currency);
  }, []);

  const getDayTotalPriceBrl = useCallback((dayAttractions: Attraction[]): number => {
    return dayAttractions.reduce((sum, attr) => sum + (Number(attr.priceInBRL) || 0), 0);
  }, []);

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 1000,
        tolerance: 5
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10
      },
    })
  );

  if (displayAttractions.length === 0) {
    return (
      <EmptyState
        icon="🗺️"
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !onReorder) return

    const activeId = active.id as number;
    const overId = over.id as number;

    if (activeId === overId) return;

    const activeAttraction = displayAttractions.find(a => a.id === activeId);
    const overAttraction = displayAttractions.find(a => a.id === overId);

    if (!activeAttraction || !overAttraction) return;

    const activeDateKey = dateToInputFormat(activeAttraction.date);
    const overDateKey = dateToInputFormat(overAttraction.date);

    if (activeAttraction.country !== overAttraction.country) return;
    if (!activeDateKey || activeDateKey !== overDateKey) return;

    const dayAttractions = displayAttractions.filter(a =>
      a.country === activeAttraction.country
      && dateToInputFormat(a.date) === activeDateKey
    ).sort((a, b) => a.order - b.order);

    const oldIndex = dayAttractions.findIndex(a => a.id === activeId);
    const newIndex = dayAttractions.findIndex(a => a.id === overId);

    const reorderedDay = arrayMove(dayAttractions, oldIndex, newIndex);

    const updatedAttractions = displayAttractions.map(attr => {
      if (attr.country !== activeAttraction.country) return attr
      if (dateToInputFormat(attr.date) !== activeDateKey) return attr

      const newPosition = reorderedDay.findIndex(a => a.id === attr.id)
      return { ...attr, order: newPosition + 1 }
    });

    setDisplayAttractions(updatedAttractions);

    onReorder(updatedAttractions);
  };

  const groupedByCountry = useMemo(() => {
    const acc: Record<string, Record<number, Attraction[]>> = {};
    for (const attraction of displayAttractions) {
      const country = attraction.country ?? 'outros';
      const d = attraction.day;
      if (!acc[country]) acc[country] = {};
      if (!acc[country][d]) acc[country][d] = [];
      acc[country][d].push(attraction);
    }
    Object.values(acc).forEach(days => {
      Object.keys(days).forEach(d => {
        days[Number(d)].sort((a, b) => a.order - b.order);
      });
    });
    return acc;
  }, [displayAttractions]);

  const countryEarliestDate = useCallback((country: string): number => {
    const attractionsByDay = groupedByCountry[country];
    if (!attractionsByDay) return Number.POSITIVE_INFINITY;
    const dates: string[] = [];
    Object.values(attractionsByDay).forEach(dayAttractions => {
      dayAttractions.forEach(attraction => {
        if (attraction.date) dates.push(dateToInputFormat(attraction.date));
      });
    });
    if (dates.length === 0) return Number.POSITIVE_INFINITY;
    return new Date(`${dates.sort()[0]}T12:00:00`).getTime();
  }, [groupedByCountry]);

  const sortedCountryEntries = useMemo(() => {
    return Object.entries(groupedByCountry).sort(([countryA], [countryB]) => {
      const earliestA = countryEarliestDate(countryA);
      const earliestB = countryEarliestDate(countryB);
      if (earliestA === earliestB) return countryA.localeCompare(countryB);
      return earliestA - earliestB;
    });
  }, [groupedByCountry, countryEarliestDate]);

  const countryContent = sortedCountryEntries.map(([country, days]) => {
      const countryTotalCouple = getCountryTotalCouplePrice(days);
      const countryTotalBrl = getCountryTotalPriceBrl(days);

      return (
        <section key={country} className="space-y-6">
          {/* Country header */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm w-fit">
              <span className="text-xl" aria-hidden>
                {COUNTRIES[country as keyof typeof COUNTRIES]?.flag ?? '🌍'}
              </span>
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {COUNTRIES[country as keyof typeof COUNTRIES]?.name ?? country}
              </h2>
            </div>

            {isAllDaysView && isReadyForTotals && countryTotalCouple && (
              <div className="flex flex-col">
                <span className="text-md font-semibold text-emerald-600 dark:text-emerald-400">
                  {countryTotalCouple}
                </span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  ({formatCurrency(countryTotalBrl)})
                </span>
              </div>
            )}
          </div>

          {Object.entries(days)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([day, dayAttractions]) => {
              const totalCouplePrice = getDayTotalCouplePrice(dayAttractions);
              const totalPriceBrl = getDayTotalPriceBrl(dayAttractions);

              return (

                <section key={`${country}-${day}`}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm mb-3 w-fit">
                      <span className="text-lg" aria-hidden>📅</span>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        Dia {day}
                      </h3>
                      {dayAttractions[0]?.date && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(dayAttractions[0].date)}
                        </span>
                      )}
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        · {dayAttractions.length} {dayAttractions.length === 1 ? 'atração' : 'atrações'}
                      </span>
                    </div>
                    {totalCouplePrice && (
                      <div className="flex flex-col h-[58px]">
                        <span className="text-md font-medium text-emerald-600 dark:text-emerald-400">
                          {totalCouplePrice}
                        </span>
                        <span className="text-sm font-medium">
                          ({(formatCurrency(totalPriceBrl))})
                        </span>
                      </div>
                    )}
                  </div>

                  {enableDragDrop && onReorder ? (
                    <DroppableDay
                      day={Number(day)}
                      attractions={dayAttractions}
                      onToggleVisited={onToggleVisited}
                      onDelete={onDelete}
                      onEdit={onEdit}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {dayAttractions.map((attraction, index) => (
                        <AttractionCard
                          key={attraction.id}
                          attraction={attraction}
                          priority={index === 0}
                          onCheckVisited={onToggleVisited}
                          onDelete={onDelete}
                          onClick={() => onEdit?.(attraction)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )
            })
          }
        </section>
      )
    });

  return enableDragDrop && onReorder ? (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-10">{countryContent}</div>
    </DndContext>
  ) : (
    <div className="space-y-10">{countryContent}</div>
  )
}