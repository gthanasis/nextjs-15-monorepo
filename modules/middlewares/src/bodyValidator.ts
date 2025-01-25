import {RequestHandler} from 'microservice'
import Ajv from 'ajv'
import {BadRequestError} from 'library'

// eslint-disable-next-line max-len
export const bodyValidator = (schema: Record<string, unknown>): RequestHandler => async (req, res, next): Promise<void> => {
    const ajv = new Ajv()
    const validate = ajv.compile(schema)
    const valid = validate(req.body)
    const errors = validate && validate.errors ? validate.errors.map(x => {
        const field = x.instancePath.split('/').filter(i => i !== '')
        return `${field.join(' > ')} ${x.message}`
    }) : []
    valid ? next() : next(new BadRequestError({ message: `Bad Request. ${errors.join(', ')}` }))
}
