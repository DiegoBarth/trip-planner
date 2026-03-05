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

  const handleNumber = (num: string) => {
    const raw = amountInput.replace(/\D/g, '')
    const newValue = raw + num
    handleAmountChange(newValue)
  }

  const handleBackspace = () => {
    const raw = amountInput.replace(/\D/g, '')
    const newValue = raw.slice(0, -1)
    handleAmountChange(newValue)
  }

  const handleClear = () => {
    setAmountInput('')
  }

  useEffect(() => {
    if (prevFromCurrencyRef.current === fromCurrency) return

    const prevFrom = prevFromCurrencyRef.current
    prevFromCurrencyRef.current = fromCurrency

    const numericAmount = currencyToNumber(amountInput, prevFrom)

    if (numericAmount <= 0 || !rates) return

    const convertedAmount = convertCurrency(
      numericAmount,
      prevFrom,
      fromCurrency,
      rates
    )

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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-40 md:pb-6">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-40 md:pb-6">
      <PageHeader
        title="Conversor"
        subtitle="Converta entre iene, won e real rapidamente"
      />

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
        <div className="max-w-md mx-auto space-y-4">

          <input
            aria-label="Valor"
            type="text"
            value={amountInput}
            onChange={(e) => handleAmountChange(e.target.value.replace(/\D/g, ''))}
            placeholder="Digite um valor"
            inputMode="numeric"
            className="
              h-24 w-full text-center text-lg font-bold rounded-2xl
              bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
              shadow-sm text-gray-900 dark:text-white placeholder:text-gray-500
              focus:outline-none
              pointer-events-none md:pointer-events-auto
            "
          />

          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
            <div>
              <label className="block text-sm font-medium mb-1">De</label>
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
              aria-label="Swap currencies"
              onClick={handleSwap}
              disabled={fromCurrency === toCurrency}
              className="p-2.5 rounded-xl border bg-white dark:bg-gray-700"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </button>

            <div>
              <label className="block text-sm font-medium mb-1">Para</label>
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
            className="h-24 flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 shadow-sm text-center"
            aria-live="polite"
          >
            {isLoading ? (
              <p className="text-gray-500">Carregando taxas...</p>
            ) : converted !== null && amount > 0 ? (
              <>
                <p className="text-sm text-gray-500">
                  {formatCurrency(amount, fromCurrency)}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(converted, toCurrency)}
                </p>
              </>
            ) : (
              <p className="text-gray-500 text-lg font-bold">Digite um valor</p>
            )}
          </div>

        </div>
      </main>

      <div className="fixed bottom-16 left-0 right-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-3 md:hidden">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-2">

          {['7', '8', '9', '⌫', '4', '5', '6', 'C', '1', '2', '3', '', '0', '00'].map((key, i) => {

            if (key === '') return <div key={i} />

            const isNumber = /^[0-9]+$/.test(key)

            return (
              <button
                key={i}
                onClick={() => {
                  if (key === '⌫') handleBackspace()
                  else if (key === 'C') handleClear()
                  else handleNumber(key)
                }}
                className={cn(
                  'h-14 rounded-xl text-lg font-semibold transition active:scale-95',
                  isNumber &&
                  'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow',
                  key === '⌫' &&
                  'bg-amber-400 hover:bg-amber-500 text-black',
                  key === 'C' &&
                  'bg-red-500 hover:bg-red-600 text-white'
                )}
              >
                {key}
              </button>
            )
          })}

        </div>
      </div>
    </div>
  )
}