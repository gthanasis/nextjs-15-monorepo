import { GeoService } from './service'
import {BunyanLogger} from 'logger'
import {NextFunction, Response, Request} from 'microservice'

export class GeoController {
    private service: GeoService
    private logger: BunyanLogger

    constructor ({ service, logger }: { service: GeoService, logger: BunyanLogger }) {
        this.service = service
        this.logger = logger
    }

    async autocomplete (req: Request, res: Response, next: NextFunction): Promise<void> {
        const query = req.query
        this.logger.info('controller autocomplete', { query })
        const { sessionToken, search } = query
        const result = await this.service.autocomplete(search as string, sessionToken as string)
        res.json({
            res: result,
            count: result.length
        })
        next()
    }
    async getDetails (req: Request, res: Response, next: NextFunction): Promise<void> {
        const params = req.params
        const result = await this.service.getDetails(params.id)
        res.json({
            res: result
        })
        next()
    }
}
