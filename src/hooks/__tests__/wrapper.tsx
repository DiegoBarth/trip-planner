import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function createQueryClientWrapper(initialData?: { queryKey: unknown[]; data: unknown }[]) {
  const client = createTestQueryClient()
  initialData?.forEach(({ queryKey, data }) => client.setQueryData(queryKey, data))
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        {children}
      </QueryClientProvider>
    )
  }
}
