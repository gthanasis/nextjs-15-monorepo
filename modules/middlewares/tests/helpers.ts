import {JWT} from 'library'
import {Logger} from 'logger'
import {stub} from 'sinon'

export const testLogger = new Logger({ name: 'test', level: 'fatal' }).detach()
export const jwt = new JWT({ JWT_SECRET: 'secret', name: 'test', logger: testLogger })

export const generateRes = () => {
    const locals = {} // Keep locals as a real object
    return {
        status: stub().returnsThis(),
        json: stub(),
        locals
    } as any
}

export const generateReq = (props: any = {}) => {
    return {
        cookies: {},
        headers: {},
        query: {},
        params: {},
        ...props
    } as any
}

export default { testLogger, jwt, generateRes, generateReq }
