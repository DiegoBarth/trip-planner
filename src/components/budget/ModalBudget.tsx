import { useEffect } from 'react'
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
   onSave: (budget: Omit<Budget, 'id'>) => void
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
            console.log('Editing budget - resetting form with:', formValues)
            reset(formValues)
         } else {
            reset(defaultValues)
         }
      }
   }, [isOpen, budget, reset])

   const handleSave = (values: BudgetFormData) => {
      // Convert formatted value back to number before saving
      const amount = typeof values.amount === 'string' ? currencyToNumber(values.amount) : values.amount
      
      const budgetData: Omit<Budget, 'id'> = {
         origin: values.origin,
         description: values.description,
         amount: amount || 0,
         date: values.date
      }
      
      console.log('Amount conversion:', { original: values.amount, converted: amount, final: budgetData })
      
      onSave(budgetData)
      reset(defaultValues)
      onClose()
   }

   return (
      <ModalBase
         isOpen={isOpen}
         onClose={onClose}
         title={budget ? 'Editar Orçamento' : 'Novo Orçamento'}
         type={budget ? 'edit' : 'create'}
         onSave={handleSubmit(handleSave)}
         size="md"
      >
         <div className="space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Origem do Orçamento *</label>
               <div className="grid grid-cols-3 gap-3">
                  {(Object.entries(BUDGET_ORIGINS) as [BudgetOrigin, typeof BUDGET_ORIGINS[BudgetOrigin]][]).map(([key, config]) => (
                     <button
                        key={key}
                        type="button"
                        onClick={() => setValue('origin', key)}
                        className={`p-4 rounded-lg border-2 transition-all ${selectedOrigin === key
                           ? 'border-current shadow-md'
                           : 'border-gray-200 hover:border-gray-300'
                           }`}
                        style={{
                           borderColor: selectedOrigin === key ? config.color : undefined,
                           backgroundColor: selectedOrigin === key ? `${config.color}10` : undefined
                        }}
                     >
                        <div className="text-3xl mb-2">{config.icon}</div>
                        <div
                           className="font-semibold text-gray-500"
                           style={{ color: selectedOrigin === key ? config.color : undefined }}
                        >
                           {config.label}
                        </div>
                     </button>
                  ))}
               </div>
            </div>

            <div>
               <label htmlFor="budget-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
               </label>
               <input
                  id="budget-description"
                  type="text"
                  required
                  aria-required="true"
                  autoComplete="off"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400 text-gray-900"
                  placeholder="Ex: Orçamento inicial da viagem"
                  {...register('description')}
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label htmlFor="budget-amount" className="block text-sm font-medium text-gray-700 mb-2">
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
                           className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-gray-400 text-gray-900"
                           placeholder="0,00"
                           value={field.value}
                           onChange={e => field.onChange(formatCurrencyInput(e.target.value))}
                        />
                     )}
                  />
               </div>

               <div>
                  <label htmlFor="budget-date" className="block text-sm font-medium text-gray-700 mb-2">
                     Data *
                  </label>
                  <input
                     id="budget-date"
                     type="date"
                     required
                     aria-required="true"
                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900"
                     {...register('date')}
                  />
               </div>
            </div>

         </div>
      </ModalBase>
   )
}