import { useState } from 'react'
import GripVertical from 'lucide-react/dist/esm/icons/grip-vertical';
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { AttractionCard } from '@/components/attraction/AttractionCard'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { Attraction } from '@/types/Attraction'

interface DraggableAttractionCardProps {
  attraction: Attraction
  priority?: boolean
  onCheckVisited?: (id: number) => void
  onDelete?: (id: number) => void
  onClick?: () => void
}

export function DraggableAttractionCard({ attraction, priority = false, onCheckVisited, onDelete, onClick }: DraggableAttractionCardProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isPressing, setIsPressing] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: attraction.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1000 : 'auto'
  };

  const cardListeners = isMobile ? {
    ...attributes,
    ...listeners,
    onTouchStart: (e: React.TouchEvent) => {
      setIsPressing(true);
      listeners?.onTouchStart?.(e);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      setIsPressing(false);
      listeners?.onTouchEnd?.(e);
    },
    onTouchCancel: (e: React.TouchEvent) => {
      setIsPressing(false);
      listeners?.onTouchCancel?.(e);
    }
  } : attributes;

  const handleListeners = isMobile ? {} : listeners;

  return (
    <div
      data-testid="draggable-wrapper"
      ref={setNodeRef}
      style={style}
      className={`
        relative group
        focus:outline-none [-webkit-tap-highlight-color:transparent]
        ${isMobile && isPressing ? 'scale-[0.98] transition-transform' : ''}
      `}
      {...cardListeners}
    >

      {!isMobile && (
        <div
          {...handleListeners}
          className={`
      absolute top-2 left-2 z-30
      p-2 rounded-lg
      bg-black/40 backdrop-blur-sm
      opacity-0 group-hover:opacity-100
      transition-all duration-200
      cursor-grab active:cursor-grabbing
      ${isDragging ? 'opacity-100 ring-2 ring-blue-500' : ''}
    `}
          title="Arrastar para reordenar"
        >
          <GripVertical className="w-4 h-4 text-white" />
        </div>
      )}

      <div>
        <AttractionCard
          attraction={attraction}
          priority={priority}
          onCheckVisited={onCheckVisited}
          onDelete={onDelete}
          onClick={onClick}
        />
      </div>
    </div>
  );
}