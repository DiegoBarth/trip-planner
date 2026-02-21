import { z } from 'zod'

const countrySchema = z.enum(['japan', 'south-korea', 'general'])
const currencySchema = z.enum(['JPY', 'KRW', 'BRL'])
const attractionTypeSchema = z.enum([
  'temple', 'museum', 'park', 'shopping', 'restaurant', 'viewpoint',
  'cultural', 'entertainment', 'other'
])
const reservationStatusSchema = z.enum(['not-needed', 'pending', 'confirmed', 'cancelled']).optional()

export const attractionSchema = z.object({
  id: z.number(),
  name: z.string(),
  country: countrySchema,
  city: z.string(),
  region: z.string().optional(),
  day: z.number(),
  date: z.string(),
  dayOfWeek: z.string(),
  type: attractionTypeSchema,
  order: z.number(),
  idealPeriod: z.string().optional(),
  isOpen: z.boolean().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  closedDays: z.string().optional(),
  visited: z.boolean(),
  needsReservation: z.boolean(),
  reservationStatus: reservationStatusSchema,
  reservationId: z.number().optional(),
  couplePrice: z.number(),
  currency: currencySchema,
  priceInBRL: z.number(),
  ticketLink: z.string().optional(),
  location: z.string().optional(),
  duration: z.number().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
}).passthrough()

export const attractionsResponseSchema = z.array(attractionSchema)

export function parseAttractions(data: unknown): z.infer<typeof attractionsResponseSchema> {
  const result = attractionsResponseSchema.safeParse(data)
  if (!result.success) {
    throw new Error('Resposta da API com formato inválido (atrações).')
  }
  return result.data
}

const budgetOriginSchema = z.enum(['Diego', 'Pamela', 'Casal', 'Alimentação', 'Atrações', 'Transporte'])

export const budgetSchema = z.object({
  id: z.number(),
  origin: budgetOriginSchema,
  description: z.string(),
  amount: z.number(),
  date: z.string(),
}).passthrough()

export const budgetsResponseSchema = z.array(budgetSchema)

export function parseBudgets(data: unknown): z.infer<typeof budgetsResponseSchema> {
  const result = budgetsResponseSchema.safeParse(data)
  if (!result.success) {
    throw new Error('Resposta da API com formato inválido (orçamentos).')
  }
  return result.data
}
