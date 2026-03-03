import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FileUpload } from '../FileUpload'
import { uploadFile, deleteFile } from '@/api/reservation'

vi.mock('@/api/reservation', () => ({
  uploadFile: vi.fn(),
  deleteFile: vi.fn(),
}))

describe('FileUpload Component', () => {
  const mockOnFileUploaded = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the upload label and default text', () => {
    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    expect(screen.getByText('Documento')).toBeInTheDocument()
    expect(screen.getByText(/Clique para anexar arquivo/i)).toBeInTheDocument()
  })

  it('uploads file successfully and calls onFileUploaded', async () => {
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' })

    vi.mocked(uploadFile).mockResolvedValue({
      success: true,
      fileUrl: 'https://fakeurl.com/test.pdf',
      fileId: '123',
    })

    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)

    const input = screen.getByTestId('file-upload-input') as HTMLInputElement

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalledWith('test.pdf', expect.any(String), 'application/pdf')
      expect(mockOnFileUploaded).toHaveBeenCalledWith('https://fakeurl.com/test.pdf', '123')
      expect(screen.queryByText(/Fazendo upload/i)).not.toBeInTheDocument()
    })
  })

  it('shows error for unsupported file types', async () => {
    const file = new File(['dummy'], 'test.txt', { type: 'text/plain' })

    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)

    const input = screen.getByTestId('file-upload-input') as HTMLInputElement

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    await waitFor(() => {
      expect(screen.getByText(/Tipo de arquivo não suportado/i)).toBeInTheDocument()
      expect(uploadFile).not.toHaveBeenCalled()
    })
  })

  it('shows error if file exceeds max size', async () => {
    const file = new File([new ArrayBuffer(11 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' })

    render(<FileUpload onFileUploaded={mockOnFileUploaded} maxSizeMB={10} />)

    const input = screen.getByTestId('file-upload-input') as HTMLInputElement

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    await waitFor(() => {
      expect(screen.getByText(/Arquivo muito grande/i)).toBeInTheDocument()
      expect(uploadFile).not.toHaveBeenCalled()
    })
  })

  it('displays uploading spinner while uploading', async () => {
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' })

    vi.mocked(uploadFile).mockImplementation(
      () => new Promise((res) => setTimeout(() => res({ success: true, fileUrl: 'url', fileId: '1' }), 50))
    )

    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    const input = screen.getByTestId('file-upload-input') as HTMLInputElement

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
      expect(screen.getByText(/Fazendo upload/i)).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(mockOnFileUploaded).toHaveBeenCalled()
      expect(screen.queryByText(/Fazendo upload/i)).not.toBeInTheDocument()
    })
  })

  it('displays error when uploadFile rejects', async () => {
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' })

    vi.mocked(uploadFile).mockRejectedValue(new Error('Upload failed'))

    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    const input = screen.getByTestId('file-upload-input') as HTMLInputElement

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    await waitFor(() => {
      expect(screen.getByText(/Erro ao fazer upload do arquivo/i)).toBeInTheDocument()
      expect(mockOnFileUploaded).not.toHaveBeenCalled()
    })

    consoleErrorSpy.mockRestore();
  })

  it('renders uploaded file and allows removal', async () => {
    const fileUrl = 'https://fakeurl.com/test.pdf'

    render(
      <FileUpload
        onFileUploaded={mockOnFileUploaded}
        currentFile={fileUrl}
        currentFileId="123"
      />
    )

    expect(screen.getByText(/Documento no Google Drive|test.pdf/i)).toBeInTheDocument()

    const removeBtn = screen.getByRole('button', { name: /Remover arquivo/i })
    expect(removeBtn).toBeInTheDocument()

    vi.mocked(deleteFile).mockResolvedValueOnce()

    await act(async () => {
      fireEvent.click(removeBtn)
    })

    await waitFor(() => {
      expect(deleteFile).toHaveBeenCalledWith('123')
      expect(mockOnFileUploaded).toHaveBeenCalledWith('', '')
    })
  })

  it('calls onFileUploaded even if deleteFile fails', async () => {
    const fileUrl = 'https://fakeurl.com/test.pdf'

    render(<FileUpload onFileUploaded={mockOnFileUploaded} currentFile={fileUrl} currentFileId="123" />)

    const removeBtn = screen.getByRole('button', { name: /Remover arquivo/i })

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    vi.mocked(deleteFile).mockRejectedValue(new Error('Delete failed'))

    await act(async () => {
      fireEvent.click(removeBtn)
    })

    await waitFor(() => {
      expect(deleteFile).toHaveBeenCalledWith('123')
      expect(mockOnFileUploaded).toHaveBeenCalledWith('', '')
    })

    consoleErrorSpy.mockRestore();
  })

  it('shows "Documento no Google Drive" for Google Drive URLs', () => {
    render(
      <FileUpload
        onFileUploaded={mockOnFileUploaded}
        currentFile="https://drive.google.com/file/d/123/view"
      />
    )
    expect(screen.getByText('Documento no Google Drive')).toBeInTheDocument()
  })

  it('shows "Documento anexado" for malformed URLs', () => {
    render(
      <FileUpload
        onFileUploaded={mockOnFileUploaded}
        currentFile="invalid-url"
      />
    )
    expect(screen.getByText('Documento anexado')).toBeInTheDocument()
  })

  it('handles unsuccessful upload response', async () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    vi.mocked(uploadFile).mockResolvedValue({ success: false, message: 'Server error' })

    render(<FileUpload onFileUploaded={mockOnFileUploaded} />)
    const input = screen.getByTestId('file-upload-input') as HTMLInputElement

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    await act(async () => {
      fireEvent.change(input, { target: { files: [file] } })
    })

    await waitFor(() => {
      expect(screen.getByText(/Erro ao fazer upload do arquivo/i)).toBeInTheDocument()
    })

    consoleErrorSpy.mockRestore();
  })

  afterAll(() => {
    vi.restoreAllMocks()
  })
})