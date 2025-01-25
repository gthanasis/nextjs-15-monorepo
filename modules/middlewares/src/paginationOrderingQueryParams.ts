import {RequestHandler} from 'microservice'
import {BadRequestError} from 'library'

export const paginationOrderingQueryParams = (): RequestHandler => async (req, res, next): Promise<void> => {
    const { pageSize, page, order, orderDirection } = req.query
    res.locals.pageSize = 50
    res.locals.page = 1
    if (typeof pageSize === 'string') res.locals.pageSize = parseInt(pageSize)
    if (typeof page === 'string') res.locals.page = parseInt(page)
    if (typeof order === 'string') res.locals.orderField = order
    if (typeof orderDirection === 'string') res.locals.orderDirection = orderDirection
    if (res.locals.pageSize <= 0) return next(new BadRequestError({ message: `pageSize should be larger than 0` }))
    if (res.locals.page < 1) return next(new BadRequestError({ message: `page should be larger or equal to 1` }))
    if (res.locals.orderDirection && !['asc', 'desc'].includes(res.locals.orderDirection)) return next(new BadRequestError({ message: `order direction should be one of asc, desc` }))
    next()
}
