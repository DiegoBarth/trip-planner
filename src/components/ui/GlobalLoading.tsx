import { useIsFetching, useIsMutating } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

/**
 * Overlay de loading no centro da tela.
 * Bloqueia cliques e edições no fundo enquanto há queries ou mutations em andamento (React Query).
 * Requisições OSRM (rotas) são ignoradas para não bloquear a UI.
 */
export function GlobalLoading() {
  const isFetching = useIsFetching({
    predicate: (query) => {
      const key = query.queryKey[0]
      return key !== 'weather' && key !== 'budget_summary'
    },
  })
  const isMutating = useIsMutating()
  const isLoading = isFetching > 0 || isMutating > 0

  if (!isLoading) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-sm"
      role="status"
      aria-label="Carregando"
      aria-busy
    >
      <div className="flex flex-col items-center gap-4 px-8 py-6">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 dark:text-blue-400" aria-hidden />
        <span className="text-sm font-medium text-white">Aguarde...</span>
      </div>
    </div>
  )
}
