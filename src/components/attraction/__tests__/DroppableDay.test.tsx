import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DroppableDay } from '../DroppableDay'
import type { Attraction } from '@/types/Attraction'

vi.mock('@/components/attraction/DraggableAttractionCard', () => ({
  DraggableAttractionCard: ({ attraction, priority, onCheckVisited, onDelete, onClick }: any) => (
    <div data-testid={`draggable-${attraction.id}`}>
      <span>{attraction.name}</span>
      {priority && <span data-testid={`priority-${attraction.id}`}>PRIORITY</span>}
      <button data-testid={`check-${attraction.id}`} onClick={() => onCheckVisited?.(attraction.id)}>Check</button>
      <button data-testid={`delete-${attraction.id}`} onClick={() => onDelete?.(attraction.id)}>Delete</button>
      <button data-testid={`click-${attraction.id}`} onClick={onClick}>Click</button>
    </div>
  ),
}))

const createAttraction = (overrides?: Partial<Attraction>): Attraction => ({
  id: Math.floor(Math.random() * 1000),
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

describe('DroppableDay', () => {
  const onToggleVisited = vi.fn()
  const onDelete = vi.fn()
  const onEdit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all attractions', () => {
    const attractions = [createAttraction({ id: 1, name: 'A1' }), createAttraction({ id: 2, name: 'A2' })]
    render(<DroppableDay day={1} attractions={attractions} />)

    expect(screen.getByText('A1')).toBeInTheDocument()
    expect(screen.getByText('A2')).toBeInTheDocument()
  })

  it('sets priority for first attraction', () => {
    const attractions = [createAttraction({ id: 1 }), createAttraction({ id: 2 })]
    render(<DroppableDay day={1} attractions={attractions} />)

    expect(screen.getByTestId('priority-1')).toBeInTheDocument()
    expect(screen.queryByTestId('priority-2')).toBeNull()
  })

  it('calls onToggleVisited when check button is clicked', () => {
    const attraction = createAttraction({ id: 10 })
    render(<DroppableDay day={1} attractions={[attraction]} onToggleVisited={onToggleVisited} />)

    fireEvent.click(screen.getByTestId('check-10'))
    expect(onToggleVisited).toHaveBeenCalledWith(10)
  })

  it('calls onDelete when delete button is clicked', () => {
    const attraction = createAttraction({ id: 20 })
    render(<DroppableDay day={1} attractions={[attraction]} onDelete={onDelete} />)

    fireEvent.click(screen.getByTestId('delete-20'))
    expect(onDelete).toHaveBeenCalledWith(20)
  })

  it('calls onEdit when click button is clicked', () => {
    const attraction = createAttraction({ id: 30 })
    render(<DroppableDay day={1} attractions={[attraction]} onEdit={onEdit} />)

    fireEvent.click(screen.getByTestId('click-30'))
    expect(onEdit).toHaveBeenCalledWith(attraction)
  })

  it('handles multiple attractions correctly', () => {
    const attractions = [
      createAttraction({ id: 1, name: 'A1' }),
      createAttraction({ id: 2, name: 'A2' }),
      createAttraction({ id: 3, name: 'A3' }),
    ]
    render(<DroppableDay day={2} attractions={attractions} onToggleVisited={onToggleVisited} />)

    attractions.forEach(a => {
      fireEvent.click(screen.getByTestId(`check-${a.id}`))
      expect(onToggleVisited).toHaveBeenCalledWith(a.id)
    })
  })
})