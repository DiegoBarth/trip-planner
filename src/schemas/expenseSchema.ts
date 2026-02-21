import { z } from 'zod'

const category = z.enum(
  ['accommodation', 'transport', 'food', 'attraction', 'shopping', 'other'],
  { message: 'Categoria é obrigatória.' }
);

const currency = z.enum(['JPY', 'KRW', 'BRL'], { message: 'Moeda é obrigatória.' });

const budgetOrigin = z.enum(['Diego', 'Pamela', 'Casal', 'Alimentação', 'Atrações', 'Transporte'], {
  message: 'A Origem do pagamento é obrigatória.'
});

const country = z.enum(['japan', 'south-korea', 'general'], { message: 'O País é obrigatório.' });

export const expenseCreateSchema = z.object({
  category,
  description: z.string().trim().min(1, 'A Descrição é obrigatória'),
  amount: z.number().positive('O Valor é obrigatório'),
  currency,
  amountInBRL: z.number().min(0),
  budgetOrigin,
  date: z.coerce.date({
    message: "A Data é obrigatória",
  }),
  country,
  notes: z.string().optional(),
  receiptUrl: z.string().optional()
});

export const expenseUpdateSchema = expenseCreateSchema.extend({
  id: z.number({ message: 'ID é obrigatório.' })
});