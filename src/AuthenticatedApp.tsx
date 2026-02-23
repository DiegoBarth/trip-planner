import { Suspense, lazy } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CountryProvider } from '@/contexts/CountryContext'
import { ToastProvider } from '@/contexts/toast'
import { queryClient } from '@/lib/queryClient'
import AppRouter from '@/AppRouter'

const PWAUpdatePrompt = lazy(() => import('@/components/PWAUpdatePrompt'))

interface Props {
  onLogout: () => void
}

export default function AuthenticatedApp({ onLogout }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <CountryProvider>
          <ToastProvider>
            <AppRouter onLogout={onLogout} />
            <Suspense fallback={null}>
              <PWAUpdatePrompt />
            </Suspense>
          </ToastProvider>
        </CountryProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}