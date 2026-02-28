import { useState, useMemo, useRef, useEffect } from 'react'
import { PageHeader } from '@/components/ui/PageHeader'
import { useCurrency } from '@/hooks/useCurrency'
import {
  convertCurrency,
  formatCurrencyInputByCurrency,
  currencyToNumber,
  formatCurrency,
} from '@/utils/formatters'
import type { Currency } from '@/types/Attraction'
import ArrowLeftRight from 'lucide-react/dist/esm/icons/arrow-left-right'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { QueryErrorView } from '@/components/ui/QueryErrorView'
import { cn } from '@/lib/utils'

const CURRENCY_OPTIONS: { label: string; value: Currency }[] = [
  { label: '¥ Iene (JPY)', value: 'JPY' },
  { label: '₩ Won (KRW)', value: 'KRW' },
  { label: 'R$ Real (BRL)', value: 'BRL' },
]

export default function ConverterPage() {
  const { rates, isLoading, error } = useCurrency()
  const [amountInput, setAmountInput] = useState('')
  const [fromCurrency, setFromCurrency] = useState<Currency>('JPY')
  const [toCurrency, setToCurrency] = useState<Currency>('BRL')
  const prevFromCurrencyRef = useRef<Currency>(fromCurrency)

  const amount = useMemo(
    () => currencyToNumber(amountInput, fromCurrency),
    [amountInput, fromCurrency]
  )

  const converted = useMemo(() => {
    if (!rates || amount <= 0) return null
    return convertCurrency(amount, fromCurrency, toCurrency, rates)
  }, [amount, fromCurrency, toCurrency, rates])

  const handleAmountChange = (value: string) => {
    const formatted = formatCurrencyInputByCurrency(value, fromCurrency)
    setAmountInput(formatted)
  }

  useEffect(() => {
    if (prevFromCurrencyRef.current === fromCurrency) return
    const prevFrom = prevFromCurrencyRef.current
    prevFromCurrencyRef.current = fromCurrency
    const numericAmount = currencyToNumber(amountInput, prevFrom)
    if (numericAmount <= 0 || !rates) return
    const convertedAmount = convertCurrency(numericAmount, prevFrom, fromCurrency, rates)
    const valueToShow =
      fromCurrency === 'BRL'
        ? String(Math.round(convertedAmount * 100))
        : String(Math.round(convertedAmount))
    setAmountInput(formatCurrencyInputByCurrency(valueToShow, fromCurrency))
  }, [fromCurrency, rates])

  const handleSwap = () => {
    if (fromCurrency === toCurrency) return
    const newFrom = toCurrency
    const newTo = fromCurrency
    if (converted !== null && amount > 0) {
      // BRL input expects "cents" as digits; JPY/KRW expect whole number
      const valueToShow =
        newFrom === 'BRL'
          ? String(Math.round(converted * 100))
          : String(Math.round(converted))
      setAmountInput(formatCurrencyInputByCurrency(valueToShow, newFrom))
    }
    prevFromCurrencyRef.current = newFrom
    setFromCurrency(newFrom)
    setToCurrency(newTo)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
        <PageHeader title="Conversor" subtitle="Converta entre JPY, KRW e BRL" />
        <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <QueryErrorView
            message="Não foi possível carregar as taxas de câmbio."
            onRetry={() => window.location.reload()}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-6">
      <PageHeader
        title="Conversor"
        subtitle="Converta entre iene, won e real de forma rápida"
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="max-w-md mx-auto space-y-6">
          <div>
            <label
              htmlFor="converter-amount"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
            >
              Valor
            </label>
            <input
              id="converter-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={amountInput}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder={
                fromCurrency === 'BRL'
                  ? 'R$ 0,00'
                  : fromCurrency === 'JPY'
                    ? '¥ 0'
                    : '₩ 0'
              }
              className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                De
              </label>
              <CustomSelect
                id="converter-from"
                value={CURRENCY_OPTIONS.find((c) => c.value === fromCurrency)?.label ?? ''}
                onChange={(val) => {
                  const c = CURRENCY_OPTIONS.find((o) => o.label === val)
                  if (c) setFromCurrency(c.value)
                }}
                options={CURRENCY_OPTIONS.map((c) => c.label)}
                placeholder="Moeda"
              />
            </div>
            <button
              type="button"
              onClick={handleSwap}
              disabled={fromCurrency === toCurrency}
              aria-label="Trocar moedas (de e para)"
              className={cn(
                'p-2.5 rounded-xl border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300',
                'hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none',
                'disabled:opacity-50 disabled:pointer-events-none transition-colors'
              )}
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Para
              </label>
              <CustomSelect
                id="converter-to"
                value={CURRENCY_OPTIONS.find((c) => c.value === toCurrency)?.label ?? ''}
                onChange={(val) => {
                  const c = CURRENCY_OPTIONS.find((o) => o.label === val)
                  if (c) setToCurrency(c.value)
                }}
                options={CURRENCY_OPTIONS.map((c) => c.label)}
                placeholder="Moeda"
              />
            </div>
          </div>

          <div
            className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
            aria-live="polite"
          >
            {isLoading ? (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Carregando taxas...
              </p>
            ) : converted !== null && amount > 0 ? (
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formatCurrency(amount, fromCurrency)} =
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(converted, toCurrency)}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Digite um valor para ver a conversão
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}