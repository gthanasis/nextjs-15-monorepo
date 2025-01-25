import {ControlMsc} from '../../service'
import {AsyncErrorHandler, Router} from 'microservice'
import {GeoController} from './controler'
import {generateGeoService} from './index'
const router = Router()

export default (msc: ControlMsc): Router => {
    const { logger } = msc
    const service = generateGeoService(msc)
    const controller = new GeoController({ service, logger })

    router.get('/geo/autocomplete',
        AsyncErrorHandler(controller.autocomplete.bind(controller))
    )

    router.get('/geo/details/:id',
        AsyncErrorHandler(controller.getDetails.bind(controller))
    )

    return router
}
