import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from '@/contexts/toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CountryProvider } from './contexts/CountryContext.tsx'
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         retry: 1,
         refetchOnWindowFocus: false,
      },
   },
})

createRoot(document.getElementById('root')!).render(
   <StrictMode>
      <BrowserRouter basename="/trip-planner/">
         <QueryClientProvider client={queryClient}>
            <CountryProvider>
               <ToastProvider>
                  <App />
               </ToastProvider>
            </CountryProvider>
         </QueryClientProvider>
      </BrowserRouter>
   </StrictMode>,
)
