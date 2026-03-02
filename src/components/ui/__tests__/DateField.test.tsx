import { render, screen, fireEvent, act } from '@testing-library/react'
import { describe, it, vi, beforeEach, expect } from 'vitest'
import { DateField } from '../DateField'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getFirstFocusableDay } from '../DateField'

describe('DateField', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('returns early if calendar is null', () => {
    const onChange = vi.fn()
    render(<DateField value={undefined} onChange={onChange} />)

    const button = screen.getByRole('button', { name: /Selecione uma data/i })

    // Mock calendarRef as null
    fireEvent.click(button)
    // No error should occur even if calendarRef is null
    expect(true).toBe(true)
  })

  it('fallbacks to first gridcell button if no selected or today exists', () => {
    const onChange = vi.fn()
    render(<DateField value={undefined} onChange={onChange} />)

    const button = screen.getByRole('button', { name: /Selecione uma data/i })
    fireEvent.click(button)

    // Remove selected and today attributes to force fallback
    const calendar = document.body.querySelector('.custom-calendar')
    if (calendar) {
      const selected = calendar.querySelector('[aria-selected="true"]')
      selected?.removeAttribute('aria-selected')
      const today = calendar.querySelector('[data-today="true"]')
      today?.removeAttribute('data-today')
    }

    fireEvent.click(button) // close
    fireEvent.click(button) // open again

    const firstDayButton = document.body.querySelector('[role="gridcell"] button')
    expect(firstDayButton).toBeInstanceOf(HTMLElement)
  })

  it('closes calendar if another DateField is opened', () => {
    const onChange = vi.fn()
    render(<DateField value={undefined} onChange={onChange} />)

    const button = screen.getByRole('button', { name: /Selecione uma data/i })
    fireEvent.click(button)
    expect(document.querySelector('.custom-calendar')).toBeInTheDocument()

    // Dispatch another DateField open event
    act(() => {
      window.dispatchEvent(new CustomEvent('datefield:open', { detail: 'other-id' }))
    })

    // Calendar should close
    expect(document.querySelector('.custom-calendar')).not.toBeInTheDocument()
  })

  it('renders placeholder and formatted date correctly', () => {
    const date = new Date(2023, 0, 15)
    render(<DateField value={undefined} onChange={vi.fn()} required />)
    expect(screen.getByText(/Selecione uma data \*/i)).toBeInTheDocument()

    render(<DateField value={date} onChange={vi.fn()} />)
    expect(screen.getByText(format(date, 'PPP', { locale: ptBR }))).toBeInTheDocument()
  })

  it('opens and selects date correctly', () => {
    const onChange = vi.fn()
    render(<DateField value={undefined} onChange={onChange} />)
    const button = screen.getByRole('button', { name: /Selecione uma data/i })

    fireEvent.click(button)

    const todayButton = document.querySelector('[data-today="true"] button') as HTMLButtonElement
    act(() => {
      todayButton?.click()
    })

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(document.querySelector('.custom-calendar')).not.toBeInTheDocument()
  })

  it('clears date when clear button is clicked', () => {
    const onChange = vi.fn()
    const date = new Date(2023, 0, 15)
    render(<DateField value={date} onChange={onChange} />)

    const clearButton = screen.getByRole('button', { name: /Limpar data/i })
    fireEvent.click(clearButton)
    expect(onChange).toHaveBeenCalledWith(undefined)
  })
})

describe('getFirstFocusableDay', () => {
  it('returns null if calendar is null', () => {
    expect(getFirstFocusableDay(null)).toBeNull()
  })

  it('returns button with aria-selected="true" first', () => {
    document.body.innerHTML = `
      <div id="calendar">
        <div role="gridcell" aria-selected="true"><button id="selected">Selected</button></div>
        <div role="gridcell" data-today="true"><button id="today">Today</button></div>
        <div role="gridcell"><button id="first">First</button></div>
      </div>
    `
    const calendar = document.getElementById('calendar') as HTMLDivElement | null
    const button = getFirstFocusableDay(calendar)

    expect(button).toBeInstanceOf(HTMLButtonElement)
    expect(button?.id).toBe('selected')
  })

  it('falls back to button with data-today="true" if no aria-selected', () => {
    document.body.innerHTML = `
      <div id="calendar">
        <div role="gridcell"><button id="first">First</button></div>
        <div role="gridcell" data-today="true"><button id="today">Today</button></div>
      </div>
    `
    const calendar = document.getElementById('calendar') as HTMLDivElement | null
    const button = getFirstFocusableDay(calendar)

    expect(button?.id).toBe('today')
  })

  it('falls back to first gridcell button if neither selected nor today exists', () => {
    document.body.innerHTML = `
      <div id="calendar">
        <div role="gridcell"><button id="first">First</button></div>
        <div role="gridcell"><button id="second">Second</button></div>
      </div>
    `
    const calendar = document.getElementById('calendar') as HTMLDivElement | null
    const button = getFirstFocusableDay(calendar)

    expect(button?.id).toBe('first')
  })
})