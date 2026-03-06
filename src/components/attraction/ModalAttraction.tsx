import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useCountry } from '@/contexts/CountryContext'
import { useReservation } from '@/hooks/useReservation'
import { useCurrency } from '@/hooks/useCurrency'
import { useToast } from '@/contexts/toast'
import { ModalBase } from '@/components/ui/ModalBase'
import { validateWithToast } from '@/schemas/validateWithToast'
import { attractionCreateSchema } from '@/schemas/attractionSchema'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { DateField } from '@/components/ui/DateField'
import { LocationField } from '@/components/attraction/LocationField'
import { convertToBRL, formatCurrencyInputByCurrency, currencyToNumber, convertCurrency, dateToInputFormat, parseLocalDate, dateToYYYYMMDD } from '@/utils/formatters'
import { COUNTRIES, ATTRACTION_TYPES, PERIODS, RESERVATION_STATUS, WEEK_DAYS } from '@/config/constants'
import type { Attraction, Country, AttractionType, Currency, Period, ReservationStatus, CountryFilterValue } from '@/types/Attraction'

const COUNTRY_CURRENCY: Record<Country, Currency> = {
  japan: 'JPY',
  'south-korea': 'KRW',
  general: 'BRL'
}

const CURRENCY_COUNTRY: Record<Currency, Country> = {
  JPY: 'japan',
  KRW: 'south-korea',
  BRL: 'general'
}

// All currencies are always available
const availableCurrencies = [
  { label: '¥ Iene (JPY)', value: 'JPY' as Currency },
  { label: '₩ Won (KRW)', value: 'KRW' as Currency },
  { label: 'R$ Real (BRL)', value: 'BRL' as Currency }
];

export function getCountryFromFilter(filter: CountryFilterValue): Country {
  if (filter === 'all') return 'general'
  return filter
}

interface ModalAttractionProps {
  attraction?: Attraction
  isOpen: boolean
  onClose: () => void
  onSave: (attraction: Omit<Attraction, 'id' | 'day' | 'order'>) => void | Promise<void>
}

interface AttractionFormData {
  name: string
  country: Country
  city: string
  region: string
  date: string
  dayOfWeek: string
  type: AttractionType
  visited: boolean
  needsReservation: boolean
  reservationStatus?: string
  reservationId?: number
  couplePrice: string
  currency: Currency
  priceInBRL: number
  idealPeriod?: Period
  isOpen?: boolean
  openingTime: string
  closingTime: string
  closedDays: string
  ticketLink: string
  location: string
  duration: number
  notes: string
  imageUrl: string
  lat?: number
  lng?: number
}

export function ModalAttraction({ attraction, isOpen, onClose, onSave }: ModalAttractionProps) {
  const { country: countryFilter } = useCountry()
  const defaultCountry = getCountryFromFilter(countryFilter)
  const toast = useToast()
  const [saving, setSaving] = useState(false);
  const { register, control, handleSubmit, watch, setValue, reset, getValues } =
    useForm<AttractionFormData>({
      defaultValues: {
        name: '',
        country: defaultCountry,
        city: '',
        region: '',
        date: '',
        dayOfWeek: '',
        type: 'other',
        visited: false,
        needsReservation: false,
        reservationStatus: undefined,
        reservationId: undefined,
        couplePrice: '',
        currency: COUNTRY_CURRENCY[defaultCountry],
        priceInBRL: 0,
        idealPeriod: undefined,
        isOpen: undefined,
        openingTime: '',
        closingTime: '',
        closedDays: '',
        ticketLink: '',
        location: '',
        duration: 0,
        notes: '',
        imageUrl: '',
        lat: 0,
        lng: 0
      }
    });

  const currency = watch('currency')
  const couplePrice = watch('couplePrice', '')
  const needsReservation = watch('needsReservation')
  const reservationStatus = watch('reservationStatus')
  const country = watch('country')
  const idealPeriod = watch('idealPeriod')
  const type = watch('type')
  const priceInBRL = watch('priceInBRL')
  const reservationId = watch('reservationId')

  const previousCurrency = useRef<Currency>(currency);
  const { rates } = useCurrency();
  const { reservations } = useReservation();

  // Reset form when modal opens or attraction changes (explicit fields so no stale values when switching attractions)
  useEffect(() => {
    if (isOpen) {
      if (attraction) {
        let formattedPrice: string;

        if (attraction.currency === 'BRL') {
          const cents = Math.round((attraction.couplePrice ?? 0) * 100).toString();

          formattedPrice = formatCurrencyInputByCurrency(cents, attraction.currency);
        }
        else {
          formattedPrice = formatCurrencyInputByCurrency(attraction.couplePrice.toString(), attraction.currency);
        }

        reset({
          name: attraction.name ?? '',
          country: attraction.country ?? defaultCountry,
          city: attraction.city ?? '',
          region: attraction.region ?? '',
          date: dateToInputFormat(attraction.date),
          dayOfWeek: attraction.dayOfWeek ?? '',
          type: attraction.type ?? 'other',
          visited: attraction.visited ?? false,
          needsReservation: attraction.needsReservation ?? false,
          reservationStatus: attraction.reservationStatus,
          reservationId: attraction.reservationId,
          couplePrice: formattedPrice,
          currency:
            attraction.currency ??
            (attraction.country === 'japan'
              ? 'JPY'
              : attraction.country === 'south-korea'
                ? 'KRW'
                : 'BRL'),
          priceInBRL: attraction.priceInBRL ?? 0,
          idealPeriod: attraction.idealPeriod,
          isOpen: attraction.isOpen,
          openingTime: attraction.openingTime ?? '',
          closingTime: attraction.closingTime ?? '',
          closedDays: attraction.closedDays ?? '',
          ticketLink: attraction.ticketLink ?? '',
          location: attraction.location ?? '',
          duration: attraction.duration ?? 0,
          notes: attraction.notes ?? '',
          imageUrl: attraction.imageUrl ?? '',
          lat: attraction.lat ?? 0,
          lng: attraction.lng ?? 0
        });

        previousCurrency.current = attraction.currency ?? (attraction.country === 'japan'
          ? 'JPY'
          : attraction.country === 'south-korea'
            ? 'KRW'
            : 'BRL');
      }
      else {
        reset({
          name: '',
          country: defaultCountry,
          city: '',
          region: '',
          date: '',
          dayOfWeek: '',
          type: 'other',
          visited: false,
          needsReservation: false,
          reservationStatus: undefined,
          reservationId: undefined,
          couplePrice: '',
          currency: COUNTRY_CURRENCY[defaultCountry],
          priceInBRL: 0,
          idealPeriod: undefined,
          isOpen: undefined,
          openingTime: '',
          closingTime: '',
          closedDays: '',
          ticketLink: '',
          location: '',
          duration: 0,
          notes: '',
          imageUrl: '',
          lat: 0,
          lng: 0
        });

        previousCurrency.current = COUNTRY_CURRENCY[defaultCountry];
      }
    }
  }, [isOpen, attraction, reset, defaultCountry])

  // Convert and reformat couplePrice when currency changes
  useEffect(() => {
    const price = currencyToNumber(couplePrice, previousCurrency.current)

    if (previousCurrency.current !== currency && price > 0) {
      const currentAmount = typeof couplePrice === 'string'
        ? currencyToNumber(couplePrice, previousCurrency.current as Currency)
        : (couplePrice as number);

      if (currentAmount > 0) {
        const convertedAmount = convertCurrency(currentAmount, previousCurrency.current as Currency, currency as Currency, rates);

        // Format properly for each currency type
        let formattedAmount: string;

        if (currency === 'BRL') {
          // For BRL, multiply by 100 to get cents, then format
          const cents = Math.round(convertedAmount * 100).toString();

          formattedAmount = formatCurrencyInputByCurrency(cents, currency as Currency);
        }
        else {
          // For JPY and KRW, round to integer
          const rounded = Math.round(convertedAmount).toString();

          formattedAmount = formatCurrencyInputByCurrency(rounded, currency as Currency);
        }

        // Update both couplePrice and priceInBRL
        setValue('couplePrice', formattedAmount);
        setValue('priceInBRL', convertToBRL(convertedAmount, currency as Currency, rates));
      }

      previousCurrency.current = currency as Currency;
    }
  }, [currency, rates, couplePrice]);

  // Auto-select 'pending' when needsReservation is checked
  useEffect(() => {
    if (needsReservation && !reservationStatus) {
      setValue('reservationStatus', 'pending')
    }

    if (!needsReservation && reservationStatus) {
      setValue('reservationStatus', undefined)
    }
  }, [needsReservation, reservationStatus, setValue])

  // Update currency when country changes
  const handleCountryChange = (country: Country) => {
    setValue('currency', COUNTRY_CURRENCY[country])
  }

  // Update country when currency changes
  const handleCurrencyChange = (currency: Currency) => {
    setValue('currency', currency)
    setValue('country', CURRENCY_COUNTRY[currency])
  }

  const handleCouplePriceChange = (value: string) => {
    const formatted = formatCurrencyInputByCurrency(value, currency as Currency);

    setValue('couplePrice', formatted);

    // Auto-calculate BRL price
    const price = currencyToNumber(formatted, currency as Currency);

    setValue('priceInBRL', convertToBRL(price, currency as Currency, rates));
  }

  const onSubmit = async (values: AttractionFormData) => {
    const couplePrice = typeof values.couplePrice === 'string'
      ? currencyToNumber(values.couplePrice as string, values.currency as Currency)
      : (values.couplePrice as number);

    const payload = { ...values, couplePrice } as Omit<Attraction, 'id' | 'day' | 'order'>
    if (!validateWithToast(payload, attractionCreateSchema, toast)) return

    setSaving(true);

    try {
      await onSave(payload);
      onClose();
    }
    finally {
      setSaving(false);
    }
  }

  return (
    <ModalBase
      isOpen={isOpen}
      onClose={onClose}
      title={attraction ? 'Editar Atração' : 'Nova Atração'}
      type={attraction ? 'edit' : 'create'}
      onSave={handleSubmit(onSubmit)}
      loading={saving}
      loadingText="Salvando..."
      size="xl"
    >
      <div className="space-y-4">
        <section>
          <h3 className="font-bold text-base mb-2.5 pb-2 border-b-2 border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <span>📍</span>
            <span>Informações Básicas</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                Nome da Atração *
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                {...register('name')}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                placeholder="Ex: Templo Senso-ji"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                País *
              </label>
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={country ? `${COUNTRIES[country].flag} ${COUNTRIES[country].name}` : ''}
                    onChange={(val) => {
                      const countryKey = Object.entries(COUNTRIES).find(([_, c]) => `${c.flag} ${c.name}` === val)?.[0]
                      if (countryKey) {
                        field.onChange(countryKey as Country)
                        handleCountryChange(countryKey as Country)
                      }
                    }}
                    options={Object.entries(COUNTRIES).map(([_, country]) => `${country.flag} ${country.name}`)}
                    placeholder="Selecione o país"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                Cidade *
              </label>
              <input
                type="text"
                required
                autoComplete="off"
                {...register('city')}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                placeholder="Ex: Tóquio"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                Região/Bairro
              </label>
              <input
                type="text"
                autoComplete="off"
                {...register('region')}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                placeholder="Ex: Asakusa"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                Tipo *
              </label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={type ? `${ATTRACTION_TYPES[type].icon} ${ATTRACTION_TYPES[type].label}` : ''}
                    onChange={(val) => {
                      const typeKey = Object.entries(ATTRACTION_TYPES).find(([_, t]) => `${t.icon} ${t.label}` === val)?.[0]
                      if (typeKey) field.onChange(typeKey as AttractionType)
                    }}
                    options={Object.entries(ATTRACTION_TYPES).map(([_, type]) => `${type.icon} ${type.label}`)}
                    placeholder="Selecione o tipo"
                  />
                )}
              />
            </div>
            <LocationField
              control={control}
              register={register}
              setValue={setValue}
              getValues={getValues}
              watch={watch}
            />
          </div>
        </section>

        <section>
          <h3 className="font-bold text-base mb-2.5 pb-2 border-b-2 border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <span>📅</span>
            <span>Data e Horário</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                Data *
              </label>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <DateField
                    value={field.value ? parseLocalDate(field.value) : undefined}
                    onChange={(date: Date | undefined) => {
                      const value = date ? dateToYYYYMMDD(date) : ''
                      field.onChange(value)
                      if (date) {
                        setValue('dayOfWeek', date.toLocaleDateString('en-US', { weekday: 'long' }))
                      }
                    }}
                    required
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                Período Ideal
              </label>
              <Controller
                name="idealPeriod"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={idealPeriod ? `${PERIODS[idealPeriod].icon} ${PERIODS[idealPeriod].label} (${PERIODS[idealPeriod].hours})` : ''}
                    onChange={(val) => {
                      if (!val) {
                        field.onChange(undefined)
                        return
                      }
                      const periodKey = Object.entries(PERIODS).find(([_, p]) => `${p.icon} ${p.label} (${p.hours})` === val)?.[0]
                      if (periodKey) field.onChange(periodKey as Period)
                    }}
                    options={['', ...Object.entries(PERIODS).map(([_, period]) => `${period.icon} ${period.label} (${period.hours})`)].filter(Boolean)}
                    placeholder="Não especificado"
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                Hora Abertura
              </label>
              <input
                type="time"
                autoComplete="off"
                {...register('openingTime')}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                Hora Fechamento
              </label>
              <input
                type="time"
                autoComplete="off"
                {...register('closingTime')}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                Duração (min)
              </label>
              <input
                type="number"
                min="0"
                autoComplete="off"
                {...register('duration', { valueAsNumber: true })}
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                Dias Fechados
              </label>
              <Controller
                name="closedDays"
                control={control}
                render={({ field }) => {
                  const closedDaysArray = field.value ? field.value.split(',').map(d => d.trim()).filter(Boolean) : []
                  return (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(WEEK_DAYS).map(([key, day]) => {
                        const isChecked = closedDaysArray.includes(key)
                        return (
                          <label key={key} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer transition-colors">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const newArray = [...closedDaysArray, key]
                                  field.onChange(newArray.join(','))
                                } else {
                                  const newArray = closedDaysArray.filter(v => v !== key)
                                  field.onChange(newArray.join(','))
                                }
                              }}
                              className="w-4 h-4 text-green-600 rounded"
                            />
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{day.short}</span>
                          </label>
                        )
                      })}
                    </div>
                  )
                }}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 className="font-bold text-base mb-2.5 pb-2 border-b-2 border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <span>💰</span>
            <span>Valores</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label htmlFor="couplePrice" className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                Valor Casal
              </label>
              <Controller
                name="couplePrice"
                control={control}
                render={({ field }) => (
                  <input
                    id="couplePrice"
                    type="text"
                    autoComplete="off"
                    value={typeof field.value === 'string' ? field.value : ''}
                    onChange={(e) => {
                      field.onChange(e.target.value)
                      handleCouplePriceChange(e.target.value)
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                    placeholder={currency === 'BRL' ? 'R$ 0,00' : currency === 'JPY' ? '¥ 0' : '₩ 0'}
                  />
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                Moeda
              </label>
              <Controller
                name="currency"
                control={control}
                render={({ field }) => (
                  <CustomSelect
                    value={availableCurrencies.find(c => c.value === currency)?.label || ''}
                    onChange={(val) => {
                      const currency = availableCurrencies.find(c => c.label === val)?.value
                      if (currency) {
                        field.onChange(currency)
                        handleCurrencyChange(currency)
                      }
                    }}
                    options={availableCurrencies.map(c => c.label)}
                  />
                )}
              />
            </div>

            {currency !== 'BRL' && (
              <div className="md:col-span-3 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 p-4 rounded-lg">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Valor em Reais: </span>
                <span className="font-bold text-lg text-green-700 dark:text-green-200">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(priceInBRL || 0)}
                </span>
              </div>
            )}
          </div>
        </section>

        <section>
          <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 mb-2.5 pb-2 border-b-2 border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <span>🔗</span>
            <span>Links e Status</span>
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('needsReservation')}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Necessita Reserva</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('visited')}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Já Visitado</span>
              </label>
            </div>

            {needsReservation && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                    Status da Reserva
                  </label>
                  <Controller
                    name="reservationStatus"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        value={reservationStatus ? `${RESERVATION_STATUS[reservationStatus as ReservationStatus].icon} ${RESERVATION_STATUS[reservationStatus as ReservationStatus].label}` : ''}
                        onChange={(val) => {
                          if (!val) {
                            field.onChange(undefined)
                            return
                          }
                          const statusKey = Object.entries(RESERVATION_STATUS)
                            .filter(([key]) => key !== 'not-needed')
                            .find(([_, s]) => `${s.icon} ${s.label}` === val)?.[0]
                          if (statusKey) field.onChange(statusKey as ReservationStatus)
                        }}
                        options={Object.entries(RESERVATION_STATUS)
                          .filter(([key]) => key !== 'not-needed')
                          .map(([_, status]) => `${status.icon} ${status.label}`)}
                        placeholder="Selecione o status"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                    Vincular Reserva
                    <span className="text-xs font-normal text-gray-500 ml-2">(opcional)</span>
                  </label>
                  <Controller
                    name="reservationId"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        value={reservationId ? reservations.find(r => r.id === reservationId)?.title || '' : ''}
                        onChange={(val) => {
                          if (!val) {
                            field.onChange(undefined)
                            return
                          }
                          const reservation = reservations.find(r => r.title === val)
                          if (reservation) field.onChange(reservation.id)
                        }}
                        options={['', ...reservations.map(r => r.title)]}
                        placeholder="Nenhuma reserva vinculada"
                      />
                    )}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {!reservationId && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                    Link Ingresso/Reserva
                  </label>
                  <input
                    type="url"
                    autoComplete="off"
                    {...register('ticketLink')}
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  autoComplete="off"
                  {...register('imageUrl')}
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none transition-colors placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                  placeholder="https://..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                  Observações
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  autoComplete="off"
                  className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none transition-colors resize-none placeholder-gray-500 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100"
                  placeholder="Anotações adicionais..."
                />
              </div>
            </div>
          </div>
        </section>

      </div>
    </ModalBase>
  );
}