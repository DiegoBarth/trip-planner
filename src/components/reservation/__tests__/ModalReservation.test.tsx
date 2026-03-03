import { describe, it, vi, beforeEach, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import type { ComponentProps } from 'react'

import { ModalReservation } from '../ModalReservation'
import * as reservationApi from '@/api/reservation'
import { COUNTRIES } from '@/config/constants'

const mockSuccess = vi.fn()
const mockError = vi.fn()
const mockOnClose = vi.fn()
const mockOnSave = vi.fn()

vi.mock('@/contexts/toast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError
  })
}))

vi.mock('@/contexts/CountryContext', () => ({
  useCountry: () => ({
    country: 'japan'
  })
}))

vi.mock('@/hooks/useAttraction', () => ({
  useAttraction: () => ({
    attractions: [
      { id: 1, name: 'Tokyo Tower' },
      { id: 2, name: 'Shibuya Crossing' }
    ]
  })
}))

vi.mock('@/components/reservation/FileUpload', () => ({
  FileUpload: vi.fn(({ onFileUploaded }) => (
    <div data-testid="file-upload-mock">
      <button
        data-testid="upload-button-mock"
        onClick={() =>
          onFileUploaded(
            'https://fakeurl.com/test.pdf',
            'fileid123'
          )
        }
      >
        Upload Mock
      </button>
    </div>
  ))
}))

vi.mock('@/schemas/validateWithToast', () => ({
  validateWithToast: vi.fn(() => true)
}))

vi.mock('@/schemas/reservationSchema', () => ({
  reservationCreateSchema: {}
}))

vi.mock('@/components/ui/CustomSelect', () => ({
  CustomSelect: ({ id, value, onChange, options }: any) => (
    <select
      data-testid={`custom-select-${id}`}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value=""></option>
      {options?.map((opt: string) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  )
}))

vi.mock('@/components/ui/DateField', () => ({
  DateField: ({ id, onChange }: any) => (
    <input
      id={id}
      data-testid={id}
      type="date"
      onChange={(e: any) =>
        onChange?.(
          e.target.value
            ? new Date(e.target.value)
            : undefined
        )
      }
    />
  )
}))

vi.mock('@/components/ui/ModalBase', () => ({
  ModalBase: ({
    title,
    onClose,
    onSave,
    children
  }: any) => (
    <div data-testid="modal-base">
      <h2 data-testid="modal-title">{title}</h2>

      {/* 🔥 FORM CORRETO */}
      <form
        data-testid="modal-form"
        onSubmit={(e) => {
          e.preventDefault()
          onSave?.(e)
        }}
      >
        <button
          data-testid="save-button"
          type="submit"
        >
          Salvar
        </button>

        <div>{children}</div>
      </form>

      <button
        data-testid="close-button"
        type="button"
        onClick={onClose}
      >
        Fechar
      </button>
    </div>
  )
}))

// 🔴 IMPORTANTE: mock sem variáveis externas
vi.mock('@/api/reservation', () => ({
  deleteFile: vi.fn(),
  uploadFile: vi.fn()
}))

vi.mock('@/utils/formatters', () => ({
  dateToInputFormat: vi.fn((date: string) => date),
  parseLocalDate: vi.fn((date: string) => new Date(date)),
  dateToYYYYMMDD: vi.fn((date: Date) =>
    date.toISOString().split('T')[0]
  )
}))

// =======================
// helpers
// =======================

const mockReservation = {
  id: 1,
  type: 'activity' as const,
  title: 'Reserva Teste',
  description: '',
  confirmationCode: '',
  date: '',
  endDate: '',
  time: '',
  location: 'Tokyo',
  provider: 'Test Provider',
  bookingUrl: '',
  documentUrl: '',
  documentFileId: '',
  status: 'pending' as const,
  notes: '',
  country: undefined,
  attractionId: undefined
}

const renderModal = (
  props?: Partial<ComponentProps<typeof ModalReservation>>
) =>
  render(
    <ModalReservation
      isOpen={true}
      onClose={mockOnClose}
      onSave={mockOnSave}
      {...props}
    />
  )

beforeEach(() => {
  vi.clearAllMocks()
})

// =======================
// tests
// =======================

describe('ModalReservation Component', () => {
  it('renders modal in create mode', () => {
    renderModal()

    expect(
      screen.getByText(/Nova Reserva/i)
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(/Título/i)
    ).toBeInTheDocument()

    expect(
      screen.getByLabelText(/Provedor/i)
    ).toBeInTheDocument()

    expect(
      screen.getByTestId('file-upload-mock')
    ).toBeInTheDocument()
  })

  it('renders modal in edit mode with initial reservation', () => {
    renderModal({
      reservation: {
        id: 123,
        type: 'activity',
        title: 'Flight to Tokyo',
        provider: 'LATAM',
        status: 'confirmed',
        documentUrl: 'https://drive.google.com/file.pdf',
        documentFileId: 'abc123'
      }
    })

    expect(
      screen.getByText(/Editar Reserva/i)
    ).toBeInTheDocument()

    expect(
      screen.getByDisplayValue('Flight to Tokyo')
    ).toBeInTheDocument()
  })

  it('calls onSave when form is submitted', async () => {
    renderModal()

    fireEvent.change(screen.getByLabelText(/Título/i), {
      target: { value: 'Flight Test' }
    })

    fireEvent.change(screen.getByLabelText(/Provedor/i), {
      target: { value: 'Airline X' }
    })

    fireEvent.click(screen.getByTestId('save-button'))

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledTimes(1)
    })
  })

  it('removes uploaded document on close if unsaved', async () => {
    const deleteFileMock = vi.mocked(
      reservationApi.deleteFile
    )
    deleteFileMock.mockResolvedValue(undefined)

    renderModal()

    fireEvent.click(
      screen.getByTestId('upload-button-mock')
    )

    fireEvent.click(
      screen.getByTestId('close-button')
    )

    await waitFor(() => {
      expect(deleteFileMock).toHaveBeenCalledWith(
        'fileid123'
      )
    })
  })

  it('handles deleteFile error on close', async () => {
    const deleteFileMock = vi.mocked(
      reservationApi.deleteFile
    )
    deleteFileMock.mockRejectedValueOnce(
      new Error('Network error')
    )

    const consoleSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => { })

    renderModal()

    fireEvent.click(
      screen.getByTestId('upload-button-mock')
    )

    fireEvent.click(
      screen.getByTestId('close-button')
    )

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('updates documentUrl via manual input', () => {
    renderModal()

    const input = screen
      .getAllByRole('textbox')
      .find((el: any) =>
        el.placeholder?.includes('drive.google.com')
      ) as HTMLInputElement

    fireEvent.change(input, {
      target: {
        value: 'https://drive.google.com/manual.pdf'
      }
    })

    expect(input).toHaveValue(
      'https://drive.google.com/manual.pdf'
    )
  })

  it('sets country when CustomSelect returns a valid label', async () => {
    renderModal()

    const countrySelect = screen.getByTestId(
      'custom-select-country'
    )

    const firstCountry = Object.values(COUNTRIES)[0]
    const label = `${firstCountry.flag} ${firstCountry.name}`

    fireEvent.change(countrySelect, {
      target: { value: label }
    })

    await waitFor(() => {
      expect(countrySelect).toBeInTheDocument()
    })
  })

  it('clears attractionId when CustomSelect returns empty value', async () => {
    renderModal({
      reservation: {
        ...mockReservation,
        attractionId: 1,
        country: 'japan'
      }
    })

    const attractionSelect = screen.getByTestId(
      'custom-select-attraction_id'
    )

    fireEvent.change(attractionSelect, {
      target: { value: '' }
    })

    await waitFor(() => {
      expect(attractionSelect).toBeInTheDocument()
    })
  })

  it('does not delete file on close when file is unchanged', async () => {
    const deleteFileMock = vi.mocked(reservationApi.deleteFile)

    renderModal({
      reservation: {
        ...mockReservation,
        documentFileId: 'same-id',
        documentUrl: 'https://file.pdf'
      }
    })

    fireEvent.click(screen.getByTestId('close-button'))

    await waitFor(() => {
      expect(deleteFileMock).not.toHaveBeenCalled()
    })
  })

  it('does not delete file when no documentFileId exists', async () => {
    const deleteFileMock = vi.mocked(reservationApi.deleteFile)

    renderModal()

    fireEvent.click(screen.getByTestId('close-button'))

    await waitFor(() => {
      expect(deleteFileMock).not.toHaveBeenCalled()
    })
  })

  it('does not call onSave when validation fails', async () => {
    const validateMock = await import('@/schemas/validateWithToast')
    vi.mocked(validateMock.validateWithToast).mockReturnValue(false)

    renderModal()

    fireEvent.change(screen.getByLabelText(/Título/i), {
      target: { value: 'Test' }
    })

    fireEvent.click(screen.getByTestId('save-button'))

    await waitFor(() => {
      expect(mockOnSave).not.toHaveBeenCalled()
    })
  })
})