import { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { AttractionCard } from '@/components/attraction/AttractionCard'
import type { Attraction } from '@/types/Attraction'

interface Props {
  attractions: Attraction[]
  onToggleVisited?: (id: number) => void
  onDelete?: (id: number) => void
  onEdit?: (attraction: Attraction) => void
  /** Altura do viewport (mobile: 80vh, desktop em seção: 50vh). */
  height?: string
}

const CARD_HEIGHT = 364
const GAP = 12

export function VirtualizedAttractionsList({
  attractions,
  onToggleVisited,
  onDelete,
  onEdit,
  height = '80vh'
}: Props) {
  const parentRef = useRef<HTMLDivElement>(null)

  const rowVirtualizer = useVirtualizer({
    count: attractions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => CARD_HEIGHT + GAP,
    overscan: 5
  })

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height }}
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const attraction = attractions[virtualRow.index]

          return (
            <div
              key={attraction.id}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <div className="mb-3">
                <AttractionCard
                  attraction={attraction}
                  priority={virtualRow.index === 0}
                  onCheckVisited={onToggleVisited}
                  onDelete={onDelete}
                  onClick={() => onEdit?.(attraction)}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}