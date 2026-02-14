import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { ChecklistItem, ChecklistCategory } from '@/types/ChecklistItem'
import { CHECKLIST_CATEGORIES } from '@/config/constants'
import { ModalBase } from '@/components/ui/ModalBase'

interface ModalChecklistItemProps {
   item?: ChecklistItem
   isOpen: boolean
   onClose: () => void
   onSave: (item: Omit<ChecklistItem, 'id'>) => void
}

interface ChecklistFormData {
   category: ChecklistCategory
   description: string
   isPacked: boolean
   quantity: string
   notes: string
}

export function ModalChecklistItem({ item, isOpen, onClose, onSave }: ModalChecklistItemProps) {
   const { register, handleSubmit, watch, setValue, reset } = useForm<ChecklistFormData>({
      defaultValues: {
         category: 'other',
         description: '',
         isPacked: false,
         quantity: '1',
         notes: ''
      }
   })

   const formData = watch()

   // Reset form when modal opens or item changes
   useEffect(() => {
      if (isOpen) {
         if (item) {
            reset({
               category: item.category,
               description: item.description,
               isPacked: item.isPacked,
               quantity: item.quantity?.toString() || '1',
               notes: item.notes || ''
            })
         } else {
            reset({
               category: 'other',
               description: '',
               isPacked: false,
               quantity: '1',
               notes: ''
            })
         }
      }
   }, [isOpen, item, reset])

   const onSubmit = (values: ChecklistFormData) => {
      const quantity = parseInt(values.quantity) || 1
      
      onSave({
         category: values.category,
         description: values.description.trim(),
         isPacked: values.isPacked,
         quantity: quantity > 1 ? quantity : undefined,
         notes: values.notes.trim() || undefined
      })
   }

   return (
      <ModalBase
         isOpen={isOpen}
         onClose={onClose}
         title={item ? 'Editar Item' : 'Novo Item'}
         type={item ? 'edit' : 'create'}
         onSave={handleSubmit(onSubmit)}
         size="md"
      >
         <div className="space-y-4">
            {/* Category */}
            <div>
               <label htmlFor="checklist-category" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Categoria *
               </label>
               <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {(Object.entries(CHECKLIST_CATEGORIES) as [ChecklistCategory, typeof CHECKLIST_CATEGORIES[ChecklistCategory]][]).map(([key, config]) => (
                     <button
                        key={key}
                        type="button"
                        onClick={() => setValue('category', key)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                           formData.category === key
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                        }`}
                     >
                        <div className="text-2xl mb-1">{config.icon}</div>
                        <div className={`font-medium text-xs ${formData.category === key ? 'text-blue-700' : 'text-gray-700'}`}>
                           {config.label}
                        </div>
                     </button>
                  ))}
               </div>
            </div>

            {/* Description */}
            <div>
               <label htmlFor="checklist-description" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Descrição *
               </label>
               <input
                  id="checklist-description"
                  type="text"
                  required
                  autoComplete="off"
                  {...register('description', { required: true })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400 text-gray-900"
                  placeholder="Ex: Passaporte, Adaptador de tomada, etc."
               />
            </div>

            {/* Quantity */}
            <div>
               <label htmlFor="checklist-quantity" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Quantidade
               </label>
               <input
                  id="checklist-quantity"
                  type="number"
                  min="1"
                  {...register('quantity')}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
               />
               <p className="text-xs text-gray-500 mt-1">
                  Deixe em 1 se for um item único
               </p>
            </div>

            {/* Is Packed */}
            <div className="flex items-center gap-3">
               <input
                  id="checklist-packed"
                  type="checkbox"
                  {...register('isPacked')}
                  className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
               />
               <label htmlFor="checklist-packed" className="text-sm font-medium text-gray-700">
                  Item já está empacotado
               </label>
            </div>

            {/* Notes */}
            <div>
               <label htmlFor="checklist-notes" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Observações
               </label>
               <textarea
                  id="checklist-notes"
                  {...register('notes')}
                  rows={3}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400 text-gray-900"
                  placeholder="Detalhes adicionais sobre este item..."
               />
            </div>
         </div>
      </ModalBase>
   )
}
