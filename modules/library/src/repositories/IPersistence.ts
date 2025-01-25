export interface Query {
    [attribute: string]: any
}

export interface Pagination {
    limit: number
    offset: number
}

export interface Order {
    field: string
    direction: string
    cast?: string
}

export default interface IPersistence {
    connect (): Promise<void>
    disconnect (): Promise<void>
}
