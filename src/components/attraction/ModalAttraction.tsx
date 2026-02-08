import { useState } from 'react'
import type { Attraction, Country, AttractionType, Currency, Period } from '@/types/Attraction'
import { COUNTRIES, ATTRACTION_TYPES, PERIODS } from '@/config/constants'
import { convertToBRL } from '@/utils/formatters'
import { ModalBase } from '@/components/ui/ModalBase'
import { CustomSelect } from '@/components/ui/CustomSelect'

interface ModalAttractionProps {
   attraction?: Attraction
   isOpen: boolean
   onClose: () => void
   onSave: (attraction: Omit<Attraction, 'id'>) => void
}

export function ModalAttraction({ attraction, isOpen, onClose, onSave }: ModalAttractionProps) {
   const [formData, setFormData] = useState<Partial<Attraction>>({
      name: attraction?.name || '',
      country: attraction?.country || 'japan',
      city: attraction?.city || '',
      region: attraction?.region || '',
      day: attraction?.day || 1,
      date: attraction?.date || '',
      dayOfWeek: attraction?.dayOfWeek || '',
      type: attraction?.type || 'other',
      order: attraction?.order || 1,
      visited: attraction?.visited || false,
      needsReservation: attraction?.needsReservation || false,
      reservationStatus: attraction?.reservationStatus,
      couplePrice: attraction?.couplePrice || 0,
      currency: attraction?.currency || 'JPY',
      priceInBRL: attraction?.priceInBRL || 0,
      idealPeriod: attraction?.idealPeriod,
      isOpen: attraction?.isOpen,
      openingTime: attraction?.openingTime || '',
      closingTime: attraction?.closingTime || '',
      closedDays: attraction?.closedDays || [],
      ticketLink: attraction?.ticketLink || '',
      location: attraction?.location || '',
      duration: attraction?.duration || 0,
      notes: attraction?.notes || '',
      imageUrl: attraction?.imageUrl || ''
   })

   const handleChange = (field: keyof Attraction, value: any) => {
      setFormData(prev => {
         const updated = { ...prev, [field]: value }

         // Auto-calculate BRL price when value or currency changes
         if (field === 'couplePrice' || field === 'currency') {
            const price = field === 'couplePrice' ? value : updated.couplePrice || 0
            const currency = field === 'currency' ? value : updated.currency || 'JPY'
            updated.priceInBRL = convertToBRL(price, currency as Currency)
         }

         // Auto-calculate day of week when date changes
         if (field === 'date' && value) {
            const date = new Date(value)
            updated.dayOfWeek = date.toLocaleDateString('pt-BR', { weekday: 'long' })
         }

         return updated
      })
   }

   const handleSubmit = () => {
      onSave(formData as Omit<Attraction, 'id'>)
   }

   return (
      <ModalBase
         isOpen={isOpen}
         onClose={onClose}
         title={attraction ? 'Editar Atração' : 'Nova Atração'}
         type={attraction ? 'edit' : 'create'}
         onSave={handleSubmit}
         size="xl"
      >
         <div className="space-y-6">
            {/* Basic Information */}
            <section>
               <h3 className="font-semibold text-lg mb-3">📍 Informações Básicas</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                     <label className="block text-sm font-medium mb-1">Nome da Atração *</label>
                     <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Ex: Templo Senso-ji"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">País *</label>
                     <CustomSelect
                        value={formData.country ? `${COUNTRIES[formData.country as Country].flag} ${COUNTRIES[formData.country as Country].name}` : ''}
                        onChange={(val) => {
                           const countryKey = Object.entries(COUNTRIES).find(([_, c]) => `${c.flag} ${c.name}` === val)?.[0]
                           if (countryKey) handleChange('country', countryKey as Country)
                        }}
                        options={Object.entries(COUNTRIES).map(([_, country]) => `${country.flag} ${country.name}`)}
                        placeholder="Selecione o país"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Cidade *</label>
                     <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => handleChange('city', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Ex: Tóquio"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Região/Bairro</label>
                     <input
                        type="text"
                        value={formData.region}
                        onChange={(e) => handleChange('region', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Ex: Asakusa"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Tipo *</label>
                     <CustomSelect
                        value={formData.type ? `${ATTRACTION_TYPES[formData.type as AttractionType].icon} ${ATTRACTION_TYPES[formData.type as AttractionType].label}` : ''}
                        onChange={(val) => {
                           const typeKey = Object.entries(ATTRACTION_TYPES).find(([_, t]) => `${t.icon} ${t.label}` === val)?.[0]
                           if (typeKey) handleChange('type', typeKey as AttractionType)
                        }}
                        options={Object.entries(ATTRACTION_TYPES).map(([_, type]) => `${type.icon} ${type.label}`)}
                        placeholder="Selecione o tipo"
                     />
                  </div>
               </div>
            </section>

            {/* Date and Time */}
            <section>
               <h3 className="font-semibold text-lg mb-3">📅 Data e Horário</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                     <label className="block text-sm font-medium mb-1">Dia da Viagem *</label>
                     <input
                        type="number"
                        required
                        min="1"
                        value={formData.day}
                        onChange={(e) => handleChange('day', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Data *</label>
                     <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => handleChange('date', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Ordem no Dia *</label>
                     <input
                        type="number"
                        required
                        min="1"
                        value={formData.order}
                        onChange={(e) => handleChange('order', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Período Ideal</label>
                     <CustomSelect
                        value={formData.idealPeriod ? `${PERIODS[formData.idealPeriod as Period].icon} ${PERIODS[formData.idealPeriod as Period].label} (${PERIODS[formData.idealPeriod as Period].hours})` : ''}
                        onChange={(val) => {
                           if (!val) {
                              handleChange('idealPeriod', undefined)
                              return
                           }
                           const periodKey = Object.entries(PERIODS).find(([_, p]) => `${p.icon} ${p.label} (${p.hours})` === val)?.[0]
                           if (periodKey) handleChange('idealPeriod', periodKey as Period)
                        }}
                        options={['', ...Object.entries(PERIODS).map(([_, period]) => `${period.icon} ${period.label} (${period.hours})`)].filter(Boolean)}
                        placeholder="Não especificado"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Hora Abertura</label>
                     <input
                        type="time"
                        value={formData.openingTime}
                        onChange={(e) => handleChange('openingTime', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Duração (min)</label>
                     <input
                        type="number"
                        min="0"
                        value={formData.duration}
                        onChange={(e) => handleChange('duration', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                     />
                  </div>
               </div>
            </section>

            {/* Valores */}
            <section>
               <h3 className="font-semibold text-lg mb-3">💰 Valores</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                     <label className="block text-sm font-medium mb-1">Valor Casal *</label>
                     <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.couplePrice}
                        onChange={(e) => handleChange('couplePrice', Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium mb-1">Moeda *</label>
                     <CustomSelect
                        value={formData.currency === 'JPY' ? '¥ Iene (JPY)' : formData.currency === 'KRW' ? '₩ Won (KRW)' : 'R$ Real (BRL)'}
                        onChange={(val) => {
                           const currencyMap: Record<string, Currency> = {
                              '¥ Iene (JPY)': 'JPY',
                              '₩ Won (KRW)': 'KRW',
                              'R$ Real (BRL)': 'BRL'
                           }
                           handleChange('currency', currencyMap[val])
                        }}
                        options={['¥ Iene (JPY)', '₩ Won (KRW)', 'R$ Real (BRL)']}
                     />
                  </div>

                  <div className="md:col-span-3 bg-gray-50 p-3 rounded-lg">
                     <span className="text-sm text-gray-600">Valor em Reais: </span>
                     <span className="font-bold text-lg">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(formData.priceInBRL || 0)}
                     </span>
                  </div>
               </div>
            </section>

            {/* Status e Links */}
            <section>
               <h3 className="font-semibold text-lg mb-3">🔗 Links e Status</h3>
               <div className="space-y-4">
                  <div className="flex items-center gap-4">
                     <label className="flex items-center gap-2 cursor-pointer">
                        <input
                           type="checkbox"
                           checked={formData.needsReservation}
                           onChange={(e) => handleChange('needsReservation', e.target.checked)}
                           className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm font-medium">Necessita Reserva</span>
                     </label>

                     <label className="flex items-center gap-2 cursor-pointer">
                        <input
                           type="checkbox"
                           checked={formData.visited}
                           onChange={(e) => handleChange('visited', e.target.checked)}
                           className="w-4 h-4 text-green-600"
                        />
                        <span className="text-sm font-medium">Já Visitado</span>
                     </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium mb-1">Link Ingresso/Reserva</label>
                        <input
                           type="url"
                           value={formData.ticketLink}
                           onChange={(e) => handleChange('ticketLink', e.target.value)}
                           className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                           placeholder="https://..."
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium mb-1">Localização (Google Maps)</label>
                        <input
                           type="url"
                           value={formData.location}
                           onChange={(e) => handleChange('location', e.target.value)}
                           className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                           placeholder="https://maps.google.com/..."
                        />
                     </div>

                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">URL da Imagem</label>
                        <input
                           type="url"
                           value={formData.imageUrl}
                           onChange={(e) => handleChange('imageUrl', e.target.value)}
                           className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                           placeholder="https://..."
                        />
                     </div>

                     <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Observações</label>
                        <textarea
                           value={formData.notes}
                           onChange={(e) => handleChange('notes', e.target.value)}
                           rows={3}
                           className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
