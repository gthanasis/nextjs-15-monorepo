import {GeoService} from './service'
import {GoogleGeolocation} from 'library'
import {ControlMsc} from '../../service'

export const generateGeoService = (msc: ControlMsc) => {
    const { logger } = msc
    const geoLocation = new GoogleGeolocation(logger)
    return new GeoService({ logger, geoLocation })
}
