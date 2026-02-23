import type { AttractionStats } from '@/types/Dashboard'

export function AttractionStatusCards({ status }: { status: AttractionStats }) {
  const progress = status.visitedPercentage;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between mb-4">
        <h2 className="font-bold text-gray-700 dark:text-gray-200 text-lg">🎢 Progresso da Viagem</h2>
        <span className="text-purple-600 dark:text-purple-400 font-semibold">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-4 mb-6">
        <div
          className="bg-gradient-to-r from-purple-500 to-indigo-500 h-4 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-3 text-center gap-4">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">{status.total}</p>
        </div>
        <div>
          <p className="text-xs text-emerald-700 dark:text-emerald-300">Visitados</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">{status.visited}</p>
        </div>
        <div>
          <p className="text-xs text-amber-700 dark:text-amber-300">Pendentes</p>
          <p className="font-bold text-gray-900 dark:text-gray-100">{status.total - status.visited}</p>
        </div>
      </div>
    </div>
  );
}