import { useState, useMemo } from 'react'
import { Plus, Ticket } from 'lucide-react'
import { ReservationCard } from './ReservationCard'
import { ModalReservation } from './ModalReservation'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/SkeletonList'
import type { Reservation } from '@/types/Reservation'

interface ReservationListProps {
  reservations: Reservation[]
  onUpdate: (reservation: Reservation) => void
  onCreate: (reservation: Omit<Reservation, 'id'>) => void
  onDelete: (id: number) => void
  isLoading?: boolean
}

export function ReservationList({
  reservations,
  onUpdate,
  onCreate,
  onDelete,
  isLoading = false
}: ReservationListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>()

  /**
   * Sort reservations by:
   * 1. Items without date go to "Pre-trip" section
   * 2. Items with date are sorted chronologically
   * 3. Within same date, sort by type priority (document > insurance > flight > accommodation > transport-pass > activity > other)
   */
  const sortedReservations = useMemo(() => {
    const typePriority: Record<Reservation['type'], number> = {
      'document': 1,
      'insurance': 2,
      'flight': 3,
      'accommodation': 4,
      'transport-pass': 5,
      'activity': 6,
      'other': 7
    }

    return [...reservations].sort((a, b) => {
      // Items without date go first (pre-trip section)
      if (!a.date && b.date) return -1
      if (a.date && !b.date) return 1
      if (!a.date && !b.date) {
        return typePriority[a.type] - typePriority[b.type]
      }

      // Sort by date
      const dateA = new Date(a.date!).getTime()
      const dateB = new Date(b.date!).getTime()

      if (dateA !== dateB) {
        return dateA - dateB
      }

      // Same date: sort by type priority
      return typePriority[a.type] - typePriority[b.type]
    })
  }, [reservations])

  /**
   * Group reservations into sections
   */
  const groupedReservations = useMemo(() => {
    const preTripItems: Reservation[] = []
    const dateGrouped: Record<string, Reservation[]> = {}

    sortedReservations.forEach(reservation => {
      if (!reservation.date) {
        preTripItems.push(reservation)
      } else {
        const dateKey = reservation.date
        if (!dateGrouped[dateKey]) {
          dateGrouped[dateKey] = []
        }
        dateGrouped[dateKey].push(reservation)
      }
    })

    return { preTripItems, dateGrouped }
  }, [sortedReservations])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = reservations.length
    const confirmed = reservations.filter(r => r.status === 'confirmed').length
    const pending = reservations.filter(r => r.status === 'pending').length
    const completed = reservations.filter(r => r.status === 'completed').length

    return { total, confirmed, pending, completed }
  }, [reservations])

  const handleOpenModal = (reservation?: Reservation) => {
    setEditingReservation(reservation)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingReservation(undefined)
    setIsModalOpen(false)
  }

  const handleSave = (data: Omit<Reservation, 'id'>) => {
    if (editingReservation) {
      onUpdate({
        ...data,
        id: editingReservation.id
      } as Reservation)
    } else {
      onCreate(data)
    }
    handleCloseModal()
  }

  const formatSectionDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  // Show loading skeleton
  if (isLoading) {
    return <SkeletonList />
  }

  return (
    <div className="p-6">
      {/* Header with stats */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Ticket className="w-6 h-6" />
              Reservas & Documentos
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {stats.total} {stats.total === 1 ? 'item' : 'itens'} no total
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Nova Reserva
          </button>
        </div>

        {/* Statistics */}
        {stats.total > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">Total</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-green-50 rounded-lg border-2 border-green-200 p-4">
              <div className="text-sm font-medium text-green-700">Confirmados</div>
              <div className="text-2xl font-bold text-green-900">{stats.confirmed}</div>
            </div>
            <div className="bg-amber-50 rounded-lg border-2 border-amber-200 p-4">
              <div className="text-sm font-medium text-amber-700">Pendentes</div>
              <div className="text-2xl font-bold text-amber-900">{stats.pending}</div>
            </div>
            <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
              <div className="text-sm font-medium text-gray-500">Concluídos</div>
              <div className="text-2xl font-bold text-gray-700">{stats.completed}</div>
            </div>
          </div>
        )}
      </div>

      {/* Reservations by section */}
      <div className="space-y-8">
        {reservations.length === 0 ? (
          <EmptyState
            icon="🎫"
            title="Nenhuma reserva encontrada"
            description="Comece adicionando suas reservas, documentos e ingressos!"
          />
        ) : (
          <>
            {/* Pre-trip section (items without date) */}
            {groupedReservations.preTripItems.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3 pb-2 border-b-2 border-indigo-200">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Pré-Viagem
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({groupedReservations.preTripItems.length})
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedReservations.preTripItems.map(reservation => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onEdit={() => handleOpenModal(reservation)}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Date-grouped sections */}
            {Object.entries(groupedReservations.dateGrouped)
              .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
              .map(([date, items]) => (
                <section key={date} className="space-y-4">
                  <div className="flex items-center gap-3 pb-2 border-b-2 border-blue-200">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <h3 className="text-xl font-bold text-gray-900 capitalize">
                      {formatSectionDate(date)}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ({items.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(reservation => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onEdit={() => handleOpenModal(reservation)}
                        onDelete={onDelete}
                      />
                    ))}
                  </div>
                </section>
              ))}
          </>
        )}
      </div>

      <ModalReservation
        reservation={editingReservation}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  )
}
