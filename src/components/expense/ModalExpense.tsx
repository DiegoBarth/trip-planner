import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { ModalBase } from '@/components/ui/ModalBase'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { useCurrency } from '@/hooks/useCurrency'
import { DateField } from '@/components/ui/DateField'
import type { Expense, ExpenseCategory } from '@/types/Expense'
import { convertToBRL, convertCurrency, formatCurrencyInputByCurrency, currencyToNumber, dateToInputFormat, parseLocalDate, dateToYYYYMMDD } from '@/utils/formatters'
import { EXPENSE_CATEGORIES, BUDGET_ORIGINS, COUNTRIES, getCategoryFromLabel, getBudgetOriginFromLabel } from '@/config/constants'
import type { BudgetOrigin, Currency, Country } from '@/types/Attraction'

interface ModalExpenseProps {
  expense?: Expense
  isOpen: boolean
  onClose: () => void
  onSave: (expense: Omit<Expense, 'id'>) => void | Promise<void>
}

interface ExpenseFormData {
  category: ExpenseCategory
  description: string
  amount: string | number
  currency: Currency
  amountInBRL: number
  budgetOrigin: BudgetOrigin
  date: string
  country?: Country
  notes: string
  receiptUrl: string
}

function getCountryFromCurrency(currency: Currency): Country | undefined {
  if (currency === 'BRL') return 'general';

  const entry = Object.entries(COUNTRIES).find(
    ([_, config]) => config.currency === currency
  );

  return entry?.[0] as Country | undefined;
}

export function ModalExpense({ expense, isOpen, onClose, onSave }: ModalExpenseProps) {
  const [saving, setSaving] = useState(false);

  const { register, control, handleSubmit, watch, setValue, reset } = useForm<ExpenseFormData>({
    defaultValues: {
      category: 'food',
      description: '',
      amount: '',
      currency: 'BRL',
      amountInBRL: 0,
      budgetOrigin: 'Casal',
      date: new Date().toISOString().split('T')[0],
      country: 'general',
      notes: '',
      receiptUrl: ''
    }
  });

  const formData = watch();
  const previousCurrency = useRef<Currency>(formData.currency);
  const previousCountry = useRef<typeof formData.country>(formData.country);
  const isInitialMount = useRef(true);
  const { rates } = useCurrency();

  useEffect(() => {
    if (isOpen) {
      isInitialMount.current = true;

      if (expense) {
        const categoryKey = EXPENSE_CATEGORIES[expense.category as keyof typeof EXPENSE_CATEGORIES]
          ? expense.category
          : getCategoryFromLabel(expense.category as string);

        const budgetOriginKey = BUDGET_ORIGINS[expense.budgetOrigin as keyof typeof BUDGET_ORIGINS]
          ? expense.budgetOrigin
          : getBudgetOriginFromLabel(expense.budgetOrigin as string);

        let formattedAmount: string

        if (expense.currency === 'BRL') {
          const cents = Math.round(expense.amount * 100).toString();

          formattedAmount = formatCurrencyInputByCurrency(cents, expense.currency);
        }
        else {
          formattedAmount = formatCurrencyInputByCurrency(expense.amount.toString(), expense.currency);
        }

        reset({
          category: categoryKey as ExpenseCategory,
          description: expense.description,
          amount: formattedAmount,
          currency: expense.currency,
          amountInBRL: expense.amountInBRL,
          budgetOrigin: budgetOriginKey as BudgetOrigin,
          date: dateToInputFormat(expense.date),
          country: expense.country ?? (expense.currency === 'BRL' ? 'general' : undefined),
          notes: expense.notes || '',
          receiptUrl: expense.receiptUrl || ''
        });

        previousCurrency.current = expense.currency;
        previousCountry.current = expense.country ?? (expense.currency === 'BRL' ? 'general' : undefined);
      }
      else {
        reset({
          category: 'food',
          description: '',
          amount: '',
          currency: 'BRL',
          amountInBRL: 0,
          budgetOrigin: 'Casal',
          date: new Date().toISOString().split('T')[0],
          country: 'general',
          notes: '',
          receiptUrl: ''
        });

        previousCurrency.current = 'BRL';
        previousCountry.current = 'general';
      }
    }
  }, [isOpen, expense, reset]);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;

      return;
    }

    const countryChanged = previousCountry.current !== formData.country;
    const currencyChanged = previousCurrency.current !== formData.currency;

    if (countryChanged && formData.country) {
      const countryConfig = COUNTRIES[formData.country];

      if (countryConfig?.currency && formData.currency !== countryConfig.currency) {
        setValue('currency', countryConfig.currency);
      }
    }
    else if (currencyChanged && !countryChanged) {
      const expectedCountry = getCountryFromCurrency(formData.currency);

      if (formData.country !== expectedCountry) {
        setValue('country', expectedCountry);
      }
    }

    previousCountry.current = formData.country;
  }, [formData.country, formData.currency, setValue]);

  useEffect(() => {
    if (previousCurrency.current !== formData.currency && formData.amount) {
      const currentAmount = typeof formData.amount === 'string'
        ? currencyToNumber(formData.amount, previousCurrency.current)
        : formData.amount;

      if (currentAmount > 0) {
        const convertedAmount = convertCurrency(currentAmount, previousCurrency.current, formData.currency, rates);

        let formattedAmount: string;

        if (formData.currency === 'BRL') {
          const cents = Math.round(convertedAmount * 100).toString();

          formattedAmount = formatCurrencyInputByCurrency(cents, formData.currency);
        }
        else {
          const rounded = Math.round(convertedAmount).toString();
          formattedAmount = formatCurrencyInputByCurrency(rounded, formData.currency);
        }

        setValue('amount', formattedAmount);
      }
    }

    previousCurrency.current = formData.currency;
  }, [formData.currency, formData.amount, setValue]);

  useEffect(() => {
    const amount = typeof formData.amount === 'string'
      ? currencyToNumber(formData.amount, formData.currency)
      : formData.amount;

    const amountInBRL = convertToBRL(amount, formData.currency, rates);

    setValue('amountInBRL', amountInBRL);
  }, [formData.amount, formData.currency, setValue]);

  const onSubmit = async (values: ExpenseFormData) => {
    const amount = typeof values.amount === 'string'
      ? currencyToNumber(values.amount, values.currency)
      : values.amount;

    setSaving(true);

    try {
      await Promise.resolve(onSave({
        ...values,
        amount,
        amountInBRL: values.amountInBRL,
        country: values.country
      }));

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
      title={expense ? 'Editar Gasto' : 'Novo Gasto'}
      type={expense ? 'edit' : 'create'}
      onSave={handleSubmit(onSubmit)}
      loading={saving}
      loadingText="Salvando..."
      size="lg"
    >
      <div className="space-y-4">
        {/* Category */}
        <div>
          <label htmlFor="expense-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Categoria *</label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(EXPENSE_CATEGORIES) as [ExpenseCategory, typeof EXPENSE_CATEGORIES[ExpenseCategory]][]).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setValue('category', key)}
                className={`p-4 rounded-lg border-2 transition-all focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none ${formData.category === key
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/40 shadow-md'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
              >
                <div className="text-2xl mb-1">{config.icon}</div>
                <div className={`font-semibold text-sm ${formData.category === key ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {config.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="expense-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descrição *</label>
          <input
            id="expense-description"
            type="text"
            required
            autoComplete="off"
            {...register('description', { required: true })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
            placeholder="Ex: Almoço no restaurante"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="expense-country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">País *</label>
            <CustomSelect
              value={formData.country ? `${COUNTRIES[formData.country].flag} ${COUNTRIES[formData.country].name}` : ''}
              onChange={(val) => {
                if (!val) {
                  setValue('country', undefined)
                  return
                }
                const countryKey = Object.entries(COUNTRIES).find(([_, c]) => `${c.flag} ${c.name}` === val)?.[0] as Country | undefined
                if (countryKey) setValue('country', countryKey)
              }}
              options={['', ...Object.entries(COUNTRIES)
                .map(([_, country]) => `${country.flag} ${country.name}`)
              ].filter(Boolean)}
              placeholder="Selecione o país"
            />
          </div>
          <div>
            <label htmlFor="expense-currency" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Moeda *</label>
            <CustomSelect
              value={formData.currency === 'BRL' ? 'R$ Real (BRL)' : formData.currency === 'JPY' ? '¥ Iene (JPY)' : '₩ Won (KRW)'}
              onChange={(val) => {
                const currencyMap: Record<string, Currency> = {
                  'R$ Real (BRL)': 'BRL',
                  '¥ Iene (JPY)': 'JPY',
                  '₩ Won (KRW)': 'KRW'
                }
                setValue('currency', currencyMap[val])
              }}
              options={['R$ Real (BRL)', '¥ Iene (JPY)', '₩ Won (KRW)']}
            />
          </div>
        </div>
        <div>
          <label htmlFor="expense-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Valor *</label>
          <Controller
            name="amount"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <input
                id="expense-amount"
                type="text"
                required
                autoComplete="off"
                value={typeof field.value === 'number'
                  ? formatCurrencyInputByCurrency(field.value.toString(), formData.currency)
                  : field.value
                }
                onChange={(e) => {
                  const formatted = formatCurrencyInputByCurrency(e.target.value, formData.currency)
                  field.onChange(formatted)
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
                placeholder={formData.currency === 'BRL' ? 'R$ 0,00' : formData.currency === 'JPY' ? '¥ 0' : '₩ 0'}
              />
            )}
          />
        </div>
        <div>
          <label htmlFor="expense-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Data *</label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <DateField
                value={field.value ? parseLocalDate(field.value) : undefined}
                onChange={(date: Date | undefined) => field.onChange(date ? dateToYYYYMMDD(date) : '')}
                required
              />
            )}
          />
        </div>

        {formData.currency !== 'BRL' && formData.amount && (
          typeof formData.amount === 'string'
            ? currencyToNumber(formData.amount, formData.currency) > 0
            : formData.amount > 0
        ) && (
            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
              <span className="text-sm text-blue-700 dark:text-blue-200">Valor em reais: </span>
              <span className="font-bold text-blue-900 dark:text-blue-100">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.amountInBRL || 0)}
              </span>
            </div>
          )}

        <div>
          <label htmlFor="expense-budget-origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Origem do Pagamento *</label>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(BUDGET_ORIGINS) as [BudgetOrigin, typeof BUDGET_ORIGINS[BudgetOrigin]][]).map(([key, config]) => (
              <button
                key={key}
                type="button"
                onClick={() => setValue('budgetOrigin', key)}
                className={`p-4 rounded-lg border-2 transition-all focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none ${formData.budgetOrigin === key
                  ? 'border-current shadow-md'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 bg-white dark:bg-gray-800'
                  }`}
                style={{
                  borderColor: formData.budgetOrigin === key ? config.color : undefined,
                  backgroundColor: formData.budgetOrigin === key ? `${config.color}10` : undefined
                }}
              >
                <div className="text-2xl mb-1">{config.icon}</div>
                <div
                  className="font-semibold text-gray-500 dark:text-gray-300"
                  style={{ color: formData.budgetOrigin === key ? config.color : undefined }}
                >
                  {config.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="expense-notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Observações</label>
          <textarea
            id="expense-notes"
            {...register('notes')}
            rows={3}
            autoComplete="off"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
            placeholder="Anotações adicionais sobre este gasto..."
          />
        </div>

      </div>
    </ModalBase>
  );
}