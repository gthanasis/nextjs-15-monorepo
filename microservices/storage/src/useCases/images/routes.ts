import {StorageMsc} from '../../service'
import {AsyncErrorHandler, RequestHandler, Router} from 'microservice'
import {ImagesController} from './controler'
import {generateImagesService} from './index'
import ImageJsonSchema from './model'
import multer from 'multer'
import {auth, bodyValidator} from 'middlewares'
const router = Router()

const uploadMiddleware: RequestHandler = (req, res, next) => {
    const upload = multer({
        limits: { fileSize: 10 * 1024 * 1024 }
    }) // Set a file size limit, e.g., 10MB
    // TODO: multer does not support express 5 types yet
    upload.single('buffer')(req as any, res as any, next)
}

export default (msc: StorageMsc): Router => {
    const { logger, jtwLib } = msc
    const imagesService = generateImagesService(msc)
    const controller = new ImagesController({ service: imagesService, logger })
    router.get('/workspaces/:workspaceId/images/:imageId',
        auth({ jtwLib, roles: ['user', 'admin'], logger, enforceUserId: true }),
        AsyncErrorHandler(controller.getById.bind(controller))
    )
    router.post('/workspaces/:workspaceId/images/',
        auth({ jtwLib, roles: ['user', 'admin'], logger, enforceUserId: true }),
        uploadMiddleware,
        bodyValidator(ImageJsonSchema),
        AsyncErrorHandler(controller.post.bind(controller))
    )
    router.delete('/workspaces/:workspaceId/images/:imageId',
        auth({ jtwLib, roles: ['user', 'admin'], logger, enforceUserId: true }),
        AsyncErrorHandler(controller.delete.bind(controller))
    )
    return router
}
