import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import type { Reservation, ReservationType, BookingStatus } from '@/types/Reservation'
import type { Country } from '@/types/Attraction'
import { RESERVATION_TYPES, BOOKING_STATUS, COUNTRIES } from '@/config/constants'
import { ModalBase } from '@/components/ui/ModalBase'
import { CustomSelect } from '@/components/ui/CustomSelect'
import { FileUpload } from './FileUpload'
import { deleteFile } from '@/api/reservation'
import { useCountry } from '@/contexts/CountryContext'
import { dateToInputFormat } from '@/utils/formatters'

interface ModalReservationProps {
   reservation?: Reservation
   isOpen: boolean
   onClose: () => void
   onSave: (reservation: Omit<Reservation, 'id'>) => void | Promise<void>
}

interface ReservationFormData {
   type: ReservationType
   title: string
   description: string
   confirmationCode: string
   date: string
   endDate: string
   time: string
   location: string
   provider: string
   bookingUrl: string
   documentUrl: string
   status: BookingStatus
   notes: string
   country?: Country
   attractionId?: number
}

export function ModalReservation({ reservation, isOpen, onClose, onSave }: ModalReservationProps) {
   const [saving, setSaving] = useState(false)
   const [documentFileId, setDocumentFileId] = useState<string>('')
   const [initialDocumentFileId, setInitialDocumentFileId] = useState<string>('')
   
   const { register, handleSubmit, watch, setValue, reset, control } = useForm<ReservationFormData>({
      defaultValues: {
         type: 'document',
         title: '',
         description: '',
         confirmationCode: '',
         date: '',
         endDate: '',
         time: '',
         location: '',
         provider: '',
         bookingUrl: '',
         documentUrl: '',
         status: 'pending',
         notes: '',
         country: undefined,
         attractionId: undefined
      }
   })

   const formData = watch()
   const { attractions } = useCountry()

   // Reset form when modal opens or reservation changes
   useEffect(() => {
      if (isOpen) {
         if (reservation) {
            const fileId = reservation.documentFileId || ''
            reset({
               type: reservation.type,
               title: reservation.title,
               description: reservation.description || '',
               confirmationCode: reservation.confirmationCode || '',
               date: reservation.date ? dateToInputFormat(reservation.date) : '',
               endDate: reservation.endDate ? dateToInputFormat(reservation.endDate) : '',
               time: reservation.time || '',
               location: reservation.location || '',
               provider: reservation.provider || '',
               bookingUrl: reservation.bookingUrl || '',
               documentUrl: reservation.documentUrl || '',
               status: reservation.status,
               notes: reservation.notes || '',
               country: reservation.country,
               attractionId: reservation.attractionId
            })
            setDocumentFileId(fileId)
            setInitialDocumentFileId(fileId)
         } else {
            reset({
               type: 'document',
               title: '',
               description: '',
               confirmationCode: '',
               date: '',
               endDate: '',
               time: '',
               location: '',
               provider: '',
               bookingUrl: '',
               documentUrl: '',
               status: 'pending',
               notes: '',
               country: undefined,
               attractionId: undefined
            })
            setDocumentFileId('')
            setInitialDocumentFileId('')
         }
      }
   }, [isOpen, reservation, reset])

   const handleClose = async () => {
      // Check if there's a new file that wasn't saved (uploaded but modal was cancelled)
      if (documentFileId && documentFileId !== initialDocumentFileId) {
         try {
            await deleteFile(documentFileId)
         } catch (error) {
            console.error('Error cleaning up unsaved file:', error)
            // Continue closing anyway
         }
      }
      onClose()
   }

   const onSubmit = async (values: ReservationFormData) => {
      setSaving(true)
      try {
         await Promise.resolve(onSave({
            type: values.type,
            title: values.title.trim(),
            description: values.description.trim() || undefined,
            confirmationCode: values.confirmationCode.trim() || undefined,
            date: values.date || undefined,
            endDate: values.endDate || undefined,
            time: values.time || undefined,
            location: values.location.trim() || undefined,
            provider: values.provider.trim() || undefined,
            bookingUrl: values.bookingUrl.trim() || undefined,
            documentUrl: values.documentUrl.trim() || undefined,
            documentFileId: documentFileId || undefined,
            status: values.status,
            notes: values.notes.trim() || undefined,
            country: values.country,
            attractionId: values.attractionId
         }))
         onClose()
      } finally {
         setSaving(false)
      }
   }

   return (
      <ModalBase
         isOpen={isOpen}
         onClose={handleClose}
         title={reservation ? 'Editar Reserva' : 'Nova Reserva'}
         type={reservation ? 'edit' : 'create'}
         onSave={handleSubmit(onSubmit)}
         loading={saving}
         loadingText="Salvando..."
         size="lg"
      >
         <div className="space-y-4">
            {/* Type and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
               <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                     Tipo *
                  </label>
                  <CustomSelect
                     value={RESERVATION_TYPES[formData.type].label}
                     onChange={(val) => {
                        const typeKey = Object.entries(RESERVATION_TYPES).find(([_, c]) => c.label === val)?.[0] as ReservationType
                        if (typeKey) setValue('type', typeKey)
                     }}
                     options={Object.values(RESERVATION_TYPES).map(t => t.label)}
                  />
               </div>

               <div>
                  <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                     Status *
                  </label>
                  <CustomSelect
                     value={BOOKING_STATUS[formData.status].label}
                     onChange={(val) => {
                        const statusKey = Object.entries(BOOKING_STATUS).find(([_, c]) => c.label === val)?.[0] as BookingStatus
                        if (statusKey) setValue('status', statusKey)
                     }}
                     options={Object.values(BOOKING_STATUS).map(s => s.label)}
                  />
               </div>
            </div>

            {/* Title */}
            <div>
               <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                  Título *
               </label>
               <input
                  type="text"
                  required
                  autoComplete="off"
                  {...register('title', { required: true })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
                  placeholder="Ex: Voo São Paulo → Tóquio"
               />
            </div>

            {/* Description */}
            <div>
               <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                  Descrição
               </label>
               <input
                  type="text"
                  autoComplete="off"
                  {...register('description')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
                  placeholder="Detalhes adicionais..."
               />
            </div>

            {/* Dates and Time Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
               <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5">📅 Datas e Horário</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Data
                     </label>
                     <input
                        type="date"
                        {...register('date')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none text-gray-900 dark:text-gray-100"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Data Fim
                     </label>
                     <input
                        type="date"
                        {...register('endDate')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none text-gray-900 dark:text-gray-100"
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Horário
                     </label>
                     <input
                        type="time"
                        {...register('time')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none text-gray-900 dark:text-gray-100"
                     />
                  </div>
               </div>
            </div>

            {/* Provider and Code Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
               <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5">🏢 Provedor e Confirmação</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Provedor
                     </label>
                     <input
                        type="text"
                        autoComplete="off"
                        {...register('provider')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: LATAM, Booki..."
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Código
                     </label>
                     <input
                        type="text"
                        autoComplete="off"
                        {...register('confirmationCode')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 font-mono uppercase"
                        placeholder="ABC123"
                     />
                  </div>
               </div>
            </div>

            {/* Location Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
               <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5">📍 Localização</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Local
                     </label>
                     <input
                        type="text"
                        autoComplete="off"
                        {...register('location')}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
                        placeholder="Ex: Aeroporto de Narita"
                     />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                           País
                        </label>
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
                           placeholder="Selecione..."
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                           Vincular Atração <span className="text-xs text-gray-500">(opcional)</span>
                        </label>
                        <Controller
                           name="attractionId"
                           control={control}
                           render={({ field }) => (
                              <CustomSelect
                                 value={formData.attractionId ? attractions.find(a => a.id === formData.attractionId)?.name || '' : ''}
                                 onChange={(val) => {
                                    if (!val) {
                                       field.onChange(undefined)
                                       return
                                    }
                                    const attraction = attractions.find(a => a.name === val)
                                    if (attraction) field.onChange(attraction.id)
                                 }}
                                 options={['', ...attractions.map(a => a.name)]}
                                 placeholder="Nenhuma..."
                              />
                           )}
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Links Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
               <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5">🔗 Links</h3>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                     Link da Reserva
                  </label>
                  <input
                     type="url"
                     autoComplete="off"
                     {...register('bookingUrl')}
                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
                     placeholder="https://booking.com/..."
                  />
               </div>
            </div>

            {/* Document Section */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
               <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2.5">📄 Documento</h3>
               <div className="space-y-4">
                  <FileUpload
                     label="Comprovante ou documento"
                     currentFile={formData.documentUrl}
                     currentFileId={documentFileId}
                     onFileUploaded={(url, fileId) => {
                        setValue('documentUrl', url)
                        setDocumentFileId(fileId)
                     }}
                  />
                  
                  <div className="relative">
                     <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                     </div>
                     <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">ou cole um link</span>
                     </div>
                  </div>

                  <input
                     type="url"
                     autoComplete="off"
                     value={formData.documentUrl}
                     onChange={(e) => setValue('documentUrl', e.target.value)}
                     className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 text-sm"
                     placeholder="https://drive.google.com/..."
                  />
               </div>
            </div>

            {/* Notes */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
               <label className="block text-sm font-bold text-gray-900 dark:text-gray-100 mb-1.5">
                  📝 Observações
               </label>
               <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 resize-none"
                  placeholder="Informações adicionais importantes..."
               />
            </div>
         </div>
      </ModalBase>
   )
}
