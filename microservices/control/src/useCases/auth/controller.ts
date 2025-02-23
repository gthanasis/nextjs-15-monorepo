import { AuthService } from './service'
import { BunyanLogger } from 'logger'
import { NextFunction, Response, Request } from 'microservice'

export class AuthController {
    private readonly activity: { entity: string }
    private service: AuthService
    private logger: BunyanLogger

    constructor ({
        service,
        logger
    }: {
    service: AuthService;
    logger: BunyanLogger;
  }) {
        this.service = service
        this.logger = logger
        this.activity = {
            entity: 'auth'
        }
    }

    async loginDemo (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const result = await this.service.demoLogin(req.query.userID as string)
        res
        .cookie('auth-token', result.token, {
            httpOnly: false,
            secure: false,
            expires: result.expiry
        })
        .status(200)
        .redirect(process.env.WEBAPP_URL as string)
    }

    async impersonate (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        const result = await this.service.impersonateLogin(
      req.query.userID as string,
      res.locals.userId as string
        )
        res
        .cookie('auth-token', result.token, {
            httpOnly: false,
            secure: false,
            expires: result.expiry
        })
        .status(200)
        .redirect(process.env.WEBAPP_URL as string)
    }

    async logout (req: Request, res: Response, next: NextFunction): Promise<void> {
        res.clearCookie('auth-token').status(200).json({ logout: true })
    }

    async createFromGoogle (req: Request, res: Response, next: NextFunction): Promise<void> {
        const result = await this.service.createFromGoogle(req.body.user)
        res.status(201).json(result)
    }
}
