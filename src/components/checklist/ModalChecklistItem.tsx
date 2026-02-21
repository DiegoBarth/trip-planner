import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useToast } from '@/contexts/toast'
import { ModalBase } from '@/components/ui/ModalBase'
import { validateWithToast } from '@/schemas/validateWithToast'
import { checklistItemCreateSchema } from '@/schemas/checklistSchema'
import { CHECKLIST_CATEGORIES } from '@/config/constants'
import type { ChecklistItem, ChecklistCategory } from '@/types/ChecklistItem'

interface ModalChecklistItemProps {
  item?: ChecklistItem
  isOpen: boolean
  onClose: () => void
  onSave: (item: Omit<ChecklistItem, 'id'>) => void | Promise<void>
}

interface ChecklistFormData {
  category: ChecklistCategory
  description: string
  isPacked: boolean
  quantity: string
  notes: string
}

export function ModalChecklistItem({ item, isOpen, onClose, onSave }: ModalChecklistItemProps) {
  const toast = useToast()
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, watch, setValue, reset } = useForm<ChecklistFormData>({
    defaultValues: {
      category: 'other',
      description: '',
      isPacked: false,
      quantity: '1',
      notes: ''
    }
  });

  const formData = watch();

  useEffect(() => {
    if (isOpen) {
      if (item) {
        reset({
          category: item.category,
          description: item.description,
          isPacked: item.isPacked,
          quantity: item.quantity?.toString() || '1',
          notes: item.notes || ''
        });
      }
      else {
        reset({
          category: 'other',
          description: '',
          isPacked: false,
          quantity: '1',
          notes: ''
        });
      }
    }
  }, [isOpen, item, reset]);

  const onSubmit = async (values: ChecklistFormData) => {
    const quantity = parseInt(values.quantity) || 1;

    const payload = {
      category: values.category,
      description: values.description.trim(),
      isPacked: values.isPacked,
      quantity: quantity > 1 ? quantity : 1,
      notes: values.notes.trim() || ''
    };

    if (!validateWithToast(payload, checklistItemCreateSchema, toast)) return

    setSaving(true);
    try {
      await Promise.resolve(onSave(payload));

      onClose();
    }
    finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={item ? 'Editar Item' : 'Novo Item'}
      type={item ? 'edit' : 'create'}
      onSave={handleSubmit(onSubmit)}
      loading={saving}
      loadingText="Salvando..."
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="checklist-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Categoria *
          </label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {(Object.entries(CHECKLIST_CATEGORIES) as [ChecklistCategory, typeof CHECKLIST_CATEGORIES[ChecklistCategory]][]).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setValue('category', key)}
                className={`p-3 rounded-lg border-2 transition-all focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none ${formData.category === key
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 shadow-md'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
              >
                <div className="text-2xl mb-1">{config.icon}</div>
                <div className={`font-medium text-xs ${formData.category === key ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {config.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="checklist-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Descrição *
          </label>
          <input
            id="checklist-description"
            type="text"
            required
            autoComplete="off"
            {...register('description')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none"
            placeholder="Ex: Passaporte, Adaptador de tomada, etc."
          />
        </div>

        <div>
          <label htmlFor="checklist-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Quantidade
          </label>
          <input
            id="checklist-quantity"
            type="number"
            min="1"
            autoComplete="off"
            {...register('quantity')}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Deixe em 1 se for um item único
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="checklist-packed"
            type="checkbox"
            {...register('isPacked')}
            className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-green-600 focus:ring-gray-300 dark:focus:ring-gray-500 bg-white dark:bg-gray-700"
          />
          <label htmlFor="checklist-packed" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Item já está empacotado
          </label>
        </div>

        <div>
          <label htmlFor="checklist-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Observações
          </label>
          <textarea
            id="checklist-notes"
            {...register('notes')}
            rows={3}
            autoComplete="off"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none"
            placeholder="Detalhes adicionais sobre este item..."
          />
        </div>
      </div>
    </ModalBase>
  );
}