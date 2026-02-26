import { Outlet } from 'react-router-dom'
import { useSwipeNavigation } from '@/hooks/useSwipeNavigation'
import { SwipeArrow } from '../ui/SwipeArrow'

export function SwipeLayout() {
  const { handlers, arrow } = useSwipeNavigation()

  return (
    <div {...handlers} className="relative min-h-screen overflow-x-hidden">
      <SwipeArrow direction={arrow} />

      <main>
        <Outlet />
      </main>
    </div>
  )
}