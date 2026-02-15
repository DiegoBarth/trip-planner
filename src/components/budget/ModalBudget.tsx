import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import type { Budget } from '@/types/Budget'
import type { BudgetOrigin } from '@/types/Attraction'
import { BUDGET_ORIGINS } from '@/config/constants'
import { ModalBase } from '@/components/ui/ModalBase'
import { currencyToNumber, formatCurrencyInput, dateToInputFormat } from '@/utils/formatters'

interface ModalBudgetProps {
   budget?: Budget
   isOpen: boolean
   onClose: () => void
   onSave: (budget: Omit<Budget, 'id'>) => void | Promise<void>
}

type BudgetFormData = Omit<Budget, 'amount' | 'id'> & {
   amount: string | number
   id?:  number
}

const defaultValues: BudgetFormData = {
   origin: 'Diego' as BudgetOrigin,
   description: '',
   amount: '' as string | number,
   date: new Date().toISOString().split('T')[0]
}

export function ModalBudget({ budget, isOpen, onClose, onSave }: ModalBudgetProps) {
   const [saving, setSaving] = useState(false)
   const { control, register, handleSubmit, reset, setValue, watch } = useForm<BudgetFormData>({
      defaultValues
   })

   const selectedOrigin = watch('origin')

   useEffect(() => {
      if (isOpen) {
         if (budget) {
            const amountInCents = Math.round(budget.amount * 100)
            const formValues = {
               origin: budget.origin,
               description: budget.description,
               amount: formatCurrencyInput(amountInCents.toString()),
               date: dateToInputFormat(budget.date)
            }
            reset(formValues)
         } else {
            reset(defaultValues)
         }
      }
   }, [isOpen, budget, reset])

   const handleSave = async (values: BudgetFormData) => {
      const amount = typeof values.amount === 'string' ? currencyToNumber(values.amount) : values.amount
      const budgetData: Omit<Budget, 'id'> = {
         origin: values.origin,
         description: values.description,
         amount: amount || 0,
         date: values.date
      }
      setSaving(true)
      try {
         await Promise.resolve(onSave(budgetData))
         reset(defaultValues)
         onClose()
      } finally {
         setSaving(false)
      }
   }

   return (
      <ModalBase
         isOpen={isOpen}
         onClose={onClose}
         title={budget ? 'Editar Orçamento' : 'Novo Orçamento'}
         type={budget ? 'edit' : 'create'}
         onSave={handleSubmit(handleSave)}
         loading={saving}
         loadingText="Salvando..."
         size="md"
      >
         <div className="space-y-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Origem do Orçamento *</label>
               <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(BUDGET_ORIGINS) as [BudgetOrigin, typeof BUDGET_ORIGINS[BudgetOrigin]][]).map(([key, config]) => (
                     <button
                        key={key}
                        type="button"
                        onClick={() => setValue('origin', key)}
                        className={`p-3 rounded-lg border-2 transition-all focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none  ${selectedOrigin === key
                           ? 'border-current shadow-md'
                           : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                           }`}
                        style={{
                           borderColor: selectedOrigin === key ? config.color : undefined,
                           backgroundColor: selectedOrigin === key ? `${config.color}10` : undefined
                        }}
                     >
                        <div className="text-2xl mb-1">{config.icon}</div>
                        <div
                           className="font-semibold text-sm text-gray-500 dark:text-gray-400"
                           style={{ color: selectedOrigin === key ? config.color : undefined }}
                        >
                           {config.label}
                        </div>
                     </button>
                  ))}
               </div>
            </div>

            <div>
               <label htmlFor="budget-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Descrição *
               </label>
               <input
                  id="budget-description"
                  type="text"
                  required
                  aria-required="true"
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none"
                  placeholder="Ex: Orçamento inicial da viagem"
                  {...register('description')}
               />
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div>
                  <label htmlFor="budget-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                     Valor (R$) *
                  </label>
                  <Controller
                     name="amount"
                     control={control}
                     render={({ field }) => (
                        <input
                           id="budget-amount"
                           type="text"
                           required
                           aria-required="true"
                           aria-label="Valor do or\u00e7amento em reais"
                           autoComplete="off"
                           className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none"
                           placeholder="0,00"
                           value={field.value}
                           onChange={e => field.onChange(formatCurrencyInput(e.target.value))}
                        />
                     )}
                  />
               </div>

               <div>
                  <label htmlFor="budget-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                     Data *
                  </label>
                  <input
                     id="budget-date"
                     type="date"
                     required
                     aria-required="true"
                     className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none"
                     {...register('date')}
                  />
               </div>
            </div>

         </div>
      </ModalBase>
   )
}