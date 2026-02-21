import { z } from 'zod'

const typeSchema = z.enum(
  ['document', 'insurance', 'flight', 'train', 'bus', 'accommodation', 'transport-pass', 'activity', 'other'],
  { message: 'O Tipo da reserva é obrigatório.' }
);

const statusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed'], {
  message: 'O Status é obrigatório.'
});

const country = z.enum(['japan', 'south-korea', 'general'], { message: 'O País é obrigatório.' });

export const reservationCreateSchema = z.object({
  type: typeSchema,
  title: z.string().trim().min(1, 'O Título é obrigatório.'),
  description: z.string().optional(),
  confirmationCode: z.string().optional(),
  date: z.coerce.date({
    message: "A Data é obrigatória",
  }),
  endDate: z.coerce.date({
    message: "A Data Fim é obrigatória",
  }),
  time: z.string().optional(),
  provider: z.string().trim().min(1, 'O Provedor é obrigatório.'),
  location: z.string().trim().min(1, 'O Local é obrigatório.'),
  bookingUrl: z.string().optional(),
  documentUrl: z.string().optional(),
  documentFileId: z.string().optional(),
  status: statusSchema,
  notes: z.string().optional(),
  country,
  attractionId: z.number().optional()
});

export const reservationUpdateSchema = reservationCreateSchema.extend({
  id: z.number({ message: 'ID é obrigatório.' })
});