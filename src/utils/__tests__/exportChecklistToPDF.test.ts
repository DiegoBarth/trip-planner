import { describe, it, expect, vi, beforeEach } from 'vitest'
import { exportChecklistToPDF } from '../exportChecklistToPDF'
import type { ChecklistItem } from '@/types/ChecklistItem'

const mockSave = vi.fn()
const mockAddPage = vi.fn()
const mockText = vi.fn()
const mockGetTextWidth = vi.fn()

function createMockDoc() {
  return {
    internal: {
      pageSize: {
        getWidth: () => 210,
        getHeight: () => 297,
      },
    },
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    setDrawColor: vi.fn(),
    setFillColor: vi.fn(),
    setLineWidth: vi.fn(),
    text: mockText,
    line: vi.fn(),
    rect: vi.fn(),
    circle: vi.fn(),
    addPage: mockAddPage,
    save: mockSave,
    getTextWidth: mockGetTextWidth,
    splitTextToSize: vi.fn((text: string) => [text]),
  }
}

vi.mock('jspdf', () => ({
  default: class MockJsPDF {
    constructor() {
      return createMockDoc()
    }
  },
}))

function makeItem(overrides: Partial<ChecklistItem> = {}): ChecklistItem {
  return {
    id: 1,
    category: 'documents',
    description: 'Passport',
    isPacked: false,
    quantity: 1,
    notes: '',
    ...overrides,
  }
}

describe('exportChecklistToPDF', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetTextWidth.mockReturnValue(20)
  })

  it('calls doc.save with filename matching checklist-YYYY-MM-DD.pdf', () => {
    exportChecklistToPDF({ items: [] })
    expect(mockSave).toHaveBeenCalledTimes(1)
    const filename = mockSave.mock.calls[0][0]
    expect(filename).toMatch(/^checklist-\d{4}-\d{2}-\d{2}\.pdf$/)
  })

  it('renders default title when no title option', () => {
    exportChecklistToPDF({ items: [] })
    expect(mockText).toHaveBeenCalledWith('Checklist de Viagem', expect.any(Number), expect.any(Number), { align: 'center' })
  })

  it('renders custom title when provided', () => {
    exportChecklistToPDF({ items: [], title: 'My Trip Checklist' })
    expect(mockText).toHaveBeenCalledWith('My Trip Checklist', expect.any(Number), expect.any(Number), { align: 'center' })
  })

  it('renders progress stats for items', () => {
    const items = [
      makeItem({ id: 1, description: 'A', isPacked: true }),
      makeItem({ id: 2, description: 'B', isPacked: false }),
    ]
    exportChecklistToPDF({ items })
    expect(mockText).toHaveBeenCalledWith('Progresso: 1/2 itens (50%)', 20, expect.any(Number))
  })

  it('renders 0% when items array is empty', () => {
    exportChecklistToPDF({ items: [] })
    expect(mockText).toHaveBeenCalledWith('Progresso: 0/0 itens (0%)', 20, expect.any(Number))
  })

  it('groups items by category and renders category labels', () => {
    const items = [
      makeItem({ id: 1, category: 'documents', description: 'Passport' }),
      makeItem({ id: 2, category: 'clothes', description: 'Shirt' }),
    ]
    exportChecklistToPDF({ items })
    expect(mockText).toHaveBeenCalledWith(expect.stringContaining('Documentos'), expect.any(Number), expect.any(Number))
    expect(mockText).toHaveBeenCalledWith(expect.stringContaining('Roupas'), expect.any(Number), expect.any(Number))
  })

  it('does not add page when items fit on one page', () => {
    const items = [makeItem({ id: 1, description: 'One item' })]
    exportChecklistToPDF({ items })
    expect(mockAddPage).not.toHaveBeenCalled()
  })

  it('includes item description in output', () => {
    const items = [makeItem({ id: 1, description: 'Passport' })]
    exportChecklistToPDF({ items })
    const textCalls = mockText.mock.calls.map(c => c[0])
    expect(textCalls.some(t => t === 'Passport' || (typeof t === 'string' && t.includes('Passport')))).toBe(true)
  })

  it('includes quantity when quantity > 1', () => {
    const items = [makeItem({ id: 1, description: 'Socks', quantity: 3 })]
    exportChecklistToPDF({ items })
    const textCalls = mockText.mock.calls.map(c => c[0])
    expect(textCalls.some(t => typeof t === 'string' && t.includes('x3'))).toBe(true)
  })

  it('renders notes when includeNotes is true and item has notes', () => {
    const items = [makeItem({ id: 1, description: 'Item', notes: 'Important note' })]
    exportChecklistToPDF({ items, includeNotes: true })
    const textCalls = mockText.mock.calls.map(c => c[0])
    const allText = textCalls.flatMap(t => (Array.isArray(t) ? t : [t])).join(' ')
    expect(allText).toMatch(/Observações/)
    expect(allText).toMatch(/Important note/)
  })

  it('does not throw with includeNotes false', () => {
    const items = [makeItem({ id: 1, notes: 'Note' })]
    expect(() => exportChecklistToPDF({ items, includeNotes: false })).not.toThrow()
    expect(mockSave).toHaveBeenCalledTimes(1)
  })
})
