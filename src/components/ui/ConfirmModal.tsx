import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: React.ReactNode
  confirmLabel?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
}

export function ConfirmModal({ isOpen, onClose, title, message, confirmLabel = 'Excluir', onConfirm, loading = false }: ConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const trapRef = useFocusTrap(isOpen);
  const busy = loading || isSubmitting;

  const handleConfirm = async () => {
    setIsSubmitting(true)

    try {
      await Promise.resolve(onConfirm());

      onClose();
    }
    finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && !busy) onClose();
    }

    document.addEventListener('keydown', handleEscape);

    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, busy, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[600] flex justify-center items-end md:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={busy ? undefined : onClose}
        aria-hidden="true"
      />
      <div
        ref={trapRef}
        className="relative w-full max-w-sm md:max-w-md bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl shadow-2xl mx-auto"
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 id="confirm-modal-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h2>
          <button
            type="button"
            onClick={busy ? undefined : onClose}
            disabled={busy}
            aria-label="Fechar"
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-3 md:px-6 md:py-4 text-gray-600 dark:text-gray-300 text-sm">
          {message}
        </div>
        <div className="flex gap-3 px-4 py-3 md:px-6 md:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:ring-2 focus:ring-gray-300 focus:outline-none',
              busy && 'opacity-50 cursor-not-allowed'
            )}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            className={cn(
              'flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors focus:ring-2 focus:ring-red-500 focus:outline-none',
              busy ? 'bg-red-500 cursor-wait' : 'bg-red-600 hover:bg-red-700'
            )}
          >
            {busy ? 'Excluindo...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}