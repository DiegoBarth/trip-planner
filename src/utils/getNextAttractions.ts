import { dateToInputFormat } from './formatters'
import type { Attraction } from '@/types/Attraction'

export function getNextAttractions(attractions: Attraction[]): Attraction[] {
  if (attractions.length === 0) return [];

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const futureAttractions = attractions.filter(a => a.date)
    .map(a => ({
      ...a,
      parsedDate: new Date(dateToInputFormat(a.date))
    }))
    .filter(a => a.parsedDate >= today);

  if (futureAttractions.length === 0) return [];

  futureAttractions.sort(
    (a, b) => a.parsedDate.getTime() - b.parsedDate.getTime()
  );

  const nextDate = futureAttractions[0].parsedDate.getTime();

  return futureAttractions
    .filter(a => a.parsedDate.getTime() === nextDate)
    .map(({ parsedDate, ...rest }) => rest);
}