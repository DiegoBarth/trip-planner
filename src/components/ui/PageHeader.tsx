import { useState, useEffect } from 'react'
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal';
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

  useEffect(() => {
    if (!filterOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFilterOpen(false)
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [filterOpen])

  const showFilterAsIcon = isMobile && !!filter

  return (
    <div className="sticky top-0 z-30 flex flex-col">

      <header
        className={cn(
          'bg-gradient-to-r from-blue-600 to-purple-600 shadow-md',
          'z-30',
          isMobile ? 'px-3 pt-2 pb-2' : 'px-4 md:px-6 pt-3 pb-4',
          className
        )}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-2 text-white">
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
                  isMobile ? 'text-base sm:text-xl' : 'text-xl sm:text-2xl md:text-3xl'
                )}
              >
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {showFilterAsIcon && (
                <button
                  type="button"
                  onClick={() => setFilterOpen((prev) => !prev)}
                  className={cn(
                    "p-2 rounded-xl transition-colors focus:ring-2 focus:ring-white/30 focus:outline-none",
                    filterOpen
                      ? "bg-white/20 text-white"
                      : "text-white/90 hover:text-white hover:bg-white/15"
                  )}
                  aria-label={filterOpen ? "Fechar Filtros" : "Filtros"}
                  aria-expanded={filterOpen}
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
        <div
          className="fixed inset-0 z-2 bg-black/40 dark:bg-black/60"
          onClick={() => setFilterOpen(false)}
        />
      )}

      {showFilterAsIcon && filterOpen && (
        <div className="w-full px-3 py-2 absolute top-full left-0 right-0">
          <div
            role="dialog"
            aria-label="Filtros"
            className="
              max-w-6xl mx-auto bg-white dark:bg-[#1e293b] rounded-[1.5rem]
              shadow-xl border border-gray-100 dark:border-slate-700 p-2 animate-in slide-in-from-top-2 fade-in-20 duration-200
            "
          >
            <FilterSheetProvider dropdownPosition="below">
              {filter}
            </FilterSheetProvider>
          </div>
        </div>
      )}

    </div>
  )
}