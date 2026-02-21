import type { z } from 'zod'

export type ToastError = { error: (message: string) => void }

/**
 * Valida os dados com o schema Zod. Se falhar, exibe um toast para cada campo com erro e retorna false.
 */
export function validateWithToast<T>(
  data: unknown,
  schema: z.ZodType<T>,
  toast: ToastError
): data is T {
  const result = schema.safeParse(data)
  if (result.success) return true
  const messages = result.error.issues.map(
    issue => issue.message ?? 'Preencha os campos obrigatórios.'
  )
  // Exibe os toasts após o handler do modal para garantir que apareçam (z-index e ciclo do React)
  setTimeout(() => {
    for (const message of messages) {
      toast.error(message)
    }
  }, 0)
  return false
}
