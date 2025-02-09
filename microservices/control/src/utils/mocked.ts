import {Logger} from 'logger'
import {MongoDbPersistence} from 'library'

export const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test' })
export const logger = new Logger({name: '[TEST]', level: 'fatal'}).detach()
