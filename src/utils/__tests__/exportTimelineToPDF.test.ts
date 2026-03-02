import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportTimelineToPDF } from '../exportTimelineToPDF'
import type { TimelineDay } from '@/types/Timeline'
import type { Attraction } from '@/types/Attraction'

const mockSave = vi.fn()
const mockAddPage = vi.fn()
const mockText = vi.fn()

function createMockDoc() {
  return {
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    setFillColor: vi.fn(),
    setDrawColor: vi.fn(),
    text: mockText,
    line: vi.fn(),
    rect: vi.fn(),
    roundedRect: vi.fn(),
    addPage: mockAddPage,
    save: mockSave,
  }
}

vi.mock('jspdf', () => ({
  default: class MockJsPDF {
    constructor() {
      return createMockDoc()
    }
  },
}))

function makeAttraction(overrides: Partial<Attraction> = {}): Attraction {
  return {
    id: 1,
    name: 'Temple',
    country: 'japan',
    city: 'Tokyo',
    day: 1,
    date: '2025-03-01',
    dayOfWeek: 'Mon',
    type: 'temple',
    order: 0,
    couplePrice: 1000,
    currency: 'JPY',
    priceInBRL: 50,
    visited: false,
    needsReservation: false,
    ...overrides,
  }
}

function makeTimelineDay(overrides: Partial<TimelineDay> = {}): TimelineDay {
  return {
    date: '2025-03-01',
    dayNumber: 1,
    attractions: [makeAttraction({ id: 1, name: 'Temple', city: 'Tokyo' })],
    segments: [null],
    conflicts: [],
    totalDistance: 5.2,
    totalTravelTime: 15,
    startTime: '09:00',
    endTime: '18:00',
    ...overrides,
  }
}

describe('exportTimelineToPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls doc.save with filename for single day', () => {
    const days = [makeTimelineDay({ dayNumber: 1, date: '2025-03-01' })]
    exportTimelineToPDF(days)
    expect(mockSave).toHaveBeenCalledTimes(1)
    const filename = mockSave.mock.calls[0][0]
    expect(filename).toMatch(/^timeline-dia-1-.*\.pdf$/)
  })

  it('calls doc.save with roteiro filename for multiple days', () => {
    const days = [
      makeTimelineDay({ dayNumber: 1, date: '2025-03-01' }),
      makeTimelineDay({ dayNumber: 2, date: '2025-03-02' }),
    ]
    exportTimelineToPDF(days)
    expect(mockSave).toHaveBeenCalledTimes(1)
    const filename = mockSave.mock.calls[0][0]
    expect(filename).toMatch(/^timeline-roteiro-\d{4}-\d{2}-\d{2}\.pdf$/)
  })

  it('renders timeline title in header', () => {
    const days = [makeTimelineDay()]
    exportTimelineToPDF(days)
    expect(mockText).toHaveBeenCalledWith('Timeline do Roteiro', expect.any(Number), 22, { align: 'center' })
  })

  it('renders day number and date for each day', () => {
    const days = [makeTimelineDay({ dayNumber: 1, date: '2025-03-01' })]
    exportTimelineToPDF(days)
    const textCalls = mockText.mock.calls.map(c => c[0])
    expect(textCalls.some(t => t === 'Dia 1')).toBe(true)
  })

  it('renders attraction names in roteiro section', () => {
    const days = [
      makeTimelineDay({
        attractions: [
          makeAttraction({ id: 1, name: 'Senso-ji' }),
          makeAttraction({ id: 2, name: 'Skytree' }),
        ],
        segments: [null, null],
      }),
    ]
    exportTimelineToPDF(days)
    const textCalls = mockText.mock.calls.map(c => c[0])
    expect(textCalls.some(t => typeof t === 'string' && t.includes('Senso-ji'))).toBe(true)
    expect(textCalls.some(t => typeof t === 'string' && t.includes('Skytree'))).toBe(true)
  })

  it('renders stats (locais, km, min viagem)', () => {
    const days = [makeTimelineDay({ totalDistance: 10.5, totalTravelTime: 30 })]
    exportTimelineToPDF(days)
    const textCalls = mockText.mock.calls.map(c => c[0])
    expect(textCalls.some(t => typeof t === 'string' && t.includes('locais'))).toBe(true)
    expect(textCalls.some(t => typeof t === 'string' && t.includes('km'))).toBe(true)
    expect(textCalls.some(t => typeof t === 'string' && t.includes('min viagem'))).toBe(true)
  })

  it('renders conflicts when day has conflicts', () => {
    const days = [
      makeTimelineDay({
        conflicts: [
          { attractionId: 1, type: 'overlap', message: 'Overlap with next', severity: 'warning' },
        ],
      }),
    ]
    exportTimelineToPDF(days)
    const textCalls = mockText.mock.calls.map(c => c[0])
    expect(textCalls.some(t => typeof t === 'string' && t.includes('conflito'))).toBe(true)
    expect(textCalls.some(t => typeof t === 'string' && t.includes('Overlap with next'))).toBe(true)
  })

  it('does not throw with empty attractions in a day', () => {
    const days = [
      makeTimelineDay({
        attractions: [],
        segments: [],
      }),
    ]
    expect(() => exportTimelineToPDF(days)).not.toThrow()
    expect(mockSave).toHaveBeenCalledTimes(1)
  })

  it('renders Roteiro label for attractions list', () => {
    const days = [makeTimelineDay()]
    exportTimelineToPDF(days)
    const textCalls = mockText.mock.calls.map(c => c[0])
    expect(textCalls).toContain('Roteiro')
  })
})
