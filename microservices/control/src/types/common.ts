export type OrderFilters<Model> = { order: keyof Model | null, direction: 'asc' | 'desc' | null }

export type RetrieveWithFilterProps<Model> = {
  query: Record<string, any>
  order: OrderFilters<Model>
  pagination: { page: number, pageSize: number }
  search: string | null
}
