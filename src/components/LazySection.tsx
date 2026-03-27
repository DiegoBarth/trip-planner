import { useInView } from 'react-intersection-observer'
import { Suspense, type ReactNode } from 'react'

interface LazySectionProps {
  children: ReactNode
  height?: number
  /** Shown while the lazy child suspends (e.g. chart chunk loading). */
  fallback?: ReactNode
}

export function LazySection({ children, height = 200, fallback }: LazySectionProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',
  })

  const suspenseFallback = fallback ?? <div style={{ height }} />

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {inView ? (
        <Suspense fallback={suspenseFallback}>
          {children}
        </Suspense>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  )
}
