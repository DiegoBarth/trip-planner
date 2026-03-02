import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CountryProvider } from '@/contexts/CountryContext'
import { ToastProvider } from '@/contexts/toast'

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

export function createPageWrapper(initialEntries: string[] = ['/']) {
  const client = createTestQueryClient()
  return function PageWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={initialEntries}>
          <ThemeProvider>
            <CountryProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </CountryProvider>
          </ThemeProvider>
        </MemoryRouter>
      </QueryClientProvider>
    )
  }
}
