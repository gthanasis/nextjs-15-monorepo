export type DateQueryParams = {
  fromDate: string | null | undefined
  toDate: string | null | undefined
  field: string
}

export type RangeQueryParams = {
  from: string | null | undefined
  to: string | null | undefined
  field: string
  mapper: (T) => any
}

export type GeoWithinQueryParams = {
  lat: number
  lng: number
  radius: number
  field: string
}
