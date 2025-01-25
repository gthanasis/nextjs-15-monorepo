import { assert } from 'chai'
import { stub, SinonStub } from 'sinon'
import { auth } from '../../src'
import { testLogger as logger, jwt as jwtLib, generateRes, generateReq } from '../helpers'

describe('auth Middleware', () => {
    let next: SinonStub

    beforeEach(() => {
        next = stub()
    })

    it('should return 401 if no token is provided', async () => {
        const req = generateReq()
        const res = generateRes()

        const middleware = auth({ jtwLib: jwtLib, logger })
        await middleware(req, res, next)

        assert.isTrue(
            res.status.calledWith(401),
            'Expected status to be called with 401 when no token is provided'
        )
        assert.isTrue(
            res.json.calledWith({ error: 'No auth token provided' }),
            'Expected JSON response to indicate missing auth token'
        )
        assert.isFalse(next.called, 'Expected next() not to be called')
    })

    it('should return 401 if token is invalid', async () => {
        const req = generateReq({ headers: { authorization: 'Bearer invalidToken' } })
        const res = generateRes()

        const middleware = auth({ jtwLib: jwtLib, logger })
        await middleware(req, res, next)

        assert.isTrue(
            res.status.calledWith(401),
            'Expected status to be called with 401 for an invalid token'
        )
        assert.isTrue(
            res.json.calledWith({ error: 'Invalid auth token' }),
            'Expected JSON response to indicate invalid token'
        )
        assert.isFalse(next.called, 'Expected next() not to be called for invalid token')
    })

    it('should return 401 if user role is not allowed', async () => {
        const token = jwtLib.create({ payload: { id: '123', role: 'user' } })
        const req = generateReq({ headers: { authorization: `Bearer ${token}` } })
        const res = generateRes()

        const middleware = auth({ jtwLib: jwtLib, roles: ['admin'], logger })
        await middleware(req, res, next)

        assert.isTrue(
            res.status.calledWith(401),
            'Expected status to be called with 401 when user role is not allowed'
        )

        assert.isTrue(
            res.json.calledWith({ error: `You don't have permission to access this resource` }),
            'Expected JSON response to indicate insufficient permissions'
        )
        assert.isFalse(next.called, 'Expected next() not to be called for unauthorized role')
    })

    it('should call next if user role is allowed', async () => {
        const token = jwtLib.create({ payload: { id: '123', role: 'user' } })
        const req = generateReq({ headers: { authorization: `Bearer ${token}` } })
        const res = { ...generateRes(), locals: {} }

        const middleware = auth({ jtwLib: jwtLib, roles: ['user'], logger })
        await middleware(req, res, next)

        assert.equal(res.locals.userId, '123', 'Expected res.locals.userId to be populated')
        assert.equal(res.locals.decoded.id, '123', 'Expected res.locals.decoded to be populated')
        assert.equal(res.locals.decoded.role, 'user', 'Expected res.locals.decoded to be populated')
        assert.isTrue(
            next.calledOnce,
            'Expected next() to be called for an authorized role'
        )
    })

    it('should enforce user ID when `enforceUserId` is true', async () => {
        const token = jwtLib.create({ payload: { id: '123', role: 'user' } })
        const req = generateReq({ headers: { authorization: `Bearer ${token}` } })
        const res = generateRes()

        const middleware = auth({ jtwLib: jwtLib, roles: ['user'], enforceUserId: true, logger })
        await middleware(req, res, next)

        assert.isTrue(next.calledOnce, 'Expected next() to be called when enforceUserId is true')
    })

    it('should return 400 if admin role and `restrictUserId` is true but no user ID is provided', async () => {
        const token = jwtLib.create({ payload: { id: '123', role: 'admin' } })

        const req = generateReq({ headers: { authorization: `Bearer ${token}` } })
        const res = generateRes()

        const middleware = auth({ jtwLib: jwtLib, roles: ['admin'], restrictUserId: true, logger })
        await middleware(req, res, next)

        assert.isTrue(
            res.status.calledWith(400),
            'Expected status to be called with 400 when admin access is missing a user ID'
        )
        assert.isTrue(
            res.json.calledWith({ error: 'You need to provide a user ID' }),
            'Expected JSON response to indicate missing user ID'
        )
        assert.isFalse(next.called, 'Expected next() not to be called for missing user ID')
    })

    it('should allow admin to access resources without user ID if `restrictUserId` is false', async () => {
        const token = jwtLib.create({ payload: { id: '123', role: 'admin' } })

        const req = generateReq({ headers: { authorization: `Bearer ${token}` } })
        const res = generateRes()

        const middleware = auth({ jtwLib: jwtLib, roles: ['admin'], restrictUserId: false, logger })
        await middleware(req, res, next)

        assert.isTrue(next.calledOnce, 'Expected next() to be called when restrictUserId is false')
        assert.isNull(res.locals.userId, 'Expected res.locals.userId to be null')
    })
})
