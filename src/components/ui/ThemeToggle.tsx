import { useCallback, useContext, useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { ThemeContext } from '@/contexts/ThemeContext'

function getThemeFromDOM(): 'light' | 'dark' {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function ThemeToggle() {
  const ctx = useContext(ThemeContext)
  const [localTheme, setLocalTheme] = useState<'light' | 'dark'>(() => getThemeFromDOM())
  const theme = ctx ? ctx.theme : localTheme

  useEffect(() => {
    if (!ctx) setLocalTheme(getThemeFromDOM())
  }, [ctx])

  const handleClick = useCallback(() => {
    if (ctx) {
      ctx.toggleTheme()
      return
    }
    const next = getThemeFromDOM() === 'light' ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem('theme', next)
    } catch (_) {}
    setLocalTheme(next)
  }, [ctx])

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleClick()
      }}
      className="relative z-10 p-2.5 rounded-xl text-white/90 hover:text-white hover:bg-white/15 transition-colors cursor-pointer focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:outline-none"
      title={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
      aria-label={theme === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'}
    >
      {theme === 'light' ? (
        <Moon className="w-5 h-5" strokeWidth={2} />
      ) : (
        <Sun className="w-5 h-5" strokeWidth={2} />
      )}
    </button>
  )
}
