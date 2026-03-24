import { useState, useEffect, useRef } from 'react'
import X from 'lucide-react/dist/esm/icons/x'
import { useQueryClient } from '@tanstack/react-query'
import { reorderDay, moveAttractionToDay } from '@/api/attraction'
import { useAttraction } from '@/hooks/useAttraction'
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock'
import { useToast } from '@/contexts/toast'
import type { Attraction, Country } from '@/types/Attraction'

interface ReorderDaysModalProps {
  isOpen: boolean
  onClose: () => void
  country: Country
}

export function ReorderDaysModal({ isOpen, onClose, country }: ReorderDaysModalProps) {
  const queryClient = useQueryClient()
  const { attractions, availableDays } = useAttraction(country)
  const { success, error } = useToast()

  const [fromDay, setFromDay] = useState<number>(availableDays[0] ?? 1)
  const [toDay, setToDay] = useState<number>(availableDays[1] ?? 2)
  const [movingDay, setMovingDay] = useState(false)
  const wasOpenRef = useRef(false)

  useEffect(() => {
    const justOpened = isOpen && !wasOpenRef.current
    wasOpenRef.current = isOpen
    if (justOpened && availableDays.length > 0) {
      setFromDay(availableDays[0])
      setToDay(availableDays[Math.min(1, availableDays.length - 1)])
    }
  }, [isOpen, availableDays])
  const [movingAttractionId, setMovingAttractionId] = useState<number | null>(null)
  const [targetDayByAttraction, setTargetDayByAttraction] = useState<Record<number, number>>({})
  useBodyScrollLock(isOpen)

  const handleReorderDay = async () => {
    if (fromDay === toDay) return
    setMovingDay(true)
    try {
      await reorderDay({ country, fromDay, toDay })
      queryClient.invalidateQueries({ queryKey: ['attractions'] })
      queryClient.invalidateQueries({ queryKey: ['osrm-routes'] })
      success(`Dia ${fromDay} movido para o dia ${toDay}`)
      onClose()
    } catch (err) {
      console.error(err)
      error('Erro ao reordenar dia')
    } finally {
      setMovingDay(false)
    }
  }

  const handleMoveAttraction = async (attraction: Attraction) => {
    const targetDay = targetDayByAttraction[attraction.id] ?? attraction.day
    if (targetDay === attraction.day) return
    setMovingAttractionId(attraction.id)
    try {
      await moveAttractionToDay({ id: attraction.id, targetDay })
      queryClient.invalidateQueries({ queryKey: ['attractions'] })
      queryClient.invalidateQueries({ queryKey: ['osrm-routes'] })
      success(`"${attraction.name}" movido para o dia ${targetDay}`)
      setTargetDayByAttraction(prev => {
        const next = { ...prev }
        delete next[attraction.id]
        return next
      })
    } catch (err) {
      console.error(err)
      error('Erro ao mover atração')
    } finally {
      setMovingAttractionId(null)
    }
  }

  if (!isOpen) return null

  const dayOptions = availableDays.length > 0 ? availableDays : [1, 2, 3]

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/50 overflow-hidden overscroll-none" role="dialog" aria-modal="true" aria-labelledby="reorder-days-title">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto overscroll-contain touch-pan-y">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <h2 id="reorder-days-title" className="text-lg font-bold text-gray-900 dark:text-white">
            Reordenar dias
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mover dia inteiro
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Todas as atrações do dia de origem passam para o dia de destino (no mesmo país).
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={fromDay}
                onChange={(e) => setFromDay(Number(e.target.value))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
              >
                {dayOptions.map((d) => (
                  <option key={d} value={d}>Dia {d}</option>
                ))}
              </select>
              <span className="text-gray-500 dark:text-gray-400 text-sm">para</span>
              <select
                value={toDay}
                onChange={(e) => setToDay(Number(e.target.value))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
              >
                {dayOptions.map((d) => (
                  <option key={d} value={d}>Dia {d}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleReorderDay}
                disabled={fromDay === toDay || movingDay}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {movingDay ? 'Movendo…' : 'Mover dia'}
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mover atração para outro dia
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              Escolha o dia de destino e clique em mover.
            </p>
            <ul className="space-y-2 max-h-60 overflow-y-auto overscroll-contain touch-pan-y">
              {attractions
                .filter((a) => a.id !== -999)
                .map((attraction) => (
                  <li
                    key={attraction.id}
                    className="flex flex-wrap items-center gap-2 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <span className="flex-1 min-w-0 text-sm text-gray-900 dark:text-white truncate" title={attraction.name}>
                      {attraction.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Dia {attraction.day}</span>
                    <select
                      value={targetDayByAttraction[attraction.id] ?? attraction.day}
                      onChange={(e) =>
                        setTargetDayByAttraction((prev) => ({
                          ...prev,
                          [attraction.id]: Number(e.target.value)
                        }))
                      }
                      className="rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-2 py-1 text-xs w-20"
                    >
                      {dayOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleMoveAttraction(attraction)}
                      disabled={
                        (targetDayByAttraction[attraction.id] ?? attraction.day) === attraction.day ||
                        movingAttractionId === attraction.id
                      }
                      className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {movingAttractionId === attraction.id ? 'Movendo…' : 'Mover'}
                    </button>
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  )
}
