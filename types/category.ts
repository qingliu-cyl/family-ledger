export type CategoryDimension = 'personal' | 'family' | 'both'

export interface Category {
  id: string
  name: string
  icon: string // emoji
  dimension: CategoryDimension
  sortOrder: number
}
