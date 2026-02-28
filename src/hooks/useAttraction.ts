import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAttraction, updateAttraction, deleteAttraction, getAttractions, bulkUpdateAttractions } from '@/api/attraction'
import { deleteReservation, updateReservation } from '@/api/reservation'
import { updateAttractionCacheOnCreate, updateAttractionCacheOnUpdate, updateAttractionCacheOnDelete } from '@/services/attractionCacheService'
import { updateReservationCacheOnDelete } from '@/services/reservationCacheService'
import { applyAutoDays, normalizeOrderByDate } from '@/utils/attractionDayUtils'
import { dateToInputFormat } from '@/utils/formatters'
import { QUERY_STALE_TIME_MS } from '@/config/constants'
import type { CreateAttractionPayload, UpdateAttractionPayload } from '@/api/attraction'
import type { Attraction } from '@/types/Attraction'
import type { CountryFilterValue } from '@/types/Attraction'
import type { Reservation } from '@/types/Reservation'

const ATTRACTION_QUERY_KEY = ['attractions'];

export function useAttraction(country: CountryFilterValue) {
  const queryClient = useQueryClient();

  const { data: allAttractions = [], isLoading, error } = useQuery<Attraction[]>({
    queryKey: ATTRACTION_QUERY_KEY,
    queryFn: getAttractions,
    staleTime: QUERY_STALE_TIME_MS,
  });

  const rawFiltered =
    country === 'all'
      ? allAttractions
      : allAttractions.filter(a => (a.country ?? 'general') === country);

  const attractions = useMemo(
    () => normalizeOrderByDate(applyAutoDays(rawFiltered)),
    [rawFiltered]
  );

  const availableDays = useMemo(() => {
    const uniqueDays = new Set<number>();

    attractions.forEach(a => {
      if (a.day) uniqueDays.add(a.day);
    });

    return Array.from(uniqueDays).sort((a, b) => a - b);
  }, [attractions]);

  const citiesToPrefetch = useMemo(() => {
    const cities = new Set<string>();

    attractions.forEach(a => {
      if (a.city) cities.add(a.city);
    });

    const withDate = attractions.filter(a => a.date);

    if (withDate.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const sorted = [...withDate]
        .map(a => ({ ...a, parsed: new Date(a.date) }))
        .sort((a, b) => a.parsed.getTime() - b.parsed.getTime());

      const todayOrNext =
        sorted.find(a => a.parsed >= today) ?? sorted[0];

      if (todayOrNext?.city) {
        cities.add(todayOrNext.city);
      }
    }

    return Array.from(cities);
  }, [attractions]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateAttractionPayload) => createAttraction(payload),
    onSuccess: newAttraction => {
      updateAttractionCacheOnCreate(queryClient, newAttraction)
      queryClient.invalidateQueries({ queryKey: ['osrm-routes'] })
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: UpdateAttractionPayload) => {
      const updatedAttraction = await updateAttraction(payload);

      if (updatedAttraction.reservationId && updatedAttraction.reservationStatus) {
        try {
          const reservations = queryClient.getQueryData<Reservation[]>(['reservations']);
          const linkedReservation = reservations?.find(r => r.id === updatedAttraction.reservationId);

          if (linkedReservation) {
            let reservationStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed' | undefined

            if (updatedAttraction.reservationStatus === 'confirmed') reservationStatus = 'confirmed'
            else if (updatedAttraction.reservationStatus === 'pending') reservationStatus = 'pending'
            else if (updatedAttraction.reservationStatus === 'cancelled') reservationStatus = 'cancelled';

            if (reservationStatus) {
              linkedReservation.date = dateToInputFormat(updatedAttraction.date);
              linkedReservation.endDate = dateToInputFormat(updatedAttraction.date);
              linkedReservation.attractionId = updatedAttraction.id;

              await updateReservation({
                ...linkedReservation,
                status: reservationStatus
              });

              queryClient.setQueryData<Reservation[]>(
                ['reservations'],
                (old = []) => old.map(r =>
                  r.id === linkedReservation.id
                    ? { ...r, status: reservationStatus }
                    : r
                )
              );
            }
          }
        } catch (error) {
          console.error('Error syncing status with linked reservation:', error);
        }
      }

      return updatedAttraction;
    },
    onSuccess: updatedAttraction => {
      const previousAttractions = queryClient.getQueryData<Attraction[]>(ATTRACTION_QUERY_KEY);
      const previous = previousAttractions?.find(a => a.id === updatedAttraction.id);

      if (!previous) return;

      updateAttractionCacheOnUpdate(queryClient, previous, updatedAttraction);

      const onlyVisitedChanged =
        previous.visited !== updatedAttraction.visited &&
        previous.lat === updatedAttraction.lat &&
        previous.lng === updatedAttraction.lng &&
        previous.date === updatedAttraction.date &&
        previous.order === updatedAttraction.order &&
        previous.day === updatedAttraction.day;
        
      if (!onlyVisitedChanged) {
        queryClient.invalidateQueries({ queryKey: ['osrm-routes'] });
      }
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const attraction = attractions.find(a => a.id === id);

      if (attraction?.reservationId) {
        try {
          await deleteReservation(attraction.reservationId);

          updateReservationCacheOnDelete(queryClient, attraction.reservationId);
        }
        catch (error) {
          console.error('Error cascade deleting linked reservation:', error);
        }
      }

      return deleteAttraction(id);
    },
    onSuccess: (_, deletedId) => {
      updateAttractionCacheOnDelete(queryClient, deletedId);
      queryClient.invalidateQueries({ queryKey: ['osrm-routes'] });
    }
  });

  const getFreshAttractions = (): Attraction[] => {
    const cachedData = queryClient.getQueryData<Attraction[]>(ATTRACTION_QUERY_KEY);
    const rawData = cachedData ?? allAttractions;

    return normalizeOrderByDate(applyAutoDays(rawData));
  };

  const toggleVisited = async (id: number) => {
    const freshAttractions = getFreshAttractions();
    const attraction = freshAttractions.find(a => a.id === id);

    if (!attraction) return;

    await updateMutation.mutateAsync({
      ...attraction,
      date: dateToInputFormat(attraction.date),
      visited: !attraction.visited
    });
  };

  const bulkUpdate = async (attractionsToUpdate: Attraction[]) => {
    if (attractionsToUpdate.length === 0) return;

    const payload: UpdateAttractionPayload[] = attractionsToUpdate.map(attr => ({
      ...attr,
      date: dateToInputFormat(attr.date)
    }));

    const updated = await bulkUpdateAttractions(payload);

    queryClient.setQueryData<Attraction[]>(ATTRACTION_QUERY_KEY, (old = []) => {
      const updatedMap = new Map(updated.map(a => [a.id, a]));

      return old.map(a => updatedMap.get(a.id) ?? a);
    });

    return updated;
  };

  return {
    attractions,
    availableDays,
    citiesToPrefetch,
    isLoading,
    error,
    createAttraction: createMutation.mutateAsync,
    updateAttraction: updateMutation.mutateAsync,
    deleteAttraction: deleteMutation.mutateAsync,
    toggleVisited,
    bulkUpdate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  }
}