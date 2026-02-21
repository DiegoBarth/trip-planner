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

// Expense API response
const expenseCategorySchema = z.enum(['accommodation', 'transport', 'food', 'attraction', 'shopping', 'other'])
const expenseBudgetOriginSchema = z.enum(['Diego', 'Pamela', 'Casal', 'Alimentação', 'Atrações', 'Transporte'])
export const expenseApiSchema = z.object({
  id: z.number(),
  description: z.string(),
  amount: z.number(),
  currency: z.enum(['JPY', 'KRW', 'BRL']),
  amountInBRL: z.number(),
  category: expenseCategorySchema,
  budgetOrigin: expenseBudgetOriginSchema,
  date: z.string(),
  country: z.enum(['japan', 'south-korea', 'general']).optional(),
  notes: z.string().optional(),
  receiptUrl: z.string().optional(),
}).passthrough()
export const expensesResponseSchema = z.array(expenseApiSchema)

export function parseExpenses(data: unknown): z.infer<typeof expensesResponseSchema> {
  const result = expensesResponseSchema.safeParse(data)
  if (!result.success) {
    throw new Error('Resposta da API com formato inválido (gastos).')
  }
  return result.data
}

// Reservation API response
const reservationTypeSchema = z.enum(['document', 'insurance', 'flight', 'train', 'bus', 'accommodation', 'transport-pass', 'activity', 'other'])
const bookingStatusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed'])
export const reservationApiSchema = z.object({
  id: z.number(),
  type: reservationTypeSchema,
  title: z.string(),
  description: z.string().optional(),
  confirmationCode: z.string().optional(),
  date: z.string().optional(),
  endDate: z.string().optional(),
  time: z.string().optional(),
  location: z.string().optional(),
  provider: z.string().optional(),
  bookingUrl: z.string().optional(),
  documentUrl: z.string().optional(),
  documentFileId: z.string().optional(),
  status: bookingStatusSchema,
  notes: z.string().optional(),
  country: z.enum(['japan', 'south-korea', 'general']).optional(),
  attractionId: z.number().optional(),
}).passthrough()
export const reservationsResponseSchema = z.array(reservationApiSchema)

export function parseReservations(data: unknown): z.infer<typeof reservationsResponseSchema> {
  const result = reservationsResponseSchema.safeParse(data)
  if (!result.success) {
    throw new Error('Resposta da API com formato inválido (reservas).')
  }
  return result.data
}

// Checklist API response
const checklistCategorySchema = z.enum(['documents', 'clothes', 'electronics', 'hygiene', 'medicines', 'accessories', 'entertainment', 'other'])
export const checklistItemApiSchema = z.object({
  id: z.number(),
  description: z.string(),
  category: checklistCategorySchema,
  isPacked: z.boolean(),
  quantity: z.number().optional(),
  notes: z.string().optional(),
}).passthrough()
export const checklistResponseSchema = z.array(checklistItemApiSchema)

export function parseChecklistItems(data: unknown): z.infer<typeof checklistResponseSchema> {
  const result = checklistResponseSchema.safeParse(data)
  if (!result.success) {
    throw new Error('Resposta da API com formato inválido (checklist).')
  }
  return result.data
}
