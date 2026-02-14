import { useState, useMemo } from 'react'
import { FileCheck } from 'lucide-react'
import { ReservationCard } from './ReservationCard'
import { ModalReservation } from './ModalReservation'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/SkeletonList'
import type { Reservation } from '@/types/Reservation'
import { formatDate } from '@/utils/formatters'

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
      if (!a.date && b.date) return -1
      if (a.date && !b.date) return 1
      if (!a.date && !b.date) {
        return typePriority[a.type] - typePriority[b.type]
      }
      const dateA = new Date(a.date!).getTime()
      const dateB = new Date(b.date!).getTime()
      if (dateA !== dateB) return dateA - dateB
      return typePriority[a.type] - typePriority[b.type]
    })
  }, [reservations])

  const groupedReservations = useMemo(() => {
    const preTripItems: Reservation[] = []
    const dateGrouped: Record<string, Reservation[]> = {}

    sortedReservations.forEach(reservation => {
      if (!reservation.date) {
        preTripItems.push(reservation)
      } else {
        const dateKey = reservation.date
        if (!dateGrouped[dateKey]) dateGrouped[dateKey] = []
        dateGrouped[dateKey].push(reservation)
      }
    })
    return { preTripItems, dateGrouped }
  }, [sortedReservations])

  const stats = useMemo(() => {
    return {
      total: reservations.length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      pending: reservations.filter(r => r.status === 'pending').length,
      completed: reservations.filter(r => r.status === 'completed').length
    }
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
      onUpdate({ ...data, id: editingReservation.id } as Reservation)
    } else {
      onCreate(data)
    }
    handleCloseModal()
  }

  if (isLoading) {
    return <SkeletonList />
  }

  return (
    <div>
      {/* Resumo - identidade da tela de reservas */}
      <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Reservas & Documentos
          </h2>
          <span className="text-sm text-gray-500 font-medium">
            {stats.total} {stats.total === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>

      {stats.total > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className="text-xs text-gray-500">Resumo das reservas</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-gray-700 shadow-sm">
              Total <span className="font-bold text-gray-900">{stats.total}</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-green-100 text-green-800 text-sm font-medium">
              Confirmado <span className="font-bold">{stats.confirmed}</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 text-sm font-medium">
              Pendente <span className="font-bold">{stats.pending}</span>
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
              Concluído <span className="font-bold">{stats.completed}</span>
            </span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {reservations.length === 0 ? (
          <EmptyState
            icon="🎫"
            title="Nenhuma reserva encontrada"
            description="Comece adicionando suas reservas, documentos e ingressos!"
          />
        ) : (
          <>
            {groupedReservations.preTripItems.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-indigo-200 shadow-sm w-fit">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <h3 className="text-base font-semibold text-gray-900">
                    Pré-Viagem
                  </h3>
                  <span className="text-sm text-gray-500">
                    {groupedReservations.preTripItems.length} {groupedReservations.preTripItems.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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

            {Object.entries(groupedReservations.dateGrouped)
              .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
              .map(([date, items]) => (
                <section key={date} className="space-y-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm w-fit mb-3">
                    <span className="text-lg" aria-hidden>📅</span>
                    <span className="text-base font-semibold text-gray-900">
                      {formatDate(date)}
                    </span>
                    <span className="text-sm text-gray-400">
                      · {items.length} {items.length === 1 ? 'reserva' : 'reservas'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
