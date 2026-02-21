import { z } from 'zod'

const category = z.enum(
  ['documents', 'clothes', 'electronics', 'hygiene', 'medicines', 'accessories', 'entertainment', 'other'],
  { message: 'A Categoria é obrigatória.' }
);

export const checklistItemCreateSchema = z.object({
  category,
  description: z.string().trim().min(1, 'A Descrição é obrigatória.'),
  isPacked: z.boolean(),
  quantity: z.number().min(1, 'A Quantidade deve ser pelo menos 1.'),
  notes: z.string().optional()
});

export const checklistItemUpdateSchema = checklistItemCreateSchema.extend({
  id: z.number({ message: 'O ID é obrigatório.' })
});