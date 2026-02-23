import { Suspense, lazy } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { CountryProvider } from '@/contexts/CountryContext'
import { ToastProvider } from '@/contexts/toast'
import { queryClient } from '@/lib/queryClient'

const AppRouter = lazy(() => import('@/AppRouter'))
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
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen bg-slate-50">
                  <div className="animate-pulse text-sm text-slate-400">
                    Carregando…
                  </div>
                </div>
              }
            >
              <AppRouter onLogout={onLogout} />
              <PWAUpdatePrompt />
            </Suspense>
          </ToastProvider>
        </CountryProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}