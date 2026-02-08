import type { Toast } from '@/contexts/toast/ToastContext';

interface ToastItemProps {
   toast: Toast;
   onRemove: () => void;
}

export function ToastItem({ toast, onRemove }: ToastItemProps) {
   const bgColors: Record<Toast['type'], string> = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500',
      warning: 'bg-yellow-500',
   };

   const icons: Record<Toast['type'], string> = {
      success: '✅',
      error: '❌',
      info: 'ℹ️',
      warning: '⚠️',
   };

   return (
      <div
         className={`${bgColors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-3 pointer-events-auto`}
         style={{
            animation: 'slideIn 0.3s ease-out',
         }}
      >
         <div className="flex items-center gap-2 flex-1">
            <span className="text-xl flex-shrink-0">{icons[toast.type]}</span>
            <p className="text-sm font-medium">{toast.message}</p>
         </div>
         <button
            onClick={onRemove}
            className="text-white hover:opacity-80 transition-opacity flex-shrink-0 ml-2"
            aria-label="Fechar notificação"
         >
            ✕
         </button>
      </div>
   );
}