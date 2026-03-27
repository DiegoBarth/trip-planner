/** Place inside ConverterPage result box (same padding/container as loaded state). */

export function ConverterRatesSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando taxas de câmbio"
      className="flex flex-col items-center justify-center space-y-2 w-full animate-pulse"
    >
      <div className="h-3 w-32 rounded bg-gray-200 dark:bg-gray-600" />
      <div className="h-8 w-44 max-w-full rounded bg-gray-200 dark:bg-gray-600" />
    </div>
  )
}
