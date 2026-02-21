import { EmptyState } from '@/components/ui/EmptyState'
import { AttractionCard } from '@/components/attraction/AttractionCard'
import { useAttractionsGrouped } from '@/hooks/useAttractionsGrouped'
import type { Attraction } from '@/types/Attraction'

interface AttractionsGridProps {
  attractions: Attraction[]
  emptyTitle: string
  emptyDescription: string
  onToggleVisited?: (id: number) => void
  onDelete?: (id: number) => void
  onEdit?: (attraction: Attraction) => void
}

export function AttractionsGrid({
  attractions,
  emptyTitle,
  emptyDescription,
  onToggleVisited,
  onDelete,
  onEdit,
}: AttractionsGridProps) {
  const {
    displayAttractions,
    isAllDaysView,
    isReadyForTotals,
    getCountryTotalCouplePrice,
    getCountryTotalPriceBrl,
    getDayTotalCouplePrice,
    getDayTotalPriceBrl,
    sortedCountryEntries,
    COUNTRIES,
    formatDate,
    formatCurrency,
  } = useAttractionsGrouped(attractions)

  if (displayAttractions.length === 0) {
    return (
      <EmptyState
        icon="🗺️"
        title={emptyTitle}
        description={emptyDescription}
      />
    )
  }

  const countryContent = sortedCountryEntries.map(([country, days]) => {
    const countryTotalCouple = getCountryTotalCouplePrice(days)
    const countryTotalBrl = getCountryTotalPriceBrl(days)

    return (
      <section key={country} className="space-y-6">
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
            const totalCouplePrice = getDayTotalCouplePrice(dayAttractions)
            const totalPriceBrl = getDayTotalPriceBrl(dayAttractions)

            return (
              <section key={`${country}-${day}`}>
                <div className="flex items-center justify-between flex-wrap">
                  <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm mb-3 w-fit">
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
              </section>
            )
          })}
      </section>
    )
  })

  return <div className="space-y-10">{countryContent}</div>
}
