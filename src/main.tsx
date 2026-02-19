import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { ToastProvider } from '@/contexts/toast'
import { QueryClientProvider } from '@tanstack/react-query'
import { CountryProvider } from './contexts/CountryContext.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { GOOGLE_CLIENT_ID } from '@/config/constants'
import { createQueryClient } from '@/lib/queryClient'
import App from './App.tsx'
import './index.css'
import 'leaflet/dist/leaflet.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID ?? ''}>
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
    </GoogleOAuthProvider>
  </StrictMode>,
)