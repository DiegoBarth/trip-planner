import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import type { Toast } from '@/contexts/toast/ToastContext'

interface ToastItemProps {
   toast: Toast
   onRemove: () => void
}

const iconByType = {
   success: CheckCircle,
   error: XCircle,
   info: Info,
   warning: AlertTriangle,
}

const iconColorByType: Record<Toast['type'], string> = {
   success: 'text-emerald-200',
   error: 'text-red-200',
   info: 'text-blue-200',
   warning: 'text-amber-200',
}

export function ToastItem({ toast, onRemove }: ToastItemProps) {
   const Icon = iconByType[toast.type]
   const iconColor = iconColorByType[toast.type]

   return (
      <div
         className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 pointer-events-auto border border-white/10"
         style={{ animation: 'slideUp 0.3s ease-out' }}
      >
         <div className={`flex-shrink-0 ${iconColor}`}>
            <Icon className="w-5 h-5" strokeWidth={2} />
         </div>
         <p className="text-sm font-medium flex-1 min-w-0">{toast.message}</p>
         <button
            type="button"
            onClick={onRemove}
            className="text-white/90 hover:text-white transition-colors flex-shrink-0 p-0.5 rounded-md hover:bg-white/10 focus:ring-2 focus:ring-white/30 focus:outline-none"
            aria-label="Fechar notificação"
         >
            <X className="w-4 h-4" strokeWidth={2.5} />
         </button>
      </div>
   )
}