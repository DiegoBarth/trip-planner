import { useState, useMemo } from 'react'
import FileCheck from 'lucide-react/dist/esm/icons/file-check';
import { ReservationCard } from '@/components/reservation/ReservationCard'
import { ModalReservation } from '@/components/reservation/ModalReservation'
import { ReservationActionsModal } from '@/components/reservation/ReservationActionsModal'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatDate, dateToInputFormat, parseLocalDate } from '@/utils/formatters'
import type { Reservation } from '@/types/Reservation'

interface ReservationListProps {
  reservations: Reservation[]
  onUpdate: (reservation: Reservation) => void
  onCreate: (reservation: Omit<Reservation, 'id'>) => void
  onDelete: (id: number) => void
  isLoading?: boolean
}

export function ReservationList({ reservations, onUpdate, onCreate, onDelete, isLoading = false }: ReservationListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | undefined>();
  const [reservationToDelete, setReservationToDelete] = useState<Reservation | null>(null);
  const [reservationForActions, setReservationForActions] = useState<Reservation | null>(null);

  function timeToMinutes(t: string | undefined): number {
    if (!t || !t.trim()) return 24 * 60;

    const parts = t.trim().split(':').map(Number);
    const h = parts[0] ?? 0;
    const m = parts[1] ?? 0;
    const s = parts[2] ?? 0;

    return h * 60 + m + s / 60;
  }

  const groupedReservations = useMemo(() => {
    const preTripItems: Reservation[] = [];
    const dateGrouped: Record<string, Reservation[]> = {};

    reservations.forEach(reservation => {
      if (!reservation.date) {
        preTripItems.push(reservation);
      }
      else {
        const dateKey = dateToInputFormat(reservation.date);

        if (!dateGrouped[dateKey]) dateGrouped[dateKey] = [];

        dateGrouped[dateKey].push(reservation);
      }
    })

    const orderedDateKeys = Object.keys(dateGrouped).sort(
      (a, b) => parseLocalDate(a).getTime() - parseLocalDate(b).getTime()
    );

    orderedDateKeys.forEach(key => {
      dateGrouped[key].sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
    });

    return { preTripItems, dateGrouped, orderedDateKeys };
  }, [reservations]);

  const stats = useMemo(() => {
    return {
      total: reservations.length,
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      pending: reservations.filter(r => r.status === 'pending').length,
      completed: reservations.filter(r => r.status === 'completed').length
    }
  }, [reservations]);

  const handleCloseModal = () => {
    setEditingReservation(undefined);
    setIsModalOpen(false);
  };

  const handleSave = async (data: Omit<Reservation, 'id'>) => {
    if (editingReservation) {
      await Promise.resolve(onUpdate({ ...data, id: editingReservation.id } as Reservation));
    }
    else {
      await Promise.resolve(onCreate(data));
    }
  };

  const handleConfirmDelete = async () => {
    if (!reservationToDelete) return;

    await onDelete(reservationToDelete.id);

    setReservationToDelete(null);
  };

  const handleCardClick = (reservation: Reservation) => {
    setReservationForActions(reservation);
  };

  const handleOpenEditFromActions = (reservation: Reservation) => {
    setReservationForActions(null);
    setEditingReservation(reservation);
    setIsModalOpen(true);
  };

  const handleOpenDeleteFromActions = (reservation: Reservation) => {
    setReservationForActions(null);
    setReservationToDelete(reservation);
  };

  if (isLoading) return null;

  return (
    <div>
      {stats.total > 0 && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-100 dark:border-indigo-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Resumo das reservas</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
              Total <span className="font-bold text-gray-900 dark:text-gray-100">{stats.total}</span>
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
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 shadow-sm w-fit">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                    Pré-Viagem
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {groupedReservations.preTripItems.length} {groupedReservations.preTripItems.length === 1 ? 'item' : 'itens'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groupedReservations.preTripItems.map(reservation => (
                    <ReservationCard
                      key={reservation.id}
                      reservation={reservation}
                      onClick={handleCardClick}
                    />
                  ))}
                </div>
              </section>
            )}

            {groupedReservations.orderedDateKeys.map(date => {
              const items = groupedReservations.dateGrouped[date]
              return (
                <section key={date} className="space-y-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm w-fit mb-3">
                    <span className="text-lg" aria-hidden>📅</span>
                    <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {formatDate(date)}
                    </span>
                    <span className="text-sm text-gray-400 dark:text-gray-500">
                      · {items.length} {items.length === 1 ? 'reserva' : 'reservas'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map(reservation => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        onClick={handleCardClick}
                      />
                    ))}
                  </div>
                </section>
              )
            })}
          </>
        )}
      </div>

      <ModalReservation
        reservation={editingReservation}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />

      <ReservationActionsModal
        reservation={reservationForActions}
        isOpen={!!reservationForActions}
        onClose={() => setReservationForActions(null)}
        onEdit={handleOpenEditFromActions}
        onDelete={handleOpenDeleteFromActions}
      />

      <ConfirmModal
        isOpen={!!reservationToDelete}
        onClose={() => setReservationToDelete(null)}
        title="Excluir reserva"
        message={
          reservationToDelete ? (
            <>Tem certeza que deseja excluir &quot;{reservationToDelete.title}&quot;?</>
          ) : null
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}