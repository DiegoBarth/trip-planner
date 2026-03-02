import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MapPage from '../MapPage'
import { createPageWrapper } from './pageWrapper'

describe('MapPage', () => {
  const Wrapper = createPageWrapper()

  it('renders page header with title and subtitle', () => {
    render(<MapPage />, { wrapper: Wrapper })
    expect(screen.getByRole('heading', { name: /Mapa/i })).toBeInTheDocument()
    expect(screen.getByText(/Visualize suas atrações no mapa/i)).toBeInTheDocument()
  })

  it('renders CountryFilter', () => {
    const { container } = render(<MapPage />, { wrapper: Wrapper })
    const countryFilter = container.querySelector('#country-filter')
    expect(countryFilter).toBeInTheDocument()
  })

  it('renders main content area', () => {
    render(<MapPage />, { wrapper: Wrapper })
    const main = screen.getByRole('main')
    expect(main).toBeInTheDocument()
  })
})
