import { useState, useRef, useEffect } from 'react'
import { ArrowLeft, SlidersHorizontal, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { FilterSheetProvider } from '@/contexts/FilterSheetContext'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'
import { type ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  action?: ReactNode
  filter?: ReactNode
  className?: string
}

export function PageHeader({ title, subtitle, showBack = true, action, filter, className }: PageHeaderProps) {
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [filterOpen, setFilterOpen] = useState(false)
  const filterSheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!filterOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFilterOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [filterOpen])

  const showFilterAsIcon = isMobile && !!filter

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg',
          isMobile ? 'px-3 pt-2 pb-2' : 'px-4 md:px-6 pt-3 pb-4',
          className
        )}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-1 items-center gap-2 min-w-0">
              {showBack && (
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors flex-shrink-0 p-1 -m-1 rounded-lg focus:ring-2 focus:ring-white/30 focus:outline-none"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">Voltar</span>
                </button>
              )}
              <h1
                className={cn(
                  'font-bold font-display truncate',
                  isMobile ? 'text-base' : 'text-xl sm:text-2xl md:text-3xl'
                )}
              >
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {showFilterAsIcon && (
                <button
                  type="button"
                  onClick={() => setFilterOpen(true)}
                  className="p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/15 transition-colors focus:ring-2 focus:ring-white/30 focus:outline-none"
                  aria-label="Filtros"
                >
                  <SlidersHorizontal className="w-5 h-5" />
                </button>
              )}
              {action}
              <ThemeToggle />
            </div>
          </div>
          {!isMobile && subtitle && (
            <p className="text-white/90 mt-0.5 line-clamp-2 text-xs sm:text-sm md:text-base">
              {subtitle}
            </p>
          )}
          {filter && !isMobile && <div className="mt-3">{filter}</div>}
        </div>
      </header>

      {showFilterAsIcon && filterOpen && (
        <>
          <div
            className="fixed inset-0 z-[65] bg-black/50 md:hidden"
            aria-hidden
            onClick={() => setFilterOpen(false)}
          />
          <div
            ref={filterSheetRef}
            className="fixed inset-x-0 bottom-0 z-[70] max-h-[85vh] flex flex-col rounded-t-2xl bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-2xl md:hidden"
            role="dialog"
            aria-label="Filtros"
          >
            <div className="flex items-center justify-between flex-shrink-0 p-4 pb-2 border-b border-gray-200 dark:border-gray-700">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-200">Filtros</span>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-4 pb-6 pt-1 min-h-0">
              <FilterSheetProvider dropdownPosition="above">
                {filter}
              </FilterSheetProvider>
            </div>
          </div>
        </>
      )}
    </>
  )
}