import { z } from 'zod'

const country = z.enum(['japan', 'south-korea', 'general'], { message: 'O País é obrigatório.' });

const currency = z.enum(['JPY', 'KRW', 'BRL'], { message: 'A Moeda é obrigatória.' });

const typeSchema = z.enum(
  ['temple', 'museum', 'park', 'shopping', 'restaurant', 'viewpoint', 'cultural', 'entertainment', 'other'],
  { message: 'O Tipo da atração é obrigatório.' }
);

export const attractionCreateSchema = z.object({
  name: z.string().trim().min(1, 'O Nome da atração é obrigatório.'),
  country,
  city: z.string().trim().min(1, 'A Cidade é obrigatória.'),
  region: z.string().optional(),
  day: z.number().optional(),
  date: z.coerce.date({
    message: "A Data é obrigatória",
  }),
  dayOfWeek: z.string().optional(),
  type: typeSchema,
  order: z.number().optional(),
  visited: z.boolean(),
  needsReservation: z.boolean(),
  reservationStatus: z.string().optional(),
  couplePrice: z.number().positive('O Valor (casal) é obrigatório'),
  currency,
  priceInBRL: z.number().min(0),
  idealPeriod: z.string().optional(),
  isOpen: z.boolean().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  closedDays: z.string().optional(),
  ticketLink: z.string().optional(),
  location: z.string().optional(),
  duration: z.number().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
  reservationId: z.number().optional()
});

export const attractionUpdateSchema = attractionCreateSchema.extend({
  id: z.number({ message: 'ID é obrigatório.' })
});