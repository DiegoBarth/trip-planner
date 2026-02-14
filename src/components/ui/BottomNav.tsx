import { Link, useLocation } from 'react-router-dom'
import { Home, Map, BarChart3, Calendar, ListChecks } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/timeline', icon: Calendar, label: 'Roteiro' },
  { path: '/map', icon: Map, label: 'Mapa' },
  { path: '/checklist', icon: ListChecks, label: 'Checklist' },
  { path: '/dashboard', icon: BarChart3, label: 'Resumo' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom z-50 md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[64px]',
                isActive
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon 
                className={cn(
                  'w-6 h-6 transition-transform',
                  isActive && 'scale-110'
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={cn(
                'text-[10px] font-medium transition-all',
                isActive && 'font-semibold'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
