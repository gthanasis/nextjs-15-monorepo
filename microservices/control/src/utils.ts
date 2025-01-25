import dayjs from 'dayjs'
import {Request} from 'microservice'

type PaginationDB = {
    limit: number
    offset: number
}

type PageParams = {
    pageSize: string,
    page: string
}

export type Pagination = {
    pageSize: string
    page: string
}

export default {
    generatePagination: (pageParams: PageParams | undefined): PaginationDB | undefined => {
        let pagination
        if (pageParams) {
            pagination = {
                limit: parseInt(pageParams.pageSize),
                offset: (parseInt(pageParams.page)) * parseInt(pageParams.pageSize)
            }
        }
        return pagination
    },
    databaseColFromTransformer: (transformer: (e: Record<string, unknown>) => Record<string, unknown>, key: string | undefined, defaultKey = 'id'): string => {
        if (key === undefined) return defaultKey
        let col: string = defaultKey
        const obj = transformer({ [key]: 0 })
        Object.keys(obj).forEach((k) => {
            if (obj[k] === 0) col = k
        })
        return col
    },
    calculateDateDifInDays: (date1: Date, date2: Date): number => {
        // Parse startDate and endDate into Date objects, using defaults if necessary
        const start = new Date(date1).getTime()
        const end = new Date(date2).getTime()

        // Calculate the difference in days between start and end dates
        const millisecondsPerDay = 24 * 60 * 60 * 1000 // Number of milliseconds in a day
        const diffInMilliseconds = end - start
        const diffInDays = Math.ceil(diffInMilliseconds / millisecondsPerDay) + 1 // Plus one to include both start and end days
        return diffInDays
    },
    generateDateRange: (startDate: Date, endDate: Date) => {
        const dates: { start: string; end: string }[] = []
        const currentDate = new Date(startDate.getTime())

        while (currentDate.getTime() <= endDate.getTime()) {
            const start = dayjs(currentDate).format('YYYY-MM-DD')
            const end = dayjs(currentDate).add(1, 'day').format('YYYY-MM-DD')
            dates.push({ start, end })
            currentDate.setDate(currentDate.getDate() + 1)
        }

        return dates
    },
    getQueryParam: (req: Request, paramName: string): string | undefined => {
        const value = req.query[paramName]
        if (typeof value === 'string') {
            return value
        }
        return undefined
    },
    calculatePercentageChange: (oldValue: number, newValue: number): number => {
        return oldValue > 0 ? ((newValue - oldValue) / oldValue) * 100 : 0
    }
}
