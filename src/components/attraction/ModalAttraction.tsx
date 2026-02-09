import { useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import type { Attraction, Country, AttractionType, Currency, Period, ReservationStatus } from '@/types/Attraction'
import { COUNTRIES, ATTRACTION_TYPES, PERIODS, RESERVATION_STATUS, WEEK_DAYS } from '@/config/constants'
import { convertToBRL, formatCurrencyInputByCurrency, currencyToNumber, convertCurrency, dateToInputFormat } from '@/utils/formatters'
import { ModalBase } from '@/components/ui/ModalBase'
import { CustomSelect } from '@/components/ui/CustomSelect'

interface ModalAttractionProps {
   attraction?: Attraction
   isOpen: boolean
   onClose: () => void
   onSave: (attraction: Omit<Attraction, 'id'>) => void
}

interface AttractionFormData {
   name: string
   country: Country
   city: string
   region: string
   day: number
   date: string
   dayOfWeek: string
   type: AttractionType
   order: number
   visited: boolean
   needsReservation: boolean
   reservationStatus?: string
   couplePrice: string | number
   currency: Currency
   priceInBRL: number
   idealPeriod?: Period
   isOpen?: boolean
   openingTime: string
   closingTime: string
   closedDays: string[]
   ticketLink: string
   location: string
   duration: number
   notes: string
   imageUrl: string
}

export function ModalAttraction({ attraction, isOpen, onClose, onSave }: ModalAttractionProps) {
   const { register, control, handleSubmit, watch, setValue, reset } = useForm<AttractionFormData>({
      defaultValues: {
         name: '',
         country: 'japan',
         city: '',
         region: '',
         day: 1,
         date: '',
         dayOfWeek: '',
         type: 'other',
         order: 1,
         visited: false,
         needsReservation: false,
         reservationStatus: undefined,
         couplePrice: 0,
         currency: 'JPY',
         priceInBRL: 0,
         idealPeriod: undefined,
         isOpen: undefined,
         openingTime: '',
         closingTime: '',
         closedDays: [],
         ticketLink: '',
         location: '',
         duration: 0,
         notes: '',
         imageUrl: ''
      }
   })

   const formData = watch()
   const previousCurrency = useRef<Currency>(formData.currency)

   // Reset form when modal opens or attraction changes
   useEffect(() => {
      if (isOpen) {
         if (attraction) {
            // Format couplePrice based on currency
            let formattedPrice: string
            if (attraction.currency === 'BRL') {
               // For BRL, multiply by 100 to get cents for the formatter
               const cents = Math.round(attraction.couplePrice * 100).toString()
               formattedPrice = formatCurrencyInputByCurrency(cents, attraction.currency)
            } else {
               // For JPY and KRW, use the amount directly
               formattedPrice = formatCurrencyInputByCurrency(attraction.couplePrice.toString(), attraction.currency)
            }

            const formattedData = dateToInputFormat(attraction.date)

            reset({
               ...attraction,
               couplePrice: formattedPrice,
               date: formattedData
            })
            previousCurrency.current = attraction.currency
         } else {
            reset({
               name: '',
               country: 'japan',
               city: '',
               region: '',
               day: 1,
               date: '',
               dayOfWeek: '',
               type: 'other',
               order: 1,
               visited: false,
               needsReservation: false,
               reservationStatus: undefined,
               couplePrice: 0,
               currency: 'JPY',
               priceInBRL: 0,
               idealPeriod: undefined,
               isOpen: undefined,
               openingTime: '',
               closingTime: '',
               closedDays: [],
               ticketLink: '',
               location: '',
               duration: 0,
               notes: '',
               imageUrl: ''
            })
            previousCurrency.current = 'JPY'
         }
      }
   }, [isOpen, attraction, reset])

   // Convert and reformat couplePrice when currency changes
   useEffect(() => {
      if (previousCurrency.current !== formData.currency && formData.couplePrice) {
         const currentAmount = typeof formData.couplePrice === 'string'
            ? currencyToNumber(formData.couplePrice, previousCurrency.current as Currency)
            : (formData.couplePrice as number)

         if (currentAmount > 0) {
            const convertedAmount = convertCurrency(currentAmount, previousCurrency.current as Currency, formData.currency as Currency)

            // Format properly for each currency type
            let formattedAmount: string
            if (formData.currency === 'BRL') {
               // For BRL, multiply by 100 to get cents, then format
               const cents = Math.round(convertedAmount * 100).toString()
               formattedAmount = formatCurrencyInputByCurrency(cents, formData.currency as Currency)
            } else {
               // For JPY and KRW, round to integer
               const rounded = Math.round(convertedAmount).toString()
               formattedAmount = formatCurrencyInputByCurrency(rounded, formData.currency as Currency)
            }

            // Update both couplePrice and priceInBRL
            setValue('couplePrice', formattedAmount)
            setValue('priceInBRL', convertToBRL(convertedAmount, formData.currency as Currency))
         }

         previousCurrency.current = formData.currency as Currency
      }
   }, [formData.currency, formData.couplePrice, setValue])

   // Get available currencies based on selected country
   const getAvailableCurrencies = (): { label: string; value: Currency }[] => {
      const country = formData.country as Country
      const brl = { label: 'R$ Real (BRL)', value: 'BRL' as Currency }

      if (country === 'japan') {
         return [{ label: '¥ Iene (JPY)', value: 'JPY' }, brl]
      } else if (country === 'south-korea') {
         return [{ label: '₩ Won (KRW)', value: 'KRW' }, brl]
      }
      return [brl]
   }

   const availableCurrencies = getAvailableCurrencies()

   // Update currency when country changes
   const handleCountryChange = (country: Country) => {
      setValue('country', country)
   }

   const handleCouplerPriceChange = (value: string) => {
      const formatted = formatCurrencyInputByCurrency(value, formData.currency as Currency)
      setValue('couplePrice', formatted)

      // Auto-calculate BRL price
      const price = currencyToNumber(formatted, formData.currency as Currency)
      setValue('priceInBRL', convertToBRL(price, formData.currency as Currency))
   }

   const onSubmit = (values: AttractionFormData) => {
      // Convert formatted couplePrice back to number
      const couplePrice = typeof values.couplePrice === 'string'
         ? currencyToNumber(values.couplePrice as string, values.currency as Currency)
         : (values.couplePrice as number)

      onSave({
         ...values,
         couplePrice
      } as Omit<Attraction, 'id'>)
   }

   return (
      <ModalBase
         isOpen={isOpen}
         onClose={onClose}
         title={attraction ? 'Editar Atração' : 'Nova Atração'}
         type={attraction ? 'edit' : 'create'}
         onSave={handleSubmit(onSubmit)}
         size="xl"
      >
         <div className="space-y-6">
            {/* Basic Information */}
            <section>
               <h3 className="font-bold text-base mb-4 pb-2 border-b-2 border-gray-200 flex items-center gap-2">
                  <span>📍</span>
                  <span>Informações Básicas</span>
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Nome da Atração *
                     </label>
                     <input
                        type="text"
                        required
                        {...register('name', { required: true })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                        placeholder="Ex: Templo Senso-ji"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        País *
                     </label>
                     <Controller
                        name="country"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                           <CustomSelect
                              value={formData.country ? `${COUNTRIES[formData.country].flag} ${COUNTRIES[formData.country].name}` : ''}
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
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Cidade *
                     </label>
                     <input
                        type="text"
                        required
                        {...register('city', { required: true })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                        placeholder="Ex: Tóquio"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Região/Bairro
                     </label>
                     <input
                        type="text"
                        {...register('region')}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                        placeholder="Ex: Asakusa"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Tipo *
                     </label>
                     <Controller
                        name="type"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                           <CustomSelect
                              value={formData.type ? `${ATTRACTION_TYPES[formData.type].icon} ${ATTRACTION_TYPES[formData.type].label}` : ''}
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
               </div>
            </section>

            {/* Date and Time */}
            <section>
               <h3 className="font-bold text-base mb-4 pb-2 border-b-2 border-gray-200 flex items-center gap-2">
                  <span>📅</span>
                  <span>Data e Horário</span>
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Dia da Viagem *
                     </label>
                     <input
                        type="number"
                        required
                        min="1"
                        {...register('day', { required: true, valueAsNumber: true })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Data *
                     </label>
                     <Controller
                        name="date"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                           <input
                              type="date"
                              required
                              {...field}
                              onChange={(e) => {
                                 field.onChange(e.target.value)
                                 // Auto-calculate day of week
                                 // Add time to prevent timezone issues
                                 const date = new Date(e.target.value + 'T12:00:00')
                                 setValue('dayOfWeek', date.toLocaleDateString('en-US', { weekday: 'long' }))
                              }}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                           />
                        )}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Ordem no Dia *
                     </label>
                     <input
                        type="number"
                        required
                        min="1"
                        {...register('order', { required: true, valueAsNumber: true })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Período Ideal
                     </label>
                     <Controller
                        name="idealPeriod"
                        control={control}
                        render={({ field }) => (
                           <CustomSelect
                              value={formData.idealPeriod ? `${PERIODS[formData.idealPeriod].icon} ${PERIODS[formData.idealPeriod].label} (${PERIODS[formData.idealPeriod].hours})` : ''}
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
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Hora Abertura
                     </label>
                     <input
                        type="time"
                        {...register('openingTime')}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Hora Fechamento
                     </label>
                     <input
                        type="time"
                        {...register('closingTime')}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Duração (min)
                     </label>
                     <input
                        type="number"
                        min="0"
                        {...register('duration', { valueAsNumber: true })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                     />
                  </div>

                  <div className="md:col-span-2">
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Dias Fechados
                     </label>
                     <div className="flex flex-wrap gap-2">
                        {Object.entries(WEEK_DAYS).map(([key, day]) => (
                           <label key={key} className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border-2 border-gray-300 rounded-lg cursor-pointer transition-colors">
                              <input
                                 type="checkbox"
                                 value={key}
                                 {...register('closedDays')}
                                 className="w-4 h-4 text-green-600 rounded"
                              />
                              <span className="text-sm font-medium text-gray-900">{day.short}</span>
                           </label>
                        ))}
                     </div>
                  </div>
               </div>
            </section>

            {/* Valores */}
            <section>
               <h3 className="font-bold text-base mb-4 pb-2 border-b-2 border-gray-200 flex items-center gap-2">
                  <span>💰</span>
                  <span>Valores</span>
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Valor Casal *
                     </label>
                     <Controller
                        name="couplePrice"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                           <input
                              type="text"
                              required
                              value={typeof field.value === 'string' ? field.value : ''}
                              onChange={(e) => {
                                 field.onChange(e.target.value)
                                 handleCouplerPriceChange(e.target.value)
                              }}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                              placeholder={formData.currency === 'BRL' ? 'R$ 0,00' : formData.currency === 'JPY' ? '¥ 0' : '₩ 0'}
                           />
                        )}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-bold text-gray-900 mb-2">
                        Moeda *
                     </label>
                     <Controller
                        name="currency"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                           <CustomSelect
                              value={availableCurrencies.find(c => c.value === formData.currency)?.label || ''}
                              onChange={(val) => {
                                 const currency = availableCurrencies.find(c => c.label === val)?.value
                                 if (currency) field.onChange(currency)
                              }}
                              options={availableCurrencies.map(c => c.label)}
                           />
                        )}
                     />
                  </div>

                  {formData.currency !== 'BRL' && (
                     <div className="md:col-span-3 bg-green-50 border-2 border-green-200 p-4 rounded-lg">
                        <span className="text-sm font-bold text-gray-900">Valor em Reais: </span>
                        <span className="font-bold text-lg text-green-700">
                           {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.priceInBRL || 0)}
                        </span>
                     </div>
                  )}
               </div>
            </section>

            {/* Status e Links */}
            <section>
               <h3 className="font-bold text-base mb-4 pb-2 border-b-2 border-gray-200 flex items-center gap-2">
                  <span>🔗</span>
                  <span>Links e Status</span>
               </h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-6 p-3 bg-gray-50 rounded-lg">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input
                           type="checkbox"
                           {...register('needsReservation')}
                           className="w-5 h-5 text-green-600 rounded"
                        />
                        <span className="text-sm font-bold text-gray-900">Necessita Reserva</span>
                     </label>

                     <label className="flex items-center gap-2 cursor-pointer">
                        <input
                           type="checkbox"
                           {...register('visited')}
                           className="w-5 h-5 text-green-600 rounded"
                        />
                        <span className="text-sm font-bold text-gray-900">Já Visitado</span>
                     </label>
                  </div>

                  {formData.needsReservation && (
                     <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                           Status da Reserva
                        </label>
                        <Controller
                           name="reservationStatus"
                           control={control}
                           render={({ field }) => (
                              <CustomSelect
                                 value={formData.reservationStatus ? `${RESERVATION_STATUS[formData.reservationStatus as ReservationStatus].icon} ${RESERVATION_STATUS[formData.reservationStatus as ReservationStatus].label}` : ''}
                                 onChange={(val) => {
                                    if (!val) {
                                       field.onChange(undefined)
                                       return
                                    }
                                    const statusKey = Object.entries(RESERVATION_STATUS).find(([_, s]) => `${s.icon} ${s.label}` === val)?.[0]
                                    if (statusKey) field.onChange(statusKey as ReservationStatus)
                                 }}
                                 options={['', ...Object.entries(RESERVATION_STATUS).map(([_, status]) => `${status.icon} ${status.label}`)].filter(Boolean)}
                                 placeholder="Selecione o status"
                              />
                           )}
                        />
                     </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                           Link Ingresso/Reserva
                        </label>
                        <input
                           type="url"
                           {...register('ticketLink')}
                           className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                           placeholder="https://..."
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                           Localização (Google Maps)
                        </label>
                        <input
                           type="url"
                           {...register('location')}
                           className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                           placeholder="https://maps.google.com/..."
                        />
                     </div>

                     <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                           URL da Imagem
                        </label>
                        <input
                           type="url"
                           {...register('imageUrl')}
                           className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors placeholder-gray-500 text-gray-900"
                           placeholder="https://..."
                        />
                     </div>

                     <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-900 mb-2">
                           Observações
                        </label>
                        <textarea
                           {...register('notes')}
                           rows={3}
                           className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none transition-colors resize-none placeholder-gray-500 text-gray-900"
                           placeholder="Anotações adicionais..."
                        />
                     </div>
                  </div>
               </div>
            </section>

         </div>
      </ModalBase>
   )
}
