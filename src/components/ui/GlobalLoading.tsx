import Loader2 from 'lucide-react/dist/esm/icons/loader-2';
import { useIsMutating } from '@tanstack/react-query'

/**
 * Full-screen loading only for mutations (save/delete/etc.).
 * Read queries refetch in the background (focus/reconnect) so navigating Home does not
 * block the UI; use local skeletons/spinners where a specific first load is critical.
 */
export function GlobalLoading() {
  const isMutating = useIsMutating();
  const isLoading = isMutating > 0;

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 dark:bg-black/50 backdrop-blur-sm"
      role="status"
      aria-label="Carregando"
      aria-busy
    >
      <div className="flex flex-col items-center gap-4 px-8 py-6">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 dark:text-blue-400" aria-hidden />
        <span className="text-sm font-medium text-white">Aguarde...</span>
      </div>
    </div>
  );
}