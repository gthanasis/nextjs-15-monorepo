import { assert } from 'chai'
import { BadRequestError } from 'library'
import bodyValidator from '../../src/bodyValidator'
import {stub} from 'sinon'

describe('bodyValidator Middleware', () => {
    it('should call next() when the request body is valid', async () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                age: { type: 'number' }
            },
            required: ['name', 'age']
        }

        const req = { body: { name: 'Alice', age: 30 } } as any
        const res = {} as any
        const next = stub()

        const middleware = bodyValidator(schema)
        await middleware(req, res, next)

        assert.isTrue(next.calledOnce)
        assert.isTrue(next.firstCall.args.length === 0) // No arguments passed to next() on success
    })

    it('should call next() with BadRequestError when the request body is invalid', async () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' },
                age: { type: 'number' }
            },
            required: ['name', 'age']
        }

        const req = { body: { name: 'Alice' } } as any // Missing required field 'age'
        const res = {} as any
        const next = stub()

        const middleware = bodyValidator(schema)
        await middleware(req, res, next)

        assert.isTrue(next.calledOnce)
        const error = next.firstCall.args[0]
        assert.instanceOf(error, BadRequestError)
        assert.match(error.message, /Bad Request/) // Check error message format
    })

    it('should handle schema validation errors correctly', async () => {
        const schema = {
            type: 'object',
            properties: {
                name: { type: 'string' }
            },
            required: ['name']
        }

        const req = { body: {} } as any // Completely invalid body
        const res = {} as any
        const next = stub()

        const middleware = bodyValidator(schema)
        await middleware(req, res, next)

        assert.isTrue(next.calledOnce)
        const error = next.firstCall.args[0]
        assert.instanceOf(error, BadRequestError)
        assert.match(error.message, /Bad Request/)
    })
})
