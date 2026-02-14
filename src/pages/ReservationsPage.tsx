import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { ReservationList } from '@/components/reservation/ReservationList'
import { useReservation } from '@/hooks/useReservation'
import { useToast } from '@/contexts/toast'
import type { Reservation } from '@/types/Reservation'

export function ReservationsPage() {
   const navigate = useNavigate()
   const { reservations, createReservation, updateReservation, deleteReservation, isLoading } = useReservation()
   const toast = useToast()

   const handleCreate = async (data: Omit<Reservation, 'id'>) => {
      try {
         await createReservation(data)
         toast.success('Reserva criada com sucesso!')
      } catch (error) {
         console.error('Error creating reservation:', error)
         toast.error('Erro ao criar reserva')
      }
   }

   const handleUpdate = async (reservation: Reservation) => {
      try {
         await updateReservation(reservation)
         toast.success('Reserva atualizada com sucesso!')
      } catch (error) {
         console.error('Error updating reservation:', error)
         toast.error('Erro ao atualizar reserva')
      }
   }

   const handleDelete = async (id: number) => {
      try {
         await deleteReservation(id)
         toast.success('Reserva excluída com sucesso!')
      } catch (error) {
         console.error('Error deleting reservation:', error)
         toast.error('Erro ao excluir reserva')
      }
   }

   return (
      <Layout
         title="🎫 Reservas"
         onBack={() => navigate('/')}
         headerClassName="bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
      >
         <ReservationList
            reservations={reservations}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isLoading={isLoading}
         />
      </Layout>
   )
}
