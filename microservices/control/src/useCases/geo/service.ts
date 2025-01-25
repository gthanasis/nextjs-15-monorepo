import {BadRequestError, IGeolocation} from 'library'
import { BunyanLogger } from 'logger'

export class GeoService {
    logger: BunyanLogger
    private geocoding: IGeolocation

    constructor ({ logger, geoLocation }: { logger: BunyanLogger, geoLocation: IGeolocation }) {
        this.logger = logger
        this.geocoding = geoLocation
    }

    async autocomplete (search: string, sessionToken: string) {
        this.logger.info('service autocomplete', { search, sessionToken })
        if (!sessionToken) {
            throw new BadRequestError({ message: 'You need to provide a session token', code: 400 })
        }
        return await this.geocoding.autocomplete(search, sessionToken)
    }

    async getDetails (id: string) {
        const details = await this.geocoding.getDetails(id)
        return details
    }
}
