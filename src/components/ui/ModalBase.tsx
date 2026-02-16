import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { cn } from '@/lib/utils'

interface ModalBaseProps {
   isOpen: boolean
   onClose: () => void
   title?: string
   children: React.ReactNode
   type: 'create' | 'edit'
   onSave?: () => void
   onDelete?: () => void
   loading?: boolean
   loadingText?: string
   size?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Base modal component with full accessibility
 * 
 * A11y features:
 * - ARIA attributes (role, aria-modal, aria-labelledby)
 * - Focus trap (Tab cycles only within modal)
 * - Escape key to close
 * - Screen reader friendly
 * - Restores focus on close
 * 
 * WCAG 2.1 compliant: 2.1.2, 2.4.3, 4.1.2
 */
export function ModalBase({
   isOpen,
   onClose,
   title,
   children,
   type,
   onSave,
   onDelete,
   loading = false,
   loadingText = 'Salvando...',
   size = 'md'
}: ModalBaseProps) {
   const trapRef = useFocusTrap(isOpen)

   const sizeClasses = {
      sm: 'md:w-[400px]',
      md: 'md:w-[500px]',
      lg: 'md:w-[600px]',
      xl: 'md:w-[800px]'
   }

   // Close modal with Escape key (a11y)
   useEffect(() => {
      if (!isOpen) return

      function handleEscape(e: KeyboardEvent) {
         if (e.key === 'Escape' && !loading) {
            onClose()
         }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
   }, [isOpen, loading, onClose])

   if (!isOpen) return null

   return (
      <div
         className="fixed inset-0 z-[60] flex justify-center items-end md:items-center"
         role="dialog"
         aria-modal="true"
         aria-labelledby={title ? 'modal-title' : undefined}
      >
         {/* Overlay */}
         <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={loading ? undefined : onClose}
            aria-hidden="true"
         />

         {/* Modal Container with focus trap */}
         <div
            ref={trapRef}
            className={cn(
               'relative w-full max-h-[80vh] md:max-h-[90vh] bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl flex flex-col shadow-2xl',
               sizeClasses[size]
            )}
         >
            {/* Header */}
            {title && (
               <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <h2 id="modal-title" className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
                     {title}
                  </h2>
                  <button
                     onClick={loading ? undefined : onClose}
                     disabled={loading}
                     aria-label="Fechar modal"
                     className={cn(
                        'p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none',
                        loading && 'opacity-50 cursor-not-allowed'
                     )}
                  >
                     <X className="w-5 h-5" />
                  </button>
               </div>
            )}

            {/* Content */}
            <div className="px-4 py-3 md:px-6 md:py-4 overflow-y-auto flex-1 min-h-0">
               {children}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-4 py-3 md:px-6 md:py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/80 flex-shrink-0">
               <button
                  onClick={onClose}
                  disabled={loading}
                  aria-label="Cancelar e fechar modal"
                  className={cn(
                     'flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none',
                     loading && 'opacity-50 cursor-not-allowed'
                  )}
               >
                  Cancelar
               </button>

               {type === 'edit' && onDelete && (
                  <button
                     onClick={onDelete}
                     disabled={loading}
                     aria-label="Excluir registro permanentemente"
                     type="button"
                     className={cn(
                        'flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all focus:ring-2 focus:ring-red-500 dark:focus:ring-red-500 focus:outline-none',
                        loading ? 'bg-red-500 cursor-wait' : 'bg-red-600 hover:bg-red-700'
                     )}
                  >
                     {loading && loadingText === 'Excluindo...' ? 'Excluindo...' : 'Excluir'}
                  </button>
               )}

               {onSave && (
                  <button
                     onClick={onSave}
                     disabled={loading}
                     aria-label={type === 'create' ? 'Salvar novo registro' : 'Salvar alterações'}
                     type="button"
                     className={cn(
                        'flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 focus:outline-none',
                        loading ? 'bg-blue-500 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'
                     )}
                  >
                     {loading && loadingText !== 'Excluindo...' ? loadingText : 'Salvar'}
                  </button>
               )}
            </div>
         </div>
      </div>
   )
}