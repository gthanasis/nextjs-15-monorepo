import { ControlMsc } from '../../service'
import { AuthController } from './controller'
import { AsyncErrorHandler, Router } from 'microservice'
import { generateAuthService } from './index'
import { auth } from 'middlewares'
const router = Router()

export default (msc: ControlMsc): Router => {
    const { logger, jtwLib } = msc
    const service = generateAuthService(msc)
    const controller = new AuthController({ service, logger })

    if (process.env.ALLOW_DEMO_LOGIN) {
        router.get(
            '/auth/login/demo',
            AsyncErrorHandler(controller.loginDemo.bind(controller))
        )
    }

    router.get(
        '/auth/impersonate',
        auth({ jtwLib, roles: ['admin'], logger }),
        AsyncErrorHandler(controller.impersonate.bind(controller))
    )

    router.get(
        '/auth/logout',
        AsyncErrorHandler(controller.logout.bind(controller))
    )

    router.post(
        '/auth/next/createFromGoogle',
        auth({ jtwLib, roles: ['next'], logger }),
        AsyncErrorHandler(controller.createFromGoogle.bind(controller))
    )

    return router
}
