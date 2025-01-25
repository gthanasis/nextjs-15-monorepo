import 'source-map-support/register'

import dotenv from 'dotenv'
import {Logger, BunyanLogger, LogLevel} from 'logger'
import imagesRouteGenerator from './useCases/images/routes'

dotenv.config({ path: '../../envs/.env' })
import {StorageMsc} from './service'

const name = process.env.SERVER_NAME || 'storage'
const level = process.env.LOG_LEVEL as LogLevel || 'info'
const logger: BunyanLogger = new Logger({ name: name, level }).detach()

const msc = new StorageMsc(
    {
        env: process.env.NODE_ENV || 'development',
        host: process.env.HOST || '0.0.0.0',
        logger: logger,
        name: name,
        options: {
            bodyUrlencoded: true
        },
        port: parseInt(process.env.SERVER_PORT || '3002'),
        version: process.env.SERVER_VERSION || '1.0.0',
        allowedDomains: [process.env.WEBAPP_URL as string],
        prefix: process.env.SERVER_PREFIX || 'storage'
    }
)

msc.addRouter(imagesRouteGenerator(msc))
msc.start()
