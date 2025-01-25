import { BunyanLogger } from 'logger'

export type cacheConstructorArgs = {
    logger: BunyanLogger
}

abstract class Cache {
    protected logger: BunyanLogger
    protected cacheCap = 5000

    protected constructor (options: cacheConstructorArgs) {
        this.logger = options.logger
    }
    protected exists (userID: string) {}
    protected valid (userID: string, cacheInvalidation: number) {}
    protected remove (userID: string) {}
    protected get (userID: string) {}
    protected build (userID: string) {}
}

export default Cache
