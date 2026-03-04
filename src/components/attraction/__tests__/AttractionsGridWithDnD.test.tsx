import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'
import { AttractionsGridWithDnD } from '@/components/attraction/AttractionsGridWithDnD'
import { useAttractionsGrouped } from '@/hooks/useAttractionsGrouped'
import type { Attraction } from '@/types/Attraction'

let capturedOnDragEnd: any

vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual('@dnd-kit/core')

  return {
    ...actual,
    DndContext: ({ children, onDragEnd }: any) => {
      capturedOnDragEnd = onDragEnd
      return <div data-testid="dnd-context">{children}</div>
    },
    useSensor: () => ({}),
    useSensors: () => ([]),
    TouchSensor: {},
    MouseSensor: {},
  }
})

vi.mock('@/components/attraction/DroppableDay', () => ({
  DroppableDay: ({ day }: any) => (
    <div data-testid={`droppable-day-${day}`} />
  ),
}))

vi.mock('@/hooks/useAttractionsGrouped', () => ({
  useAttractionsGrouped: vi.fn(),
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

const mockUseAttractionsGrouped = (overrides = {}) => {
  const defaultReturn = {
    displayAttractions: [] as Attraction[],
    setDisplayAttractions: vi.fn(),
    isAllDaysView: false,
    isReadyForTotals: false,
    getCountryTotalCouplePrice: vi.fn(),
    getCountryTotalPriceBrl: vi.fn(),
    getDayTotalCouplePrice: vi.fn(),
    getDayTotalPriceBrl: vi.fn(),
    sortedCountryEntries: [] as any[],
    COUNTRIES: {},
    formatDate: vi.fn((d: string) => `formatted-${d}`),
    formatCurrency: vi.fn((v: number) => `R$ ${v}`),
  }

    ; (useAttractionsGrouped as Mock).mockReturnValue({
      ...defaultReturn,
      ...overrides,
    })
}

const attraction1 = createAttraction({ id: 1, order: 1 })
const attraction2 = createAttraction({ id: 2, order: 2 })

const baseAttractions: Attraction[] = [attraction1, attraction2]

describe('AttractionsGridWithDnD', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders empty state when no attractions', () => {
    mockUseAttractionsGrouped({
      displayAttractions: [],
    })

    render(
      <AttractionsGridWithDnD
        attractions={[]}
        emptyTitle="Sem atrações"
        emptyDescription="Adicione algo"
        onReorder={vi.fn()}
      />
    )

    expect(screen.getByText('Sem atrações')).toBeInTheDocument()
    expect(screen.getByText('Adicione algo')).toBeInTheDocument()
  })

  it('renders country and day correctly', () => {
    mockUseAttractionsGrouped({
      displayAttractions: baseAttractions,
      sortedCountryEntries: [
        [
          'japan',
          {
            1: baseAttractions,
          },
        ],
      ],
      COUNTRIES: {
        japan: { name: 'Japão', flag: '🇯🇵' },
      },
    })

    render(
      <AttractionsGridWithDnD
        attractions={baseAttractions}
        emptyTitle=""
        emptyDescription=""
        onReorder={vi.fn()}
      />
    )

    expect(screen.getByText('Japão')).toBeInTheDocument()
    expect(screen.getByText('Dia 1')).toBeInTheDocument()
    expect(screen.getByTestId('droppable-day-1')).toBeInTheDocument()
  })

  it('renders country totals when allowed', () => {
    mockUseAttractionsGrouped({
      displayAttractions: baseAttractions,
      isAllDaysView: true,
      isReadyForTotals: true,
      getCountryTotalCouplePrice: () => '¥1000',
      getCountryTotalPriceBrl: () => 200,
      sortedCountryEntries: [
        ['japan', { 1: baseAttractions }],
      ],
      COUNTRIES: {
        japan: { name: 'Japão', flag: '🇯🇵' },
      },
    })

    render(
      <AttractionsGridWithDnD
        attractions={baseAttractions}
        emptyTitle=""
        emptyDescription=""
        onReorder={vi.fn()}
      />
    )

    expect(screen.getByText('¥1000')).toBeInTheDocument()
    expect(screen.getByText('(R$ 200)')).toBeInTheDocument()
  })

  it('renders day totals when available', () => {
    mockUseAttractionsGrouped({
      displayAttractions: baseAttractions,
      getDayTotalCouplePrice: () => '¥500',
      getDayTotalPriceBrl: () => 100,
      sortedCountryEntries: [
        ['japan', { 1: baseAttractions }],
      ],
      COUNTRIES: {
        japan: { name: 'Japão', flag: '🇯🇵' },
      },
    })

    render(
      <AttractionsGridWithDnD
        attractions={baseAttractions}
        emptyTitle=""
        emptyDescription=""
        onReorder={vi.fn()}
      />
    )

    expect(screen.getByText('¥500')).toBeInTheDocument()
    expect(screen.getByText('(R$ 100)')).toBeInTheDocument()
  })

  it('does not reorder if over is null', () => {
    const onReorder = vi.fn()

    mockUseAttractionsGrouped({
      displayAttractions: baseAttractions,
    })

    render(
      <AttractionsGridWithDnD
        attractions={baseAttractions}
        emptyTitle=""
        emptyDescription=""
        onReorder={onReorder}
      />
    )

    capturedOnDragEnd({
      active: { id: 1 },
      over: null,
    })

    expect(onReorder).not.toHaveBeenCalled()
  })

  it('does not reorder if same id', () => {
    const onReorder = vi.fn()

    mockUseAttractionsGrouped({
      displayAttractions: baseAttractions,
    })

    render(
      <AttractionsGridWithDnD
        attractions={baseAttractions}
        emptyTitle=""
        emptyDescription=""
        onReorder={onReorder}
      />
    )

    capturedOnDragEnd({
      active: { id: 1 },
      over: { id: 1 },
    })

    expect(onReorder).not.toHaveBeenCalled()
  })

  it('does not reorder if countries differ', () => {
    const onReorder = vi.fn()

    const mixed = [
      createAttraction({ id: 1, country: 'japan' }),
      createAttraction({ id: 2, country: 'south-korea' }),
    ]

    mockUseAttractionsGrouped({
      displayAttractions: mixed,
    })

    render(
      <AttractionsGridWithDnD
        attractions={mixed}
        emptyTitle=""
        emptyDescription=""
        onReorder={onReorder}
      />
    )

    capturedOnDragEnd({
      active: { id: 1 },
      over: { id: 2 },
    })

    expect(onReorder).not.toHaveBeenCalled()
  })

  it('reorders correctly when valid drag happens', () => {
    const onReorder = vi.fn()
    const setDisplayAttractions = vi.fn()

    mockUseAttractionsGrouped({
      displayAttractions: baseAttractions,
      setDisplayAttractions,
    })

    render(
      <AttractionsGridWithDnD
        attractions={baseAttractions}
        emptyTitle=""
        emptyDescription=""
        onReorder={onReorder}
      />
    )

    capturedOnDragEnd({
      active: { id: 1 },
      over: { id: 2 },
    })

    expect(setDisplayAttractions).toHaveBeenCalled()
    expect(onReorder).toHaveBeenCalled()

    const reordered: Attraction[] = onReorder.mock.calls[0][0]

    expect(reordered.find(a => a.id === 1)?.order).toBe(2)
    expect(reordered.find(a => a.id === 2)?.order).toBe(1)
  })
})