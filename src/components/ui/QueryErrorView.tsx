import { AlertTriangle, RefreshCw } from 'lucide-react'

interface QueryErrorViewProps {
  message?: string
  onRetry?: () => void
  title?: string
}

export function QueryErrorView({
  message = 'Não foi possível carregar os dados. Verifique sua conexão.',
  onRetry,
  title = 'Erro ao carregar'
}: QueryErrorViewProps) {
  return (
    <div
      className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900 min-h-[280px] rounded-2xl border border-slate-200 dark:border-slate-700"
      role="alert"
      aria-live="polite"
    >
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 mb-4">
        <AlertTriangle className="w-7 h-7" aria-hidden />
      </div>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">
        {title}
      </h2>
      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 max-w-sm">
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-medium hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <RefreshCw className="w-4 h-4" aria-hidden />
          Tentar novamente
        </button>
      )}
    </div>
  )
}
