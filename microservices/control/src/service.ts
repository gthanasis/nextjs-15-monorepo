import 'dotenv/config'
import Microservice, { ServiceConstructorProps } from 'microservice'
import { JWT, MongoDbPersistence } from 'library'
import { requestLogger } from 'middlewares'

export class ControlMsc extends Microservice {
    public persistence: MongoDbPersistence
    public jtwLib: JWT

    constructor (props: ServiceConstructorProps) {
        super(props)
        this.persistence = new MongoDbPersistence({
            connectionString: process.env.MONGO_CONNECTION_STRING as string
        })
        this.jtwLib = new JWT({ JWT_SECRET: process.env.JWT_SECRET_TOKEN as string, name: 'control-msc', logger: props.logger })

        // Add request logger middleware
        this.app.use(requestLogger({ 
            logger: props.logger,
            excludePaths: ['/health', '/metrics', '/favicon.ico'] 
        }))
    }

    protected async createConnections (): Promise<void> {
        await this.persistence.connect()
        return
    }

    protected async closeConnections (): Promise<void> {
        return await this.persistence.disconnect()
    }
}
