import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './ThemeToggle'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  action?: ReactNode
  /** Conteúdo extra abaixo do título (ex.: CountryFilter para país/dia) */
  filter?: ReactNode
  className?: string
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBack = true, 
  action,
  filter,
  className 
}: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className={cn(
      'sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-purple-600 text-white',
      'px-4 pt-3 pb-4 shadow-lg',
      className
    )}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2 min-w-0">
            {showBack && (
              <button
                onClick={() => navigate('/')}
                className="flex items-center gap-1.5 text-white/90 hover:text-white transition-colors flex-shrink-0 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium hidden sm:inline">Voltar</span>
              </button>
            )}
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display truncate">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {action}
            <ThemeToggle />
          </div>
        </div>
        {subtitle && (
          <p className="text-white/90 mt-0.5 line-clamp-2 text-xs sm:text-sm md:text-base hidden sm:block">
            {subtitle}
          </p>
        )}
        {filter && <div className="mt-3">{filter}</div>}
      </div>
    </header>
  )
}
