import { useInView } from 'react-intersection-observer'
import { Suspense, type ReactNode } from 'react'

interface LazySectionProps {
  children: ReactNode
  height?: number
}

export function LazySection({ children, height = 200 }: LazySectionProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',
  })

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {inView ? (
        <Suspense fallback={<div style={{ height }} />}>
          {children}
        </Suspense>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  )
}
