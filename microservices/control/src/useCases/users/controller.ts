import { ApiResponse, IUserPublicProfile } from 'api-client'
import { UserService } from './service'
import { BunyanLogger } from 'logger'
import { NextFunction, Response, Request } from 'microservice'

type UserControllerProps = {
    service: UserService
    logger: BunyanLogger
}

export class UserController {
    private readonly activity: { entity: string }
    private service: UserService
    private logger: BunyanLogger

    constructor({ service, logger }: UserControllerProps) {
        this.service = service
        this.logger = logger
        this.activity = {
            entity: 'users'
        }
    }

    async createFromGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { user } = req.body
        const result = await this.service.createFromGoogle(user)
        res.json({ res: result })
        next()
    }

    async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { pageSize, page, search, order, orderDirection, meta, ...restQuery } = req.query
        let searchTerms = null
        if (typeof search === 'string') searchTerms = search
        const ordering = {
            order: res.locals.orderField,
            direction: res.locals.orderDirection
        }
        const result = await this.service.retrieve({
            query: restQuery,
            pagination: { page: res.locals.page, pageSize: res.locals.pageSize },
            order: ordering,
            search: searchTerms
        })
        res.json({
            res: result.users,
            count: result.count,
            pagination: result.pagination,
            order: ordering
        })
        next()
    }

    async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { userId } = req.params
        const result = await this.service.retrieveById(userId)
        res.json({ res: result.users })
        next()
    }

    async post(req: Request, res: Response, next: NextFunction): Promise<void> {
        const result = await this.service.insert(req.body)
        res.json({ res: result })
        res.locals.activity = {
            ...this.activity,
            action: 'create',
            data: { id: result.id }
        }
        next()
    }

    async patch(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { userId } = req.params
        const result = await this.service.update({
            filters: { id: userId },
            attrs: req.body
        })
        res.json({ res: result })
        res.locals.activity = {
            ...this.activity,
            action: 'update',
            data: { id: userId }
        }
        next()
    }

    async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { userId } = req.params
        const result = {
            user: (await this.service.delete(userId)).length
        }
        this.logger.info(`User ${userId} deleted`, result)
        res.json({ res: result })
        res.locals.activity = {
            ...this.activity,
            action: 'delete',
            data: { id: userId }
        }
    }

    async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
        const userId = res.locals.userId
        const result = await this.service.retrieve({
            query: { id: userId },
            pagination: { page: 1, pageSize: 1 },
            search: null,
            order: { direction: null, order: null }
        })
        if (res.locals.decoded.impersonate) {
            result.users[0].impersonated = true
        }
        const response: ApiResponse<IUserPublicProfile> = {
            res: result.users[0]
        }
        res.json(response)
        // next()
    }

    async enable(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { userId } = req.params
        const result = await this.service.enable(userId)
        res.json({ res: result })
        res.locals.activity = {
            ...this.activity,
            action: 'enable',
            data: { id: userId }
        }
        next()
    }

    async disable(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { userId } = req.params
        const result = await this.service.disable(userId)
        res.json({ res: result })
        res.locals.activity = {
            ...this.activity,
            action: 'disable',
            data: { id: userId }
        }
        next()
    }

    async updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { userId } = req.params
        const result = await this.service.updateLocation(userId, req.body)
        res.json({ res: result })
        res.locals.activity = {
            ...this.activity,
            action: 'updateLocation',
            data: { id: userId }
        }
        next()
    }

    async updateLastSeenOn(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { userId } = req.params
        const result = await this.service.updateLastSeenOn(userId, req.body)
        res.json({ res: result })
        res.locals.activity = {
            ...this.activity,
            action: 'updateLastSeen',
            data: { id: userId }
        }
        next()
    }

    async promote(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { userId, role } = req.params
        const result = await this.service.promote(userId, role)
        res.json({ res: result })
        res.locals.activity = {
            ...this.activity,
            action: 'promote',
            data: { id: userId, role }
        }
        next()
    }
}
