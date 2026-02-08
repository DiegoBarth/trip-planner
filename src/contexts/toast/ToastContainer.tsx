import type { Toast } from '@/contexts/toast/ToastContext';
import { ToastItem } from '@/contexts/toast/ToastItem';

interface ToastContainerProps {
   toasts: Toast[];
   onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
   return (
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
         {toasts.map(toast => (
            <ToastItem
               key={toast.id}
               toast={toast}
               onRemove={() => onRemove(toast.id)}
            />
         ))}
      </div>
   );
}