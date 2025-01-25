import 'dotenv/config'
import Microservice, {ServiceConstructorProps} from 'microservice'
import {JWT} from 'library'

export class StorageMsc extends Microservice {
    public jtwLib: JWT
    constructor (props: ServiceConstructorProps) {
        super(props)
        this.jtwLib = new JWT({ JWT_SECRET: process.env.JWT_SECRET_TOKEN as string, name: 'control-msc', logger: props.logger })
    }
}
