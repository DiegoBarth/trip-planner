export type ChecklistCategory =
  | 'documents'
  | 'clothes'
  | 'electronics'
  | 'hygiene'
  | 'medicines'
  | 'accessories'
  | 'entertainment'
  | 'other'

export interface ChecklistItem {
  id: number
  description: string
  category: ChecklistCategory
  isPacked: boolean
  quantity?: number
  notes?: string
}