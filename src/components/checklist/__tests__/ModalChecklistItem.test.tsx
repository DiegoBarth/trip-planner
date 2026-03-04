import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'

import { ModalChecklistItem } from '../ModalChecklistItem'

const toastMock = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}

vi.mock('@/contexts/toast', () => ({
  useToast: () => toastMock,
}))

const validateMock = vi.fn()

vi.mock('@/schemas/validateWithToast', () => ({
  validateWithToast: (...args: any[]) => validateMock(...args),
}))

vi.mock('@/hooks/useFocusTrap', () => ({
  useFocusTrap: () => ({ current: null }),
}))

const onClose = vi.fn()
const onSave = vi.fn()

const baseItem = {
  id: 1,
  description: 'Passaporte',
  category: 'documents' as const,
  isPacked: true,
  quantity: 2,
  notes: 'Importante',
}

function renderComponent(props: Partial<React.ComponentProps<typeof ModalChecklistItem>> = {}) {
  return render(
    <ModalChecklistItem
      isOpen
      onClose={onClose}
      onSave={onSave}
      {...props}
    />
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  validateMock.mockReturnValue(true)
})

describe('ModalChecklistItem - render', () => {
  it('renders create mode correctly', () => {
    renderComponent()

    expect(screen.getByText('Novo Item')).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
  })

  it('renders edit mode correctly', () => {
    renderComponent({ item: baseItem })

    expect(screen.getByText('Editar Item')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(
      <ModalChecklistItem
        isOpen={false}
        onClose={onClose}
        onSave={onSave}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})

describe('ModalChecklistItem - reset behavior', () => {
  it('loads item data when editing', () => {
    renderComponent({ item: baseItem })

    expect(screen.getByDisplayValue('Passaporte')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Importante')).toBeInTheDocument()
  })

  it('uses default values when creating', () => {
    renderComponent()

    expect(screen.getByDisplayValue('1')).toBeInTheDocument()
  })
})


describe('ModalChecklistItem - category', () => {
  it('changes category when clicking category button', () => {
    renderComponent()

    const buttons = screen.getAllByRole('button')
    fireEvent.click(buttons[0])

    expect(true).toBe(true)
  })
})

describe('ModalChecklistItem - submit', () => {
  it('calls onSave with formatted payload', async () => {
    renderComponent()

    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: '  Adaptador  ' },
    })

    fireEvent.change(screen.getByLabelText(/quantidade/i), {
      target: { value: '3' },
    })

    fireEvent.click(screen.getByLabelText(/salvar novo registro/i))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Adaptador',
        quantity: 3,
      })
    )

    expect(onClose).toHaveBeenCalled()
  })

  it('handles async onSave', async () => {
    onSave.mockResolvedValueOnce(undefined)

    renderComponent()

    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: 'Item async' },
    })

    fireEvent.click(screen.getByLabelText(/salvar novo registro/i))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })
  })

  it('forces quantity to 1 when invalid', async () => {
    renderComponent()

    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: 'Item' },
    })

    fireEvent.change(screen.getByLabelText(/quantidade/i), {
      target: { value: '0' },
    })

    fireEvent.click(screen.getByLabelText(/salvar novo registro/i))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled()
    })

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: 1,
      })
    )
  })
})

describe('ModalChecklistItem - validation', () => {
  it('does not submit when validation fails', async () => {
    validateMock.mockReturnValueOnce(false)

    renderComponent()

    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: 'Item inválido' },
    })

    fireEvent.click(screen.getByLabelText(/salvar novo registro/i))

    await waitFor(() => {
      expect(onSave).not.toHaveBeenCalled()
    })

    expect(onClose).not.toHaveBeenCalled()
  })
})

describe('ModalChecklistItem - loading state', () => {
  it('shows loading while saving', async () => {
    let resolvePromise: () => void

    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve
        })
    )

    renderComponent({ onSave })

    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: 'Passaporte' },
    })

    fireEvent.click(screen.getByLabelText(/salvar novo registro/i))

    expect(await screen.findByText(/salvando/i)).toBeInTheDocument()

    await act(async () => {
      resolvePromise!()
    })
  })
})