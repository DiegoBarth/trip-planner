import { useState, useMemo } from 'react'
import Plus from 'lucide-react/dist/esm/icons/plus';
import { ReservationList } from '@/components/reservation/ReservationList'
import { PageHeader } from '@/components/ui/PageHeader'
import { CountryFilter } from '@/components/home/CountryFilter'
import { Fab } from '@/components/ui/Fab'
import { useReservation } from '@/hooks/useReservation'
import { useCountry } from '@/contexts/CountryContext'
import { useToast } from '@/contexts/toast'
import { ModalReservation } from '@/components/reservation/ModalReservation'
import type { Reservation } from '@/types/Reservation'

export default function ReservationsPage() {
  const [showModal, setShowModal] = useState(false);
  const { country, reservations, isReady } = useCountry();

  const filteredReservations = useMemo(() => {
    if (country === 'all') return reservations;

    return reservations.filter((r) => r.country === country);
  }, [reservations, country]);

  const { createReservation, updateReservation, deleteReservation } = useReservation();
  const toast = useToast();

  const handleCreate = async (data: Omit<Reservation, 'id'>) => {
    try {
      await createReservation(data);

      toast.success('Reserva criada com sucesso!');
    }
    catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Erro ao criar reserva');
    }
  };

  const handleUpdate = async (reservation: Reservation) => {
    try {
      await updateReservation(reservation);

      toast.success('Reserva atualizada com sucesso!');
    }
    catch (error) {
      console.error('Error updating reservation:', error);
      toast.error('Erro ao atualizar reserva');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteReservation(id);

      toast.success('Reserva excluída com sucesso!');
    }
    catch (error) {
      console.error('Error deleting reservation:', error);
      toast.error('Erro ao excluir reserva');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
      <PageHeader
        title="Reservas"
        subtitle="Gerencie suas reservas e documentos"
        filter={<CountryFilter showDayFilter={false} />}
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 mb-12">
        <ReservationList
          reservations={filteredReservations}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          isLoading={!isReady}
        />
      </main>

      <Fab
        onClick={() => setShowModal(true)}
        icon={<Plus className="w-6 h-6" />}
        label="Adicionar"
      />

      {showModal && (
        <ModalReservation
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={async (data) => {
            await handleCreate(data as any)
            setShowModal(false)
          }}
        />
      )}
    </div>
  );
}