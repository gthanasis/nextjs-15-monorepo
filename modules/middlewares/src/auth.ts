import {JWT} from 'library'
import {BunyanLogger} from 'logger'
import {RequestHandler} from 'microservice'

type Props = { jtwLib: JWT, roles?: string[], restrictUserId?: boolean, logger?: BunyanLogger, enforceUserId?: boolean }

export const auth = (props: Props): RequestHandler => async (req, res, next) => {
    const { jtwLib, roles = [], restrictUserId = false, logger, enforceUserId = false } = props
    const token =
        req.cookies && req.cookies['auth-token'] ||
        req.headers['authorization'] && (req.headers['authorization'] as string).split('Bearer ')[1]
    if (!token) { 
        logger?.warn('No auth token provided')
        res.status(401).json({ error: 'No auth token provided' })
        return
    }

    try {
        const decoded = jtwLib.verify(token) as any
        const allowedRole = roles.length > 0 && roles.includes(decoded.role)
        const isAdmin = decoded.role === 'admin'
        const userIdParam = req.params.userId || req.query.userId

        if (!allowedRole) {
            logger?.warn('No auth token provided')
            res.status(401).json({ error: `You don't have permission to access this resource` })
            return
        }

        res.locals.userId = decoded.id
        res.locals.decoded = decoded

        if (enforceUserId) return next()

        if (isAdmin) {
            if (restrictUserId && userIdParam == null) {
                logger?.warn({ role: decoded.role }, 'Admin tried to access a resource without providing a user ID')
                res.status(400).json({ error: `You need to provide a user ID` })
                return
            }
            res.locals.userId = userIdParam || null
        } else {
            if (req.query.userId || req.params.userId && req.params.userId !== decoded.id) { 
                logger?.warn({ role: decoded.role }, 'User tried to access a resource without permission')
                res.status(401).json({ error: `You don't have permission to access this resource` })
                return
            }
        }

        return next()
    } catch (err) {
        logger?.error(err)
        res.status(401).json({ error: 'Invalid auth token' })
        return
    }
}
