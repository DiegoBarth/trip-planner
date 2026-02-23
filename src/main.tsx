import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import App from './App'
import './index.css'

const appRoot = document.getElementById('app-root')

if (!appRoot) {
  throw new Error('app-root element not found')
}

createRoot(appRoot).render(
  <StrictMode>
    <BrowserRouter basename="/trip-planner/">
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </StrictMode>
)