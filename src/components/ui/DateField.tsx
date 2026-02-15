import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { DayPicker } from "react-day-picker"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import "react-day-picker/dist/style.css"


export function DateField({
   value, onChange,
   required
}: { value: Date | undefined, onChange: (date: Date | undefined) => void, required?: boolean }) {
   // Unique id for this instance
   const idRef = useRef(Math.random().toString(36).slice(2))
   const [open, setOpen] = useState(false)
   const buttonRef = useRef<HTMLButtonElement | null>(null)
   const calendarRef = useRef<HTMLDivElement | null>(null)

   const buttonRect = buttonRef.current?.getBoundingClientRect()

   useEffect(() => {
      if (open) {
         const onAnyOpen = (e: CustomEvent) => {
            if (e.detail !== idRef.current) setOpen(false)
         }
         window.addEventListener('datefield:open', onAnyOpen as EventListener)
         window.dispatchEvent(new CustomEvent('datefield:open', { detail: idRef.current }))
         if (calendarRef.current) {
            let dayButton = calendarRef.current.querySelector('[role="gridcell"][aria-selected="true"] button');
            if (!dayButton) {
               dayButton = calendarRef.current.querySelector('[data-today="true"] button');
            }
            if (!dayButton) {
               dayButton = calendarRef.current.querySelector('[role="gridcell"] button');
            }
            if (dayButton) (dayButton as HTMLButtonElement).focus();
         }
         return () => {
            window.removeEventListener('datefield:open', onAnyOpen as EventListener)
         }
      }
   }, [open])

   return (
      <div className="relative flex items-center gap-2">
         <button
            ref={buttonRef}
            type="button"
            aria-label={value ? `Data selecionada: ${format(value, 'PPP', { locale: ptBR })}` : 'Selecione uma data'}
            onClick={() => setOpen(!open)}
            className="w-full border border-gray-300 dark:border-gray-600
                   bg-white dark:bg-gray-700
                   text-gray-900 dark:text-gray-100
                   rounded-md p-2 text-left focus:outline-none
                   focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
         >
            {value
               ? format(value, "PPP", { locale: ptBR })
               : required ? <span className="text-muted-foreground">Selecione uma data *</span> : <span className="text-muted-foreground">Selecione uma data</span>}
         </button>
         {value && (
            <button
               type="button"
               aria-label="Limpar data"
               className="ml-1 px-2 py-1 rounded text-xs text-gray-900 dark:text-gray-100
                  focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500"
               onClick={() => onChange(undefined)}
               tabIndex={0}
            >
               &#10005;
            </button>
         )}

         {open &&
            buttonRect &&
            createPortal(
               <div
                  ref={calendarRef}
                  className="fixed z-[9999]
                       bg-white dark:bg-gray-800
                       border border-gray-200 dark:border-gray-700
                       rounded-lg shadow-lg p-3"
                  style={{
                     top: buttonRect.top - 320,
                     left: buttonRect.left,
                  }}
               >
                  <DayPicker
                     mode="single"
                     selected={value}
                     onSelect={(date) => {
                        onChange(date)
                        setOpen(false)
                        setTimeout(() => {
                           buttonRef.current?.focus()
                        }, 0)
                     }}
                     locale={ptBR}
                     className="custom-calendar"
                  />
               </div>,
               document.body
            )}
      </div>
   )
}