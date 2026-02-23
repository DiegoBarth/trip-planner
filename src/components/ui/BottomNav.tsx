import { Link, useLocation } from 'react-router-dom'
import Home from 'lucide-react/dist/esm/icons/home';
import Map from 'lucide-react/dist/esm/icons/map';
import BarChart3 from 'lucide-react/dist/esm/icons/bar-chart-3';
import Calendar from 'lucide-react/dist/esm/icons/calendar';
import ListChecks from 'lucide-react/dist/esm/icons/list-checks';
import { cn } from '@/lib/utils'

const navItems = [
  { path: '/', icon: Home, label: 'Início' },
  { path: '/timeline', icon: Calendar, label: 'Roteiro' },
  { path: '/map', icon: Map, label: 'Mapa' },
  { path: '/checklist', icon: ListChecks, label: 'Checklist' },
  { path: '/dashboard', icon: BarChart3, label: 'Resumo' },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 safe-area-inset-bottom z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 min-w-[64px] focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none',
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50'
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
  );
}