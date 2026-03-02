import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FilterSheetProvider, useFilterSheet } from '../FilterSheetContext'

// Test consumer component to read the hook value
function Consumer() {
  const position = useFilterSheet()
  return <span data-testid="position">{position}</span>
}

describe('FilterSheetContext', () => {
  it('returns "below" when used outside provider', () => {
    // Hook should fallback to default when no provider is present
    render(<Consumer />)

    expect(screen.getByTestId('position').textContent).toBe('below')
  })

  it('provides "above" when set in provider', () => {
    render(
      <FilterSheetProvider dropdownPosition="above">
        <Consumer />
      </FilterSheetProvider>
    )

    expect(screen.getByTestId('position').textContent).toBe('above')
  })

  it('provides "below" when explicitly set in provider', () => {
    render(
      <FilterSheetProvider dropdownPosition="below">
        <Consumer />
      </FilterSheetProvider>
    )

    expect(screen.getByTestId('position').textContent).toBe('below')
  })

  it('renders children correctly', () => {
    // Ensures provider properly renders its children
    render(
      <FilterSheetProvider dropdownPosition="above">
        <div>Child content</div>
      </FilterSheetProvider>
    )

    expect(screen.getByText('Child content')).toBeInTheDocument()
  })
})