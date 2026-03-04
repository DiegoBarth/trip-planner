import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { ChecklistCard } from '../ChecklistCard'
import type { ChecklistItem } from '@/types/ChecklistItem'

vi.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

const baseItem: ChecklistItem = {
  id: 1,
  description: 'Passaporte',
  category: 'documents',
  isPacked: false,
}

describe('ChecklistCard', () => {
  it('renders item description and category label', () => {
    render(
      <ChecklistCard
        item={baseItem}
        onTogglePacked={vi.fn()}
      />
    )

    expect(screen.getByText('Passaporte')).toBeInTheDocument()
    expect(screen.getByText('Documentos')).toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const onClick = vi.fn()

    render(
      <ChecklistCard
        item={baseItem}
        onClick={onClick}
        onTogglePacked={vi.fn()}
      />
    )

    fireEvent.click(screen.getByText('Passaporte'))
    expect(onClick).toHaveBeenCalledWith(baseItem)
  })

  it('calls onClick when pressing Enter key', () => {
    const onClick = vi.fn()

    render(
      <ChecklistCard
        item={baseItem}
        onClick={onClick}
        onTogglePacked={vi.fn()}
      />
    )

    const title = screen.getByText('Passaporte')
    const card = title.closest('[role="button"]') as HTMLElement

    fireEvent.keyDown(card, { key: 'Enter' })

    expect(onClick).toHaveBeenCalledWith(baseItem)
  })

  it('toggles packed state when checkbox button is clicked', () => {
    const onTogglePacked = vi.fn()

    render(
      <ChecklistCard
        item={baseItem}
        onTogglePacked={onTogglePacked}
      />
    )

    const toggleBtn = screen.getByRole('button', {
      name: /marcar como empacotado/i,
    })

    fireEvent.click(toggleBtn)

    expect(onTogglePacked).toHaveBeenCalledWith(1, true)
  })

  it('shows packed badge when item is packed', () => {
    const packedItem: ChecklistItem = {
      ...baseItem,
      isPacked: true,
    }

    render(
      <ChecklistCard
        item={packedItem}
        onTogglePacked={vi.fn()}
      />
    )

    expect(screen.getByText(/empacotado/i)).toBeInTheDocument()
  })

  it('renders quantity when greater than 1', () => {
    const item: ChecklistItem = {
      ...baseItem,
      quantity: 3,
    }

    render(
      <ChecklistCard
        item={item}
        onTogglePacked={vi.fn()}
      />
    )

    expect(screen.getByText(/quantidade: 3/i)).toBeInTheDocument()
  })

  it('renders notes when provided', () => {
    const item: ChecklistItem = {
      ...baseItem,
      notes: 'Levar na bagagem de mão',
    }

    render(
      <ChecklistCard
        item={item}
        onTogglePacked={vi.fn()}
      />
    )

    expect(screen.getByText('Levar na bagagem de mão')).toBeInTheDocument()
  })

  it('does not call card onClick when toggle button is clicked (stopPropagation)', () => {
    const onClick = vi.fn()
    const onTogglePacked = vi.fn()

    render(
      <ChecklistCard
        item={baseItem}
        onClick={onClick}
        onTogglePacked={onTogglePacked}
      />
    )

    const toggleBtn = screen.getByRole('button', {
      name: /marcar como empacotado/i,
    })

    fireEvent.click(toggleBtn)

    expect(onTogglePacked).toHaveBeenCalled()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('logs error when onTogglePacked throws', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => { })

    const onTogglePacked = vi.fn(() => {
      throw new Error('toggle failed')
    })

    render(
      <ChecklistCard
        item={baseItem}
        onTogglePacked={onTogglePacked}
      />
    )

    const toggleButton = screen.getByRole('button', {
      name: /marcar como empacotado/i,
    })

    fireEvent.click(toggleButton)

    expect(onTogglePacked).toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledWith(
      'Error toggling item:',
      expect.any(Error)
    )

    errorSpy.mockRestore()
  })
})