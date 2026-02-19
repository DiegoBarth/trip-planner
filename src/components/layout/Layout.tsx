import { type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
  onBack?: () => void
  headerSlot?: ReactNode
  headerClassName?: string
  containerClassName?: string
  contentClassName?: string
}

export function Layout({
  title,
  subtitle,
  children,
  onBack,
  headerSlot,
  headerClassName,
  containerClassName = 'max-w-6xl',
  contentClassName = '',
}: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className={cn(
        'p-6 shadow-lg',
        headerClassName
      )}>
        <div className={cn('mx-auto', containerClassName)}>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-current opacity-90 hover:opacity-100 transition-opacity mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Voltar para Home
            </button>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{title}</h1>
              {subtitle && (
                <p className="mt-1 opacity-90">{subtitle}</p>
              )}
            </div>
            {headerSlot && (
              <div className="flex items-center gap-3">
                {headerSlot}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className={cn(
        'mx-auto',
        containerClassName,
        contentClassName
      )}>
        {children}
      </main>
    </div>
  );
}