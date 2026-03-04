import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

import { AttractionsGrid } from '../AttractionsGrid'
import type { Attraction } from '@/types/Attraction'

vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ title, description }: any) => (
    <div data-testid="empty-state">
      <span>{title}</span>
      <span>{description}</span>
    </div>
  ),
}))

const mockCard = vi.fn()

vi.mock('@/components/attraction/AttractionCard', () => ({
  AttractionCard: (props: any) => {
    mockCard(props)
    return (
      <div data-testid={`card-${props.attraction.id}`}>
        <button
          aria-label={`edit-${props.attraction.id}`}
          onClick={props.onClick}
        />
        <button
          aria-label={`delete-${props.attraction.id}`}
          onClick={() => props.onDelete?.(props.attraction.id)}
        />
        <button
          aria-label={`visited-${props.attraction.id}`}
          onClick={() => props.onCheckVisited?.(props.attraction.id)}
        />
      </div>
    )
  },
}))

const mockHook = vi.fn()

vi.mock('@/hooks/useAttractionsGrouped', () => ({
  useAttractionsGrouped: (args: any) => mockHook(args),
}))

const createAttraction = (id: number, overrides?: Partial<Attraction>): Attraction => ({
  id,
  name: `Attraction ${id}`,
  country: 'japan',
  city: 'Tokyo',
  region: 'Kanto',
  day: 1,
  date: '2026-01-01',
  dayOfWeek: 'Monday',
  type: 'viewpoint',
  order: id,
  visited: false,
  needsReservation: false,
  couplePrice: 100,
  currency: 'JPY',
  priceInBRL: 4,
  ...overrides,
})

const baseHookReturn = {
  displayAttractions: [1],
  isAllDaysView: true,
  isReadyForTotals: true,
  getCountryTotalCouplePrice: vi.fn(() => '¥200'),
  getCountryTotalPriceBrl: vi.fn(() => 8),
  getDayTotalCouplePrice: vi.fn(() => '¥100'),
  getDayTotalPriceBrl: vi.fn(() => 4),
  sortedCountryEntries: [],
  COUNTRIES: {
    japan: { flag: '🇯🇵', name: 'Japan' },
  },
  formatDate: vi.fn(() => '01 Jan'),
  formatCurrency: vi.fn((v: number) => `R$ ${v}`),
}

describe('AttractionsGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders EmptyState when there are no attractions', () => {
    mockHook.mockReturnValue({
      ...baseHookReturn,
      displayAttractions: [],
    })

    render(
      <AttractionsGrid
        attractions={[]}
        emptyTitle="Nothing here"
        emptyDescription="Add items"
      />
    )

    expect(screen.getByTestId('empty-state')).toBeInTheDocument()
    expect(screen.getByText('Nothing here')).toBeInTheDocument()
  })

  it('renders country and day sections', () => {
    const attraction = createAttraction(1)

    mockHook.mockReturnValue({
      ...baseHookReturn,
      sortedCountryEntries: [
        [
          'japan',
          {
            1: [attraction],
          },
        ],
      ],
    })

    render(
      <AttractionsGrid
        attractions={[attraction]}
        emptyTitle="x"
        emptyDescription="y"
      />
    )

    expect(screen.getByText('Japan')).toBeInTheDocument()
    expect(screen.getByText(/Dia 1/)).toBeInTheDocument()
    expect(screen.getByText(/1 atração/)).toBeInTheDocument()
  })

  it('renders plural correctly', () => {
    const a1 = createAttraction(1)
    const a2 = createAttraction(2)

    mockHook.mockReturnValue({
      ...baseHookReturn,
      sortedCountryEntries: [
        [
          'japan',
          {
            1: [a1, a2],
          },
        ],
      ],
    })

    render(
      <AttractionsGrid
        attractions={[a1, a2]}
        emptyTitle="x"
        emptyDescription="y"
      />
    )

    expect(screen.getByText(/2 atrações/)).toBeInTheDocument()
  })

  it('propagates onEdit to AttractionCard', () => {
    const attraction = createAttraction(1)
    const onEdit = vi.fn()

    mockHook.mockReturnValue({
      ...baseHookReturn,
      sortedCountryEntries: [
        ['japan', { 1: [attraction] }],
      ],
    })

    render(
      <AttractionsGrid
        attractions={[attraction]}
        emptyTitle="x"
        emptyDescription="y"
        onEdit={onEdit}
      />
    )

    fireEvent.click(screen.getByLabelText('edit-1'))
    expect(onEdit).toHaveBeenCalledWith(attraction)
  })

  it('propagates onDelete to AttractionCard', () => {
    const attraction = createAttraction(1)
    const onDelete = vi.fn()

    mockHook.mockReturnValue({
      ...baseHookReturn,
      sortedCountryEntries: [
        ['japan', { 1: [attraction] }],
      ],
    })

    render(
      <AttractionsGrid
        attractions={[attraction]}
        emptyTitle="x"
        emptyDescription="y"
        onDelete={onDelete}
      />
    )

    fireEvent.click(screen.getByLabelText('delete-1'))
    expect(onDelete).toHaveBeenCalledWith(1)
  })

  it('propagates onToggleVisited to AttractionCard', () => {
    const attraction = createAttraction(1)
    const onToggleVisited = vi.fn()

    mockHook.mockReturnValue({
      ...baseHookReturn,
      sortedCountryEntries: [
        ['japan', { 1: [attraction] }],
      ],
    })

    render(
      <AttractionsGrid
        attractions={[attraction]}
        emptyTitle="x"
        emptyDescription="y"
        onToggleVisited={onToggleVisited}
      />
    )

    fireEvent.click(screen.getByLabelText('visited-1'))
    expect(onToggleVisited).toHaveBeenCalledWith(1)
  })

  it('sets priority=true only for above-the-fold cards', () => {
    const attractions = Array.from({ length: 8 }, (_, i) =>
      createAttraction(i + 1)
    )

    mockHook.mockReturnValue({
      ...baseHookReturn,
      sortedCountryEntries: [
        [
          'japan',
          {
            1: attractions,
          },
        ],
      ],
    })

    render(
      <AttractionsGrid
        attractions={attractions}
        emptyTitle="x"
        emptyDescription="y"
      />
    )

    // First 6 should be priority=true
    for (let i = 0; i < 6; i++) {
      expect(mockCard.mock.calls[i][0].priority).toBe(true)
    }

    // Remaining should be false
    for (let i = 6; i < attractions.length; i++) {
      expect(mockCard.mock.calls[i][0].priority).toBe(false)
    }
  })
})