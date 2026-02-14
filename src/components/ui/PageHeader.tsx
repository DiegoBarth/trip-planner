import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  action?: ReactNode
  className?: string
}

export function PageHeader({ 
  title, 
  subtitle, 
  showBack = true, 
  action,
  className 
}: PageHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className={cn(
      'sticky top-0 z-30 bg-gradient-to-r from-blue-600 to-purple-600 text-white',
      'px-4 pt-4 pb-6 shadow-lg',
      className
    )}>
      <div className="max-w-6xl mx-auto">
        {showBack && (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
        )}
        
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold font-display truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm md:text-base text-white/90 mt-1 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
          
          {action && (
            <div className="flex-shrink-0">
              {action}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
