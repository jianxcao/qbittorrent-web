export type SortOrder = 'asc' | 'desc' | null

export interface SortState {
  key: string
  order: SortOrder
}

export interface ResizableGridColumn<T = Record<string, unknown>> {
  title: string
  key: keyof T | string
  width?: number
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  ellipsis?: boolean | { tooltip?: boolean }
  sorter?: 'default' | ((row1: T, row2: T) => number)
  render?: (row: T) => unknown
  resizable?: boolean
}
