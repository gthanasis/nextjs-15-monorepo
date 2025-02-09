import 'source-map-support/register'

import dotenv from 'dotenv'
import { Logger, BunyanLogger, LogLevel } from 'logger'
import auth from './useCases/auth/routes'
import users from './useCases/users/routes/routes'
import geo from './useCases/geo/routes'

// dotenv.config({ path: '../../envs/.env' })

import { ControlMsc } from './service'

const name = process.env.SERVER_NAME || 'control'
const level = (process.env.LOG_LEVEL as LogLevel) || 'info'

const logger: BunyanLogger = new Logger({ name: name, level }).detach()

const msc = new ControlMsc({
    env: process.env.NODE_ENV || 'development',
    host: process.env.HOST || '0.0.0.0',
    logger: logger,
    name: name,
    options: {},
    port: parseInt(process.env.SERVER_PORT || '3000'),
    version: process.env.SERVER_VERSION || '1.0.0',
    allowedDomains: [process.env.WEBAPP_URL as string],
    prefix: process.env.SERVER_PREFIX || 'control'
})

msc.addRouter(auth(msc))
msc.addRouter(users(msc))
msc.addRouter(geo(msc))
msc.start()
