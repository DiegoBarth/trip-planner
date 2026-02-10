import { useState, useEffect } from 'react'
import { DndContext, closestCenter, TouchSensor, MouseSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { AttractionCard } from './AttractionCard'
import { DroppableDay } from './DroppableDay'
import { EmptyState } from '@/components/ui/EmptyState'
import type { Attraction } from '@/types/Attraction'
import { dateToInputFormat, formatDate } from '@/utils/formatters'
import { COUNTRIES } from '@/config/constants'

type GroupMode = 'country' | 'none'

interface AttractionsGridProps {
   attractions: Attraction[]
   groupBy?: GroupMode
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
   groupBy = 'none',
   emptyTitle,
   emptyDescription,
   onToggleVisited,
   onDelete,
   onEdit,
   onReorder,
   enableDragDrop = false
}: AttractionsGridProps) {
   // Estado local para otimistic update - reflete a ordem imediatamente na UI
   const [displayAttractions, setDisplayAttractions] = useState<Attraction[]>(attractions)

   // Sincroniza quando as atrações vêm do servidor
   useEffect(() => {
      setDisplayAttractions(attractions)
   }, [attractions])

   const sensors = useSensors(
      useSensor(TouchSensor, {
         activationConstraint: {
            delay: 1000,
            tolerance: 5,
         },
      }),
      useSensor(MouseSensor, {
         activationConstraint: {
            distance: 10,
         },
      })
   )

   const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event
      
      if (!over || !onReorder) return

      const activeId = active.id as number
      const overId = over.id as number

      // Se dropped no mesmo item, ignora
      if (activeId === overId) return

      // Find the active attraction
      const activeAttraction = displayAttractions.find(a => a.id === activeId)
      const overAttraction = displayAttractions.find(a => a.id === overId)
      
      if (!activeAttraction || !overAttraction) return

      const activeDateKey = dateToInputFormat(activeAttraction.date)
      const overDateKey = dateToInputFormat(overAttraction.date)

      // Only reorder within the same country and date
      if (activeAttraction.country !== overAttraction.country) return
      if (!activeDateKey || activeDateKey !== overDateKey) return

      // Get attractions for this country/date
      const dayAttractions = displayAttractions.filter(a =>
         a.country === activeAttraction.country
         && dateToInputFormat(a.date) === activeDateKey
      )
                                        .sort((a, b) => a.order - b.order)
      
      const oldIndex = dayAttractions.findIndex(a => a.id === activeId)
      const newIndex = dayAttractions.findIndex(a => a.id === overId)

      // Reorder within the day
      const reorderedDay = arrayMove(dayAttractions, oldIndex, newIndex)
      
      // Update order values and merge back
      const updatedAttractions = displayAttractions.map(attr => {
         if (attr.country !== activeAttraction.country) return attr
         if (dateToInputFormat(attr.date) !== activeDateKey) return attr
         
         const newPosition = reorderedDay.findIndex(a => a.id === attr.id)
         return { ...attr, order: newPosition + 1 }
      })

      setDisplayAttractions(updatedAttractions)

      onReorder(updatedAttractions)
   }

   if (displayAttractions.length === 0) {
      return (
         <EmptyState
            icon="🗺️"
            title={emptyTitle}
            description={emptyDescription}
         />
      )
   }

   if (groupBy === 'none') {
      const getDayGroupSortKey = (dayAttractions: Attraction[], day: number): number => {
         const dateKeys = dayAttractions
            .map(attraction => dateToInputFormat(attraction.date))
            .filter(Boolean)
            .sort()

         if (dateKeys.length === 0) return day

         return new Date(`${dateKeys[0]}T12:00:00`).getTime()
      }

      const dayGroups = Object.entries(
         displayAttractions.reduce((acc, attraction) => {
            const day = attraction.day
            if (!acc[day]) acc[day] = []
            acc[day].push(attraction)
            return acc
         }, {} as Record<number, Attraction[]>)
      )
         .map(([day, dayAttractions]) => ({
            day,
            dayAttractions,
            sortKey: getDayGroupSortKey(dayAttractions, Number(day))
         }))
         .sort((a, b) => a.sortKey - b.sortKey)

      // Sort attractions within each day by order
      dayGroups.forEach(({ dayAttractions }) => {
         dayAttractions.sort((a, b) => a.order - b.order)
      })

      const content = dayGroups.map(({ day, dayAttractions }) => (
         <section key={day}>
            <div className="flex items-center gap-3 mb-4">
               <span className="text-2xl">📅</span>
               <h3 className="text-xl font-bold text-gray-900">
                  Dia {day}
               </h3>

               {dayAttractions[0]?.date && (
                  <span className="text-sm text-gray-500">
                     {formatDate(dayAttractions[0].date)}
                  </span>
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
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayAttractions.map(attraction => (
                     <AttractionCard
                        key={attraction.id}
                        attraction={attraction}
                        onCheckVisited={onToggleVisited}
                        onDelete={onDelete}
                        onClick={() => onEdit?.(attraction)}
                     />
                  ))}
               </div>
            )}
         </section>
      ))

      return enableDragDrop && onReorder ? (
         <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
         >
            <div className="space-y-6">{content}</div>
         </DndContext>
      ) : (
         <div className="space-y-6">{content}</div>
      )
   }

   const groupedByCountry = displayAttractions.reduce((acc, attraction) => {
      const country = attraction.country ?? 'outros'
      const day = attraction.day

      if (!acc[country]) acc[country] = {}
      if (!acc[country][day]) acc[country][day] = []

      acc[country][day].push(attraction)
      return acc
   }, {} as Record<string, Record<number, Attraction[]>>)

   const countryEarliestDate = (country: string): number => {
      const attractionsByDay = groupedByCountry[country]
      if (!attractionsByDay) return Number.POSITIVE_INFINITY

      const dates: string[] = []

      Object.values(attractionsByDay).forEach(dayAttractions => {
         dayAttractions.forEach(attraction => {
            if (!attraction.date) return
            dates.push(dateToInputFormat(attraction.date))
         })
      })

      if (dates.length === 0) return Number.POSITIVE_INFINITY

      const earliestKey = dates.sort()[0]
      return new Date(`${earliestKey}T12:00:00`).getTime()
   }

   Object.values(groupedByCountry).forEach(days => {
      Object.keys(days).forEach(day => {
         days[Number(day)].sort((a, b) => a.order - b.order)
      })
   })

   const countryContent = Object.entries(groupedByCountry)
      .sort(([countryA], [countryB]) => {
         const earliestA = countryEarliestDate(countryA)
         const earliestB = countryEarliestDate(countryB)

         if (earliestA === earliestB) return countryA.localeCompare(countryB)
         return earliestA - earliestB
      })
      .map(([country, days]) => (
      <section key={country} className="space-y-6">
         {/* Country header */}
         <div className="flex items-center gap-3">
            <span className="text-2xl">🌍</span>
            <h2 className="text-2xl font-bold text-gray-900">
               {COUNTRIES[country as keyof typeof COUNTRIES]?.name ?? country}
            </h2>
         </div>

         {Object.entries(days)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([day, dayAttractions]) => (
               <section key={`${country}-${day}`}>
                  <div className="flex items-center gap-3 mb-4">
                     <span className="text-2xl">📅</span>
                     <h3 className="text-xl font-bold text-gray-900">
                        Dia {day}
                     </h3>

                     {dayAttractions[0]?.date && (
                        <span className="text-sm text-gray-500">
                           {formatDate(dayAttractions[0].date)}
                        </span>
                     )}

                     <span className="text-sm text-gray-400">
                        {dayAttractions.length}{' '}
                        {dayAttractions.length === 1 ? 'atração' : 'atrações'}
                     </span>
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
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dayAttractions.map(attraction => (
                           <AttractionCard
                              key={attraction.id}
                              attraction={attraction}
                              onCheckVisited={onToggleVisited}
                              onDelete={onDelete}
                              onClick={() => onEdit?.(attraction)}
                           />
                        ))}
                     </div>
                  )}
               </section>
            ))}
      </section>
   ))

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
