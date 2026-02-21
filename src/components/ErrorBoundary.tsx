import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-4">
              <AlertTriangle className="w-8 h-8" aria-hidden />
            </div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Algo deu errado
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Ocorreu um erro inesperado. Tente recarregar a página.
            </p>
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-medium hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <RefreshCw className="w-4 h-4" aria-hidden />
              Tentar novamente
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
