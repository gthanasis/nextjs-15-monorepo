import 'mocha'
import { assert } from 'chai'
import { BadRequestError } from 'library'
import paginationOrderingQueryParams from '../../src/paginationOrderingQueryParams'
import {stub} from 'sinon'

describe('paginationOrderingQueryParams Middleware', () => {
    let next: any

    beforeEach(() => {
        next = stub()
    })

    it('should set default pageSize and page when query params are not provided', async () => {
        const req = { query: {} } as any
        const res = { locals: {} } as any

        const middleware = paginationOrderingQueryParams()
        await middleware(req, res, next)

        assert.strictEqual(res.locals.pageSize, 50)
        assert.strictEqual(res.locals.page, 1)
        assert.isTrue(next.calledOnce)
    })

    it('should parse pageSize and page from query params', async () => {
        const req = { query: { pageSize: '20', page: '2' } } as any
        const res = { locals: {} } as any

        const middleware = paginationOrderingQueryParams()
        await middleware(req, res, next)

        assert.strictEqual(res.locals.pageSize, 20)
        assert.strictEqual(res.locals.page, 2)
        assert.isTrue(next.calledOnce)
    })

    it('should parse order and orderDirection from query params', async () => {
        const req = { query: { order: 'name', orderDirection: 'asc' } } as any
        const res = { locals: {} } as any

        const middleware = paginationOrderingQueryParams()
        await middleware(req, res, next)

        assert.strictEqual(res.locals.orderField, 'name')
        assert.strictEqual(res.locals.orderDirection, 'asc')
        assert.isTrue(next.calledOnce)
    })

    it('should throw BadRequestError if pageSize is less than or equal to 0', async () => {
        const req = { query: { pageSize: '0' } } as any
        const res = { locals: {} } as any

        const middleware = paginationOrderingQueryParams()
        await middleware(req, res, next)

        assert.isTrue(next.calledOnce)
        const error = next.firstCall.args[0]
        assert.instanceOf(error, BadRequestError)
        assert.strictEqual(error.message, 'pageSize should be larger than 0')
    })

    it('should throw BadRequestError if page is less than 1', async () => {
        const req = { query: { page: '0' } } as any
        const res = { locals: {} } as any

        const middleware = paginationOrderingQueryParams()
        await middleware(req, res, next)

        assert.isTrue(next.calledOnce)
        const error = next.firstCall.args[0]
        assert.instanceOf(error, BadRequestError)
        assert.strictEqual(error.message, 'page should be larger or equal to 1')
    })

    it('should throw BadRequestError if orderDirection is invalid', async () => {
        const req = { query: { orderDirection: 'invalid' } } as any
        const res = { locals: {} } as any

        const middleware = paginationOrderingQueryParams()
        await middleware(req, res, next)

        assert.isTrue(next.calledOnce)
        const error = next.firstCall.args[0]
        assert.instanceOf(error, BadRequestError)
        assert.strictEqual(error.message, 'order direction should be one of asc, desc')
    })
})
