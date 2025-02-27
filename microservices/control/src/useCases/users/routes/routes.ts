import { AsyncErrorHandler, Router } from 'microservice'
import {auth, paginationOrderingQueryParams, zodBodyValidator} from 'middlewares'
import {ControlMsc} from '../../../service'
import {generateUsersService} from '../index'
import {UserController} from '../controllers/controller'
const router = Router()

export default (msc: ControlMsc): Router => {
    const { logger, jtwLib } = msc

    const service = generateUsersService(msc)

    const controller = new UserController({ service, logger })

    router.post(
        '/users/:provider',
        auth({ jtwLib, roles: ['next'], logger }),
        AsyncErrorHandler(controller.createFromProvider.bind(controller))
    )

    // regular user
    router.get(
        '/users/me',
        auth({ jtwLib, roles: ['user', 'admin'], logger, enforceUserId: true }),
        AsyncErrorHandler(controller.getMe.bind(controller))
    )
    router.get(
        '/users/:userId',
        auth({ jtwLib, roles: ['user', 'admin'], restrictUserId: false, logger }),
        AsyncErrorHandler(controller.getById.bind(controller))
    )
    router.patch(
        '/users/:userId',
        auth({ jtwLib, roles: ['admin', 'user'], logger }),
        AsyncErrorHandler(controller.patch.bind(controller))
    )
    router.delete(
        '/users/:userId',
        auth({ jtwLib, roles: ['user', 'admin'], logger, restrictUserId: true }),
        AsyncErrorHandler(controller.delete.bind(controller))
    )

    // admin
    router.post(
        '/users/',
        auth({ jtwLib, roles: ['admin'], logger }),
        AsyncErrorHandler(controller.post.bind(controller))
    )
    router.delete(
        '/users/:userId',
        auth({ jtwLib, roles: ['admin'], logger }),
        AsyncErrorHandler(controller.delete.bind(controller))
    )
    router.patch(
        '/users/:userId/enable',
        auth({ jtwLib, roles: ['admin'], logger }),
        AsyncErrorHandler(controller.enable.bind(controller))
    )
    router.patch(
        '/users/:userId/disable',
        auth({ jtwLib, roles: ['admin'], logger }),
        AsyncErrorHandler(controller.disable.bind(controller))
    )
    router.patch(
        '/users/:userId/promote/:role',
        auth({ jtwLib, roles: ['admin'], logger }),
        AsyncErrorHandler(controller.promote.bind(controller))
    )

    router.patch(
        '/users/:userId/lastSeenOn',
        auth({ jtwLib, roles: ['user'], logger }),
        AsyncErrorHandler(controller.updateLastSeenOn.bind(controller))
    )
    router.patch(
        '/users/:userId/location',
        auth({ jtwLib, roles: ['user'], logger }),
        AsyncErrorHandler(controller.updateLocation.bind(controller))
    )

    router.get(
        '/users/',
        paginationOrderingQueryParams(),
        auth({ jtwLib, roles: ['admin'], logger }),
        AsyncErrorHandler(controller.getAll.bind(controller))
    )

    return router
}
