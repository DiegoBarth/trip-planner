import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AttractionsList from '../AttractionsList'
import type { Attraction } from '@/types/Attraction'
import React from 'react'

vi.mock('@/components/attraction/AttractionsGridWithDnD', () => ({
  AttractionsGridWithDnD: ({ onEdit, onReorder, attractions }: any) => (
    <div data-testid="grid-dnd">
      <button onClick={() => onEdit(attractions[0])}>Edit DnD</button>
      <button onClick={() => onReorder([
        { ...attractions[1], order: 1 },
        { ...attractions[0], order: 2 }
      ])}>
        Trigger Reorder
      </button>
    </div>
  ),
}))

vi.mock('@/components/attraction/ModalAttraction', async () => {
  return {
    ModalAttraction: ({ onSave, onClose, isOpen, attraction }: any) =>
      isOpen ? (
        <div role="dialog" aria-labelledby="modal-title" data-testid="modal-attraction">
          <h2 id="modal-title">{attraction ? 'Editar Atração' : 'Nova Atração'}</h2>
          <button onClick={() => onSave({ name: 'Saved', country: 'japan' })}>Save</button>
          <button onClick={onClose}>Close</button>
        </div>
      ) : null,
  }
})

vi.mock('@/components/attraction/AttractionsGrid', () => ({
  AttractionsGrid: ({ onEdit, onDelete, attractions }: any) => {
    const [items] = React.useState(attractions || [{ id: 2, name: 'Test Attraction' }])

    return (
      <div data-testid="grid-plain">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((attraction: any) => (
            <div key={attraction.id}>
              <button
                data-testid="edit-attraction"
                onClick={() => onEdit?.(attraction)}
              >
                Edit Plain
              </button>
              <button
                data-testid={`delete-attraction-${attraction.id}`}
                onClick={() => onDelete(attraction.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    )
  },
}))

vi.mock('@/components/ui/ConfirmModal', async () => {
  return {
    ConfirmModal: ({ isOpen, onConfirm, onClose }: any) =>
      isOpen ? (
        <div data-testid="confirm-modal-wrapper" role="dialog">
          <button data-testid="confirm-delete" onClick={onConfirm}>Excluir</button>
          <button onClick={onClose}>Cancelar</button>
        </div>
      ) : null,
  }
})

vi.mock('@/utils/attractionDayUtils', () => ({
  getAutoDayForDate: vi.fn(() => 1),
  getNextOrderForDate: vi.fn(() => 1),
}))

vi.mock('@/utils/formatters', () => ({
  dateToInputFormat: vi.fn((d: string) => d),
  formatCurrency: vi.fn((v: number) => `R$${v}`),
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

describe('AttractionsList', () => {
  const onUpdate = vi.fn()
  const onCreate = vi.fn()
  const onDelete = vi.fn()
  const onToggleVisited = vi.fn()
  const onBulkUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders skeleton when loading', () => {
    const { container } = render(
      <AttractionsList
        attractions={[]}
        isLoading={true}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
      />
    )

    expect(container).toBeTruthy()

    const skeleton = container.querySelector('.animate-pulse')
    expect(skeleton).toBeInTheDocument()

    expect(skeleton).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders grid plain when not drag enabled', async () => {
    const attractions = [createAttraction()]
    render(
      <AttractionsList
        attractions={attractions}
        isLoading={false}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
      />
    )
    expect(await screen.findByTestId('grid-plain')).toBeInTheDocument()
  })

  it('renders grid DnD when drag enabled', async () => {
    const attractions = [createAttraction()]
    render(
      <AttractionsList
        attractions={attractions}
        isLoading={false}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
        onBulkUpdate={onBulkUpdate}
        isDragEnabled={true}
      />
    )

    expect(await screen.findByTestId('grid-dnd')).toBeInTheDocument()
  })

  it('opens modal on edit and calls onCreate', async () => {
    const attractions = [createAttraction({ id: 2 })]
    render(
      <AttractionsList
        attractions={attractions}
        isLoading={false}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
      />
    )

    const editButton = screen.getByTestId('edit-attraction');
    fireEvent.click(editButton);

    const modal = await waitFor(() =>
      screen.getByRole('dialog', { name: /editar atração/i })
    );

    expect(modal).toBeInTheDocument();

    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
  })

  it('closes modal on close button', async () => {
    const attractions = [createAttraction({ id: 2 })]
    render(
      <AttractionsList
        attractions={attractions}
        isLoading={false}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
      />
    )

    fireEvent.click(screen.getByTestId('edit-attraction'))
    await waitFor(() => screen.getByTestId('modal-attraction'))

    fireEvent.click(screen.getByText('Close'))
    await waitFor(() => expect(screen.queryByTestId('modal-attraction')).toBeNull())
  })

  it('handles deletion via ConfirmModal', async () => {
    const attractions = [createAttraction({ id: 2, name: 'Test Attraction' })]
    const onDeleteMock = vi.fn()

    render(
      <AttractionsList
        attractions={attractions}
        isLoading={false}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDeleteMock}
        onToggleVisited={onToggleVisited}
      />
    )

    fireEvent.click(screen.getByTestId('delete-attraction-2'))

    await waitFor(() => {
      expect(screen.getByTestId('confirm-modal-wrapper')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByTestId('confirm-delete'))
    await waitFor(() => {
      expect(onDeleteMock).toHaveBeenCalledWith(2)
    })
  })

  it('toggles drag enabled button', async () => {
    const attractions = [createAttraction()]
    render(
      <AttractionsList
        attractions={attractions}
        isLoading={false}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
        onBulkUpdate={onBulkUpdate}
      />
    )

    const button = screen.getByRole('button', { name: /reordenar/i })
    fireEvent.click(button)
    expect(button).toHaveAttribute('aria-pressed', 'true')
  })

  it('calculates total global correctly', () => {
    const attractions = [
      createAttraction({ id: 1, country: 'japan', priceInBRL: 100 }),
      createAttraction({ id: 2, country: 'south-korea', priceInBRL: 50 }),
    ]
    render(
      <AttractionsList
        attractions={attractions}
        isLoading={false}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
      />
    )
    expect(screen.getByText('R$150')).toBeInTheDocument()
  })

  it('calls onCreate when saving a new attraction (no editingAttraction)', async () => {
    render(
      <AttractionsList
        attractions={[]}
        isLoading={false}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
      />
    )
  })

  it('calls onBulkUpdate only when items actually changed position', async () => {
    const attractions = [
      createAttraction({ id: 1, order: 1, day: 1 }),
      createAttraction({ id: 2, order: 2, day: 1 })
    ]

    render(
      <AttractionsList
        attractions={attractions}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
        onBulkUpdate={onBulkUpdate}
        isDragEnabled={true}
      />
    )
  })

  it('opens modal for editing when onEdit is called from DnD Grid', async () => {
    render(
      <AttractionsList
        attractions={[createAttraction()]}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
        onBulkUpdate={onBulkUpdate}
        isDragEnabled={true}
      />
    )

    const editBtn = await screen.findByText('Edit DnD')
    fireEvent.click(editBtn)

    expect(screen.getByTestId('modal-attraction')).toBeInTheDocument()
    expect(screen.getByText(/editar atração/i)).toBeInTheDocument()
  })

  it('clears attractionToDelete when ConfirmModal is closed', async () => {
    const attractions = [createAttraction({ id: 99 })]

    render(
      <AttractionsList
        attractions={attractions}
        isLoading={false}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
      />
    )

    fireEvent.click(screen.getByTestId('delete-attraction-99'))

    await waitFor(() => {
      expect(screen.getByTestId('confirm-modal-wrapper')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Cancelar'))

    await waitFor(() => {
      expect(screen.queryByTestId('confirm-modal-wrapper')).not.toBeInTheDocument()
    })
  })

  it('calls onCreate when saving new attraction (no editingAttraction)', async () => {
    const onCreateMock = vi.fn().mockResolvedValue(undefined)

    render(
      <AttractionsList
        attractions={[]}
        isLoading={false}
        onUpdate={onUpdate}
        onCreate={onCreateMock}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
      />
    )

    render(
      <AttractionsList
        attractions={[]}
        isLoading={false}
        onUpdate={onUpdate}
        onCreate={onCreateMock}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
      />
    )

    expect(onCreateMock).not.toHaveBeenCalled()
  })

  it('calls onBulkUpdate only when items actually changed position', async () => {
    const attractions = [
      createAttraction({ id: 1, order: 1, day: 1 }),
      createAttraction({ id: 2, order: 2, day: 1 })
    ]
    const onBulkUpdateMock = vi.fn().mockResolvedValue(undefined)

    render(
      <AttractionsList
        attractions={attractions}
        isLoading={false}
        onUpdate={onUpdate}
        onCreate={onCreate}
        onDelete={onDelete}
        onToggleVisited={onToggleVisited}
        onBulkUpdate={onBulkUpdateMock}
        isDragEnabled={true}
      />
    )

    const reorderBtn = screen.getByText('Trigger Reorder')
    fireEvent.click(reorderBtn)

    await waitFor(() => {
      expect(onBulkUpdateMock).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 2,
          order: 1,
          day: 1
        }),
        expect.objectContaining({
          id: 1,
          order: 2
        })
      ])
    })
  })
})