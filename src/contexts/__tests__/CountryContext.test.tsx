import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CountryProvider, useCountry } from '../CountryContext'

function Consumer() {
  const { country, day, setCountry } = useCountry()
  return (
    <div>
      <span data-testid="country">{String(country)}</span>
      <span data-testid="day">{String(day)}</span>
      <button type="button" onClick={() => setCountry('south-korea')}>
        Trocar país
      </button>
    </div>
  )
}

const TRIP_FILTER_KEY = 'trip_filter'

describe('CountryContext', () => {
  beforeEach(() => {
    sessionStorage.removeItem(TRIP_FILTER_KEY)
  })

  it('initial state is all/all when sessionStorage is empty', () => {
    render(
      <CountryProvider>
        <Consumer />
      </CountryProvider>
    )

    expect(screen.getByTestId('country')).toHaveTextContent('all')
    expect(screen.getByTestId('day')).toHaveTextContent('all')
  })

  it('initial state comes from sessionStorage and day is preserved on mount', () => {
    sessionStorage.setItem(
      TRIP_FILTER_KEY,
      JSON.stringify({ country: 'japan', day: 2 })
    )

    render(
      <CountryProvider>
        <Consumer />
      </CountryProvider>
    )

    expect(screen.getByTestId('country')).toHaveTextContent('japan')
    expect(screen.getByTestId('day')).toHaveTextContent('2')
  })

  it('resets day to all when country changes', () => {
    sessionStorage.setItem(
      TRIP_FILTER_KEY,
      JSON.stringify({ country: 'japan', day: 2 })
    )

    render(
      <CountryProvider>
        <Consumer />
      </CountryProvider>
    )

    expect(screen.getByTestId('day')).toHaveTextContent('2')

    fireEvent.click(screen.getByRole('button', { name: /trocar país/i }))

    expect(screen.getByTestId('country')).toHaveTextContent('south-korea')
    expect(screen.getByTestId('day')).toHaveTextContent('all')
  })

  it('persists country and day to sessionStorage when state changes', () => {
    render(
      <CountryProvider>
        <Consumer />
      </CountryProvider>
    )

    expect(sessionStorage.getItem(TRIP_FILTER_KEY)).toBe(
      JSON.stringify({ country: 'all', day: 'all' })
    )

    fireEvent.click(screen.getByRole('button', { name: /trocar país/i }))

    expect(sessionStorage.getItem(TRIP_FILTER_KEY)).toBe(
      JSON.stringify({ country: 'south-korea', day: 'all' })
    )
  })
})
