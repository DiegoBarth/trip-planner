import { useState, useEffect, useMemo, useCallback } from 'react'
import { dateToInputFormat, formatDate, formatCurrency } from '@/utils/formatters'
import { useCountry } from '@/contexts/CountryContext'
import { COUNTRIES } from '@/config/constants'
import type { Attraction } from '@/types/Attraction'

export function useAttractionsGrouped(attractions: Attraction[]) {
  const [displayAttractions, setDisplayAttractions] = useState<Attraction[]>(attractions)
  const { day } = useCountry()

  const isAllDaysView = day === 'all'
  const isReadyForTotals = isAllDaysView && attractions.length === displayAttractions.length

  useEffect(() => {
    setDisplayAttractions(attractions)
  }, [attractions])

  const getCountryTotalCouplePrice = useCallback((days: Record<number, Attraction[]>): string | null => {
    const allAttractions = Object.values(days).flat()
    if (!allAttractions.length) return null
    const total = allAttractions.reduce((sum, attr) => sum + (Number(attr.couplePrice) || 0), 0)
    if (!total) return null
    const currency = allAttractions.find(a => a.currency)?.currency || 'BRL'
    return formatCurrency(total, currency)
  }, [])

  const getCountryTotalPriceBrl = useCallback((days: Record<number, Attraction[]>): number => {
    return Object.values(days).flat().reduce((sum, attr) => sum + (Number(attr.priceInBRL) || 0), 0)
  }, [])

  const getDayTotalCouplePrice = useCallback((dayAttractions: Attraction[]): string | null => {
    if (!dayAttractions.length) return null
    const total = dayAttractions.reduce((sum, attr) => sum + (Number(attr.couplePrice) || 0), 0)
    if (!total) return null
    const currency = dayAttractions.find(a => a.currency)?.currency || 'BRL'
    return formatCurrency(total, currency)
  }, [])

  const getDayTotalPriceBrl = useCallback((dayAttractions: Attraction[]): number => {
    return dayAttractions.reduce((sum, attr) => sum + (Number(attr.priceInBRL) || 0), 0)
  }, [])

  const groupedByCountry = useMemo(() => {
    const acc: Record<string, Record<number, Attraction[]>> = {}
    for (const attraction of displayAttractions) {
      const country = attraction.country ?? 'outros'
      const d = attraction.day
      if (!acc[country]) acc[country] = {}
      if (!acc[country][d]) acc[country][d] = []
      acc[country][d].push(attraction)
    }
    Object.values(acc).forEach(days => {
      Object.keys(days).forEach(d => {
        days[Number(d)].sort((a, b) => a.order - b.order)
      })
    })
    return acc
  }, [displayAttractions])

  const countryEarliestDate = useCallback((country: string): number => {
    const attractionsByDay = groupedByCountry[country]
    if (!attractionsByDay) return Number.POSITIVE_INFINITY
    const dates: string[] = []
    Object.values(attractionsByDay).forEach(dayAttractions => {
      dayAttractions.forEach(attraction => {
        if (attraction.date) dates.push(dateToInputFormat(attraction.date))
      })
    })
    if (dates.length === 0) return Number.POSITIVE_INFINITY
    return new Date(`${dates.sort()[0]}T12:00:00`).getTime()
  }, [groupedByCountry])

  const sortedCountryEntries = useMemo(() => {
    return Object.entries(groupedByCountry).sort(([countryA], [countryB]) => {
      const earliestA = countryEarliestDate(countryA)
      const earliestB = countryEarliestDate(countryB)
      if (earliestA === earliestB) return countryA.localeCompare(countryB)
      return earliestA - earliestB
    })
  }, [groupedByCountry, countryEarliestDate])

  return {
    displayAttractions,
    setDisplayAttractions,
    isAllDaysView,
    isReadyForTotals,
    getCountryTotalCouplePrice,
    getCountryTotalPriceBrl,
    getDayTotalCouplePrice,
    getDayTotalPriceBrl,
    sortedCountryEntries,
    groupedByCountry,
    COUNTRIES,
    formatDate,
    formatCurrency,
  }
}
