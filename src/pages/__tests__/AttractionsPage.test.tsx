import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AttractionsPage from '../AttractionsPage'
import { createPageWrapper } from './pageWrapper'
import { useAttraction } from '@/hooks/useAttraction'
import { useToast } from '@/contexts/toast'
import { useCountry } from '@/contexts/CountryContext'
import type { Attraction, Country } from '@/types/Attraction'

vi.mock('@/hooks/useAttraction', () => ({
  useAttraction: vi.fn(),
}))

vi.mock('@/contexts/toast', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/contexts/toast')>()
  return {
    ...actual,
    useToast: vi.fn(),
  }
})

vi.mock('@/contexts/CountryContext', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/contexts/CountryContext')>()
  return {
    ...actual,
    useCountry: vi.fn(),
  }
})

vi.mock('@/components/attraction/AttractionsList', () => ({
  default: function AttractionsList({
    attractions,
    onCreate,
    onUpdate,
    onDelete,
    onToggleVisited,
    onBulkUpdate,
  }: {
    attractions: { id: number; name: string }[]
    onCreate: (d: unknown) => Promise<void>
    onUpdate: (a: unknown) => Promise<void>
    onDelete: (id: number) => void
    onToggleVisited: (id: number) => void
    onBulkUpdate?: (a: unknown[]) => Promise<void>
  }) {
    return (
      <div data-testid="attractions-list">
        {attractions.map((a) => (
          <span key={a.id} data-testid={`attraction-${a.id}`}>
            {a.name}
            <button type="button" onClick={() => onDelete(a.id)} aria-label="Excluir atração">Excluir</button>
            <button type="button" onClick={() => onToggleVisited(a.id)} aria-label="Toggle visitado">Visitar</button>
          </span>
        ))}
        <button type="button" onClick={() => onCreate({ name: 'New', country: 'japan', city: 'Tokyo', day: 1, date: '2025-03-01', dayOfWeek: 'Mon', type: 'temple', order: 0, couplePrice: 0, currency: 'JPY', priceInBRL: 0, visited: false, needsReservation: false })}>trigger onCreate</button>
        <button type="button" onClick={() => attractions.length && onUpdate?.({ ...attractions[0], name: 'Updated' })}>trigger onUpdate</button>
        <button type="button" onClick={() => onBulkUpdate?.(attractions as unknown[])}>trigger onBulkUpdate</button>
      </div>
    )
  },
}))

vi.mock('@/components/attraction/ModalAttraction', () => ({
  ModalAttraction: function ModalAttraction({
    isOpen,
    onClose,
    onSave,
  }: {
    isOpen: boolean
    onClose: () => void
    onSave: (d: unknown) => void | Promise<void>
  }) {
    if (!isOpen) return null
    const payload = { name: 'New Attraction', country: 'japan', city: 'Tokyo', day: 1, date: '2025-03-01', dayOfWeek: 'Mon', type: 'temple', order: 0, couplePrice: 0, currency: 'JPY', priceInBRL: 0, visited: false, needsReservation: false }
    return (
      <div data-testid="modal-attraction" role="dialog">
        <button type="button" onClick={onClose}>Fechar</button>
        <button type="button" onClick={() => Promise.resolve(onSave(payload)).then(onClose)}>Salvar</button>
      </div>
    )
  },
}))

const mockUseAttraction = vi.mocked(useAttraction)
const mockUseToast = vi.mocked(useToast)
const mockUseCountry = vi.mocked(useCountry)

function makeAttraction(overrides: Partial<Attraction> = {}): Attraction {
  return {
    id: 1,
    name: 'Templo',
    country: 'japan' as Country,
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
  } as Attraction
}

describe('AttractionsPage', () => {
  const Wrapper = createPageWrapper()
  const mockSuccess = vi.fn()
  const mockError = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUseCountry.mockReturnValue({
      country: 'all',
      setCountry: vi.fn(),
      day: 'all',
      setDay: vi.fn(),
    })
    mockUseToast.mockReturnValue({
      success: mockSuccess,
      error: mockError,
      info: vi.fn(),
      warning: vi.fn(),
      clear: vi.fn(),
    })
    mockUseAttraction.mockReturnValue({
      attractions: [],
      isLoading: false,
      error: null,
      createAttraction: vi.fn().mockResolvedValue(undefined),
      updateAttraction: vi.fn().mockResolvedValue(undefined),
      deleteAttraction: vi.fn().mockResolvedValue(undefined),
      toggleVisited: vi.fn().mockResolvedValue(undefined),
      bulkUpdate: vi.fn().mockResolvedValue(undefined),
      citiesToPrefetch: [],
      availableDays: [],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
  })

  it('renders page header with title and subtitle', () => {
    render(<AttractionsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Atrações/i })).toBeInTheDocument()
    expect(screen.getByText(/Planeje seus pontos turísticos/i)).toBeInTheDocument()
  })

  it('renders reorder button', () => {
    render(<AttractionsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Reordenar/i })).toBeInTheDocument()
  })

  it('renders Fab to add attraction', () => {
    render(<AttractionsPage />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: /Adicionar/i })).toBeInTheDocument()
  })

  it('renders AttractionsList when loaded with attractions', async () => {
    mockUseAttraction.mockReturnValue({
      attractions: [makeAttraction({ name: 'Senso-ji' })],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<AttractionsPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/Senso-ji/i)).toBeInTheDocument()
    })
  })

  it('toggles reorder mode when reorder button is clicked', () => {
    render(<AttractionsPage />, { wrapper: Wrapper })
    const reorderBtn = screen.getByRole('button', { name: /Reordenar/i })
    fireEvent.click(reorderBtn)
    expect(screen.getByRole('button', { name: /Reordenação ativa/i })).toBeInTheDocument()
  })

  it('toggles reorder off when reorder button is clicked twice', () => {
    render(<AttractionsPage />, { wrapper: Wrapper })
    const reorderBtn = screen.getByRole('button', { name: /Reordenar/i })
    fireEvent.click(reorderBtn)
    fireEvent.click(screen.getByRole('button', { name: /Reordenação ativa/i }))
    expect(screen.getByRole('button', { name: /Reordenar/i })).toBeInTheDocument()
  })

  it('filters attractions by day when day is not all', async () => {
    mockUseCountry.mockReturnValue({
      country: 'japan',
      setCountry: vi.fn(),
      day: 1,
      setDay: vi.fn(),
    })
    mockUseAttraction.mockReturnValue({
      attractions: [
        makeAttraction({ id: 1, name: 'Atração Dia 1', day: 1 }),
        makeAttraction({ id: 2, name: 'Atração Dia 2', day: 2 }),
      ],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1, 2],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<AttractionsPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByTestId('attraction-1')).toHaveTextContent('Atração Dia 1')
    })
    expect(screen.queryByTestId('attraction-2')).not.toBeInTheDocument()
  })

  it('renders AttractionsList mock with trigger buttons', async () => {
    render(<AttractionsPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByTestId('attractions-list')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /trigger onCreate/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /trigger onUpdate/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /trigger onBulkUpdate/i })).toBeInTheDocument()
  })

  it('handleCreate success via modal shows toast and closes modal', async () => {
    const createAttraction = vi.fn().mockResolvedValue(makeAttraction({ id: 99 }))
    mockUseAttraction.mockReturnValue({
      attractions: [],
      isLoading: false,
      error: null,
      createAttraction,
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<AttractionsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('modal-attraction')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Salvar/i }))
    await waitFor(() => {
      expect(createAttraction).toHaveBeenCalled()
      expect(mockSuccess).toHaveBeenCalledWith('Atração criada com sucesso!')
    })
    await waitFor(() => {
      expect(screen.queryByTestId('modal-attraction')).not.toBeInTheDocument()
    })
  })

  it('handleCreate error shows error toast', async () => {
    mockUseAttraction.mockReturnValue({
      attractions: [],
      isLoading: false,
      error: null,
      createAttraction: vi.fn().mockRejectedValue(new Error('API error')),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<AttractionsPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger onCreate/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /trigger onCreate/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao criar atração')
    })
    errSpy.mockRestore()
  })

  it('handleUpdate success shows toast', async () => {
    const updateAttraction = vi.fn().mockResolvedValue(undefined)
    mockUseAttraction.mockReturnValue({
      attractions: [makeAttraction({ name: 'Senso-ji' })],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction,
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<AttractionsPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByText(/Senso-ji/i)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /trigger onUpdate/i }))
    await waitFor(() => {
      expect(updateAttraction).toHaveBeenCalled()
      expect(mockSuccess).toHaveBeenCalledWith('Atração atualizada com sucesso!')
    })
  })

  it('handleUpdate error shows error toast', async () => {
    mockUseAttraction.mockReturnValue({
      attractions: [makeAttraction({ name: 'A' })],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn().mockRejectedValue(new Error('API error')),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<AttractionsPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger onUpdate/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /trigger onUpdate/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao atualizar atração')
    })
    errSpy.mockRestore()
  })

  it('handleDelete success shows toast', async () => {
    const deleteAttraction = vi.fn().mockResolvedValue(undefined)
    mockUseAttraction.mockReturnValue({
      attractions: [makeAttraction({ name: 'Senso-ji' })],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction,
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<AttractionsPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Excluir atração/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Excluir atração/i }))
    await waitFor(() => {
      expect(deleteAttraction).toHaveBeenCalledWith(1)
      expect(mockSuccess).toHaveBeenCalledWith('Atração excluída com sucesso!')
    })
  })

  it('handleDelete error shows error toast', async () => {
    mockUseAttraction.mockReturnValue({
      attractions: [makeAttraction({ name: 'A' })],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn().mockRejectedValue(new Error('API error')),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<AttractionsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Excluir atração/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao excluir atração')
    })
    errSpy.mockRestore()
  })

  it('handleToggleVisited success shows toast', async () => {
    const toggleVisited = vi.fn().mockResolvedValue(undefined)
    mockUseAttraction.mockReturnValue({
      attractions: [makeAttraction({ name: 'Senso-ji' })],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited,
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<AttractionsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Toggle visitado/i }))
    await waitFor(() => {
      expect(toggleVisited).toHaveBeenCalledWith(1)
      expect(mockSuccess).toHaveBeenCalledWith('Status da atração atualizado')
    })
  })

  it('handleToggleVisited error shows error toast', async () => {
    mockUseAttraction.mockReturnValue({
      attractions: [makeAttraction({ name: 'A' })],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn().mockRejectedValue(new Error('API error')),
      bulkUpdate: vi.fn(),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<AttractionsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Toggle visitado/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao atualizar atração')
    })
    errSpy.mockRestore()
  })

  it('handleBulkUpdate success shows toast', async () => {
    const bulkUpdate = vi.fn().mockResolvedValue(undefined)
    const atts: Attraction[] = [makeAttraction({ order: 0 }), makeAttraction({ id: 2, order: 1 })]
    mockUseAttraction.mockReturnValue({
      attractions: atts,
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate,
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    render(<AttractionsPage />, { wrapper: Wrapper })
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /trigger onBulkUpdate/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /trigger onBulkUpdate/i }))
    await waitFor(() => {
      expect(bulkUpdate).toHaveBeenCalledWith(atts)
      expect(mockSuccess).toHaveBeenCalledWith('Atrações reordenadas com sucesso!')
    })
  })

  it('handleBulkUpdate error shows error toast', async () => {
    mockUseAttraction.mockReturnValue({
      attractions: [makeAttraction({ name: 'A' }), makeAttraction({ id: 2, name: 'B' })],
      isLoading: false,
      error: null,
      createAttraction: vi.fn(),
      updateAttraction: vi.fn(),
      deleteAttraction: vi.fn(),
      toggleVisited: vi.fn(),
      bulkUpdate: vi.fn().mockRejectedValue(new Error('API error')),
      citiesToPrefetch: [],
      availableDays: [1],
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
    })
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(<AttractionsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /trigger onBulkUpdate/i }))
    await waitFor(() => {
      expect(mockError).toHaveBeenCalledWith('Erro ao reordenar atrações')
    })
    errSpy.mockRestore()
  })

  it('modal onClose hides modal', async () => {
    render(<AttractionsPage />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: /Adicionar/i }))
    await waitFor(() => {
      expect(screen.getByTestId('modal-attraction')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /Fechar/i }))
    await waitFor(() => {
      expect(screen.queryByTestId('modal-attraction')).not.toBeInTheDocument()
    })
  })
})
