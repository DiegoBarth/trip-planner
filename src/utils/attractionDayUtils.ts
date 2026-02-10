import type { Attraction, Country } from '@/types/Attraction'
import { dateToInputFormat } from '@/utils/formatters'

const normalizeDateKey = (date: string): string => {
   if (!date) return ''
   return dateToInputFormat(date)
}

const dateKeyToTime = (dateKey: string): number => {
   if (!dateKey) return 0
   return new Date(`${dateKey}T12:00:00`).getTime()
}

const buildDayMap = (attractions: Attraction[], country: Country): Map<string, number> => {
   const dateKeys = new Set<string>()

   attractions.forEach(attraction => {
      if (attraction.country !== country) return
      const dateKey = normalizeDateKey(attraction.date)
      if (dateKey) dateKeys.add(dateKey)
   })

   const sorted = Array.from(dateKeys).sort((a, b) => dateKeyToTime(a) - dateKeyToTime(b))

   return new Map(sorted.map((dateKey, index) => [dateKey, index + 1]))
}

export function applyAutoDays(attractions: Attraction[]): Attraction[] {
   const dayMaps = new Map<Country, Map<string, number>>()

   const getDayMap = (country: Country): Map<string, number> => {
      const cached = dayMaps.get(country)
      if (cached) return cached

      const map = buildDayMap(attractions, country)
      dayMaps.set(country, map)
      return map
   }

   return attractions.map(attraction => {
      const dateKey = normalizeDateKey(attraction.date)
      if (!dateKey) return attraction

      const dayMap = getDayMap(attraction.country)
      const autoDay = dayMap.get(dateKey)

      if (!autoDay || autoDay === attraction.day) return attraction

      return { ...attraction, day: autoDay }
   })
}

export function normalizeOrderByDate(attractions: Attraction[]): Attraction[] {
   const grouped = new Map<string, Attraction[]>()

   attractions.forEach(attraction => {
      const dateKey = normalizeDateKey(attraction.date)
      if (!dateKey) return
      const groupKey = `${attraction.country}::${dateKey}`

      const group = grouped.get(groupKey) ?? []
      group.push(attraction)
      grouped.set(groupKey, group)
   })

   const orderMap = new Map<number, number>()

   grouped.forEach(group => {
      group
         .slice()
         .sort((a, b) => a.order - b.order)
         .forEach((attraction, index) => {
            orderMap.set(attraction.id, index + 1)
         })
   })

   return attractions.map(attraction => {
      const nextOrder = orderMap.get(attraction.id)
      if (!nextOrder || nextOrder === attraction.order) return attraction
      return { ...attraction, order: nextOrder }
   })
}

export function getAutoDayForDate(
   attractions: Attraction[],
   country: Country,
   date: string,
   excludeId?: number
): number {
   const dateKey = normalizeDateKey(date)
   if (!dateKey) return 1

   const dateKeys = new Set<string>()

   attractions.forEach(attraction => {
      if (attraction.country !== country) return
      if (excludeId && attraction.id === excludeId) return
      const key = normalizeDateKey(attraction.date)
      if (key) dateKeys.add(key)
   })

   dateKeys.add(dateKey)

   const sorted = Array.from(dateKeys).sort((a, b) => dateKeyToTime(a) - dateKeyToTime(b))
   const index = sorted.indexOf(dateKey)

   return index >= 0 ? index + 1 : 1
}

export function getNextOrderForDate(
   attractions: Attraction[],
   country: Country,
   date: string,
   excludeId?: number
): number {
   const dateKey = normalizeDateKey(date)
   if (!dateKey) return 1

   const maxOrder = attractions.reduce((currentMax, attraction) => {
      if (attraction.country !== country) return currentMax
      if (excludeId && attraction.id === excludeId) return currentMax

      const attractionDateKey = normalizeDateKey(attraction.date)
      if (attractionDateKey !== dateKey) return currentMax

      return Math.max(currentMax, attraction.order || 0)
   }, 0)

   return maxOrder + 1
}