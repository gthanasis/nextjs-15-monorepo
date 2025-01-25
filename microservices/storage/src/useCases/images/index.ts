import {ImagesService} from './service'
import {StorageMsc} from '../../service'
import {ImagesRepository} from './repository'

export const generateImagesService = (msc: StorageMsc) => {
    const { logger } = msc
    const repository = new ImagesRepository({ logger })
    return new ImagesService({ repository, logger })
}
