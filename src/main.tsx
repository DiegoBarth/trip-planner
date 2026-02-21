import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '@/contexts/toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { CountryProvider } from './contexts/CountryContext.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { createQueryClient } from '@/lib/queryClient'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename="/trip-planner/">
        <QueryClientProvider client={createQueryClient}>
          <ThemeProvider>
            <CountryProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </CountryProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)