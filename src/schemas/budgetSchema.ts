import { z } from 'zod'

const origin = z.enum(['Diego', 'Pamela', 'Casal', 'Alimentação', 'Atrações', 'Transporte'], {
  message: 'Origem do orçamento é obrigatória'
});

export const budgetCreateSchema = z.object({
  origin,
  description: z.string().trim().min(1, 'A Descrição é obrigatória'),
  amount: z.number().positive('O Valor é obrigatório'),
  date: z.coerce.date({
    message: "A Data é obrigatória",
  })
});

export const budgetUpdateSchema = budgetCreateSchema.extend({
  id: z.number({ message: 'ID é obrigatório.' })
});