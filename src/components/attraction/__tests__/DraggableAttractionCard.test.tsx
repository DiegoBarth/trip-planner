import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DraggableAttractionCard } from '../DraggableAttractionCard'
import type { Attraction } from '@/types/Attraction'

vi.mock('@dnd-kit/sortable', () => ({
  useSortable: vi.fn(() => ({
    attributes: { 'data-sortable': 'true' },
    listeners: { onMouseDown: vi.fn(), onTouchStart: vi.fn(), onTouchEnd: vi.fn(), onTouchCancel: vi.fn() },
    setNodeRef: vi.fn(),
    transform: null,
    transition: '',
    isDragging: false,
  })),
}))

let isMobile = false
vi.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: () => isMobile,
}))

vi.mock('@/components/attraction/AttractionCard', () => ({
  AttractionCard: ({ attraction, onCheckVisited, onDelete, onClick }: any) => (
    <div data-testid="attraction-card">
      <span>{attraction.name}</span>
      <button data-testid="check-visited" onClick={() => onCheckVisited?.(attraction.id)}>Check</button>
      <button data-testid="delete" onClick={() => onDelete?.(attraction.id)}>Delete</button>
      <button data-testid="click" onClick={onClick}>Click</button>
    </div>
  ),
}))

const createAttraction = (overrides?: Partial<Attraction>): Attraction => ({
  id: 1,
  name: 'Tokyo Tower',
  country: 'japan',
  city: 'Tokyo',
  region: 'Kanto',
  day: 1,
  date: '2025-01-01',
  dayOfWeek: 'Wednesday',
  type: 'viewpoint',
  order: 1,
  visited: false,
  needsReservation: false,
  couplePrice: 100,
  currency: 'JPY',
  priceInBRL: 3,
  ...overrides,
})

describe('DraggableAttractionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    isMobile = false
  })

  it('renders attraction card with correct name', () => {
    const attraction = createAttraction()
    render(<DraggableAttractionCard attraction={attraction} />)

    expect(screen.getByText('Tokyo Tower')).toBeInTheDocument()
    expect(screen.getByTestId('attraction-card')).toBeInTheDocument()
  })

  it('calls onCheckVisited when check button clicked', () => {
    const attraction = createAttraction()
    const onCheckVisited = vi.fn()

    render(<DraggableAttractionCard attraction={attraction} onCheckVisited={onCheckVisited} />)
    fireEvent.click(screen.getByTestId('check-visited'))

    expect(onCheckVisited).toHaveBeenCalledWith(1)
  })

  it('calls onDelete when delete button clicked', () => {
    const attraction = createAttraction()
    const onDelete = vi.fn()

    render(<DraggableAttractionCard attraction={attraction} onDelete={onDelete} />)
    fireEvent.click(screen.getByTestId('delete'))

    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('calls onClick when click button pressed', () => {
    const attraction = createAttraction()
    const onClick = vi.fn()

    render(<DraggableAttractionCard attraction={attraction} onClick={onClick} />)
    fireEvent.click(screen.getByTestId('click'))

    expect(onClick).toHaveBeenCalled()
  })

  it('renders drag handle on desktop', () => {
    const attraction = createAttraction()
    render(<DraggableAttractionCard attraction={attraction} />)

    expect(screen.getByTitle(/arrastar para reordenar/i)).toBeInTheDocument()
  })

  it('does not render drag handle on mobile', () => {
    isMobile = true
    const attraction = createAttraction()
    render(<DraggableAttractionCard attraction={attraction} />)

    expect(screen.queryByText(/reordenar/i)).not.toBeInTheDocument()
  })

  it('applies pressing style on mobile touch', () => {
    isMobile = true
    const attraction = createAttraction()
    render(<DraggableAttractionCard attraction={attraction} />)

    const wrapperDiv = screen.getByTestId('draggable-wrapper')

    fireEvent.touchStart(wrapperDiv)
    expect(wrapperDiv.className).toContain('scale-[0.98]')

    fireEvent.touchEnd(wrapperDiv)
    expect(wrapperDiv.className).not.toContain('scale-[0.98]')
  })

  it('applies pressing style on mobile touch events', async () => {
    isMobile = true
    const attraction = createAttraction()
    render(<DraggableAttractionCard attraction={attraction} />)

    const wrapperDiv = screen.getByTestId('draggable-wrapper')

    fireEvent.touchStart(wrapperDiv)
    await waitFor(() => {
      expect(wrapperDiv.className).toContain('scale-[0.98]')
    })

    fireEvent.touchEnd(wrapperDiv)
    await waitFor(() => {
      expect(wrapperDiv.className).not.toContain('scale-[0.98]')
    })

    fireEvent.touchStart(wrapperDiv)
    await waitFor(() => expect(wrapperDiv.className).toContain('scale-[0.98]'))
    fireEvent.touchCancel(wrapperDiv)
    await waitFor(() => expect(wrapperDiv.className).not.toContain('scale-[0.98]'))
  })
})