import { ChevronLeft, ChevronRight, RefreshCcw } from 'lucide-react'

interface Props {
  direction: 'left' | 'right' | 'up' | null
}

const PX = 24

export function SwipeArrow({ direction }: Props) {
  if (!direction) return null

  const style = {
    '--swipe-x':
      direction === 'left' ? `-${PX}px` : direction === 'right' ? `${PX}px` : '0',
    '--swipe-y': direction === 'up' ? `-${PX}px` : '0',
  } as React.CSSProperties

  return (
    <div
      style={style}
      className={`fixed z-[9999] pointer-events-none opacity-80 [animation:swipeArrowIn_0.18s_ease-out]
            ${direction === 'up'
          ? 'top-4 left-[50%] -translate-x-1/2'
          : 'top-1/2 -translate-y-1/2'
        }
            ${direction === 'left' ? 'left-4' : ''}
            ${direction === 'right' ? 'right-4' : ''}
         `}
    >
      {direction === 'left' && (
        <ChevronLeft size={36} className="text-muted-foreground drop-shadow-sm" />
      )}
      {direction === 'right' && (
        <ChevronRight size={36} className="text-muted-foreground drop-shadow-sm" />
      )}
      {direction === 'up' && (
        <RefreshCcw size={26} className="text-muted-foreground drop-shadow-sm" />
      )}
    </div>
  )
}