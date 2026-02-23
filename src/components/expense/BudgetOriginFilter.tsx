import Wallet from 'lucide-react/dist/esm/icons/wallet';
import { CustomSelect } from '@/components/ui/CustomSelect'
import { useFilterSheet } from '@/contexts/FilterSheetContext'
import { BUDGET_ORIGINS } from '@/config/constants'
import type { BudgetOrigin } from '@/types/Attraction'

const ORIGIN_OPTIONS = [
  'Todos',
  ...Object.values(BUDGET_ORIGINS)
    .map((c) => c.label)
    .sort((a, b) => a.localeCompare(b))
];

function valueToLabel(value: BudgetOrigin | 'all'): string {
  if (value === 'all') return 'Todos';

  return BUDGET_ORIGINS[value]?.label ?? 'Todos';
}

function labelToValue(label: string): BudgetOrigin | 'all' {
  if (label === 'Todos') return 'all';

  const entry = Object.entries(BUDGET_ORIGINS).find(([, c]) => c.label === label);

  return (entry?.[0] as BudgetOrigin) ?? 'all';
}

interface BudgetOriginFilterProps {
  value: BudgetOrigin | 'all'
  onChange: (value: BudgetOrigin | 'all') => void
}

export function BudgetOriginFilter({ value, onChange }: BudgetOriginFilterProps) {
  const dropdownPosition = useFilterSheet()
  const inSheet = dropdownPosition === 'above'
  return (
    <div className="flex-1 min-w-[140px] md:max-w-[200px]">
      <CustomSelect
        id="budget-origin-filter"
        value={valueToLabel(value)}
        onChange={(val) => onChange(labelToValue(val))}
        options={ORIGIN_OPTIONS}
        variant={inSheet ? 'default' : 'glass'}
        leftIcon={inSheet ? undefined : <Wallet className="w-4 h-4" />}
        placeholder="Origem"
        dropdownPosition={dropdownPosition}
      />
    </div>
  )
}