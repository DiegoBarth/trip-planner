import { createContext, useContext, type ReactNode } from 'react'

type DropdownPosition = 'above' | 'below'

interface FilterSheetContextValue {
  dropdownPosition: DropdownPosition
}

const FilterSheetContext = createContext<FilterSheetContextValue | null>(null)

export function FilterSheetProvider({
  dropdownPosition,
  children
}: {
  dropdownPosition: DropdownPosition
  children: ReactNode
}) {
  return (
    <FilterSheetContext.Provider value={{ dropdownPosition }}>
      {children}
    </FilterSheetContext.Provider>
  )
}

export function useFilterSheet(): DropdownPosition {
  const ctx = useContext(FilterSheetContext)
  return ctx?.dropdownPosition ?? 'below'
}
