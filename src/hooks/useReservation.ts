import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createReservation, updateReservation, deleteReservation, getReservations, deleteFile } from '@/api/reservation'
import { deleteAttraction, updateAttraction } from '@/api/attraction'
import { updateReservationCacheOnCreate, updateReservationCacheOnUpdate, updateReservationCacheOnDelete } from '@/services/reservationCacheService'
import { updateAttractionCacheOnDelete } from '@/services/attractionCacheService'
import { dateToInputFormat } from '@/utils/formatters'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type { Attraction } from '@/types/Attraction'
import type { Reservation } from '@/types/Reservation'
import type { CreateReservationPayload, UpdateReservationPayload } from '@/api/reservation'

const RESERVATION_QUERY_KEY = ['reservations'];

export function useReservation() {
  const queryClient = useQueryClient();

  const { data: reservations = [], isLoading, error } = useQuery({
    queryKey: RESERVATION_QUERY_KEY,
    queryFn: getReservations,
    staleTime: QUERY_STALE_TIME_MS
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateReservationPayload) =>
      createReservation(payload),
    onSuccess: newReservation => {
      updateReservationCacheOnCreate(queryClient, newReservation);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateReservationPayload) => {
      const oldReservation = reservations.find((r: Reservation) => r.id === payload.id)

      if (oldReservation?.documentFileId && oldReservation.documentFileId !== payload.documentFileId) {
        try {
          await deleteFile(oldReservation.documentFileId)
        }
        catch (error) {
          console.error('Error deleting old file from Drive:', error)
        }
      }

      payload.date = payload.date ? dateToInputFormat(payload.date) : undefined;
      payload.endDate = payload.endDate ? dateToInputFormat(payload.endDate) : undefined;

      const updatedReservation = await updateReservation(payload);

      if (updatedReservation.attractionId && updatedReservation.status) {
        try {
          const attractionCountries: ('japan' | 'south-korea' | 'general')[] = ['japan', 'south-korea', 'general'];

          let linkedAttraction: Attraction | null = null;
          let attractionCountry: 'japan' | 'south-korea' | 'general' | null = null;

          for (const country of attractionCountries) {
            const attractions = queryClient.getQueryData<Attraction[]>(['attractions', country]);

            if (attractions) {
              const found = attractions.find(a => a.id === updatedReservation.attractionId);

              if (found) {
                linkedAttraction = found;
                attractionCountry = country;

                break;
              }
            }
          }

          if (linkedAttraction && attractionCountry) {
            let attractionStatus: 'pending' | 'confirmed' | 'cancelled' | undefined;

            if (updatedReservation.status === 'confirmed') attractionStatus = 'confirmed'
            else if (updatedReservation.status === 'pending') attractionStatus = 'pending'
            else if (updatedReservation.status === 'cancelled') attractionStatus = 'cancelled';

            if (attractionStatus) {
              await updateAttraction({
                ...linkedAttraction,
                date: dateToInputFormat(linkedAttraction.date),
                reservationStatus: attractionStatus
              });

              queryClient.setQueryData<Attraction[]>(
                ['attractions', attractionCountry],
                (old = []) => old.map(a =>
                  a.id === linkedAttraction!.id
                    ? { ...a, reservationStatus: attractionStatus }
                    : a
                )
              );
            }
          }
        }
        catch (error) {
          console.error('Error syncing status with linked attraction:', error);
        }
      }

      return updatedReservation;
    },
    onSuccess: updatedReservation => {
      updateReservationCacheOnUpdate(queryClient, updatedReservation);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const reservation = reservations.find((r: Reservation) => r.id === id);

      if (reservation?.documentFileId) {
        try {
          await deleteFile(reservation.documentFileId);
        }
        catch (error) {
          console.error('Error deleting file from Drive:', error);
        }
      }

      if (reservation?.attractionId) {
        try {
          await deleteAttraction(reservation.attractionId);

          const attractionCountries: ('japan' | 'south-korea' | 'general')[] = ['japan', 'south-korea', 'general'];

          for (const country of attractionCountries) {
            const attractions = queryClient.getQueryData<Attraction[]>(['attractions', country]);

            if (attractions?.some(a => a.id === reservation.attractionId)) {
              updateAttractionCacheOnDelete(queryClient, reservation.attractionId);

              break;
            }
          }
        }
        catch (error) {
          console.error('Error cascade deleting linked attraction:', error);
        }
      }

      return deleteReservation(id);
    },
    onSuccess: (_, deletedId) => {
      updateReservationCacheOnDelete(queryClient, deletedId);
    }
  });

  return {
    reservations,
    isLoading,
    error,
    createReservation: createMutation.mutateAsync,
    updateReservation: updateMutation.mutateAsync,
    deleteReservation: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}