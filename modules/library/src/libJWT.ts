/**
 * libAuth module.
 * @module libAuth
 */

import _ from 'lodash'
import jwt from 'jsonwebtoken'
import moment from 'moment-timezone'

type JWTConstructorProps = {
    JWT_SECRET: string
    name: string
    logger: any
}

interface JWTMethodCreateProps {
    [key: string]: any | string
    iss?: string
    iat?: string
    exp?: string
}

export class JWT {
    private JWT_SECRET: any
    private issuer: any
    private logger: any

    constructor ({JWT_SECRET, name, logger}: JWTConstructorProps) {
        this.JWT_SECRET = JWT_SECRET
        this.issuer = name
        this.logger = logger
    }

    /**
     * Creates a jwt with the given payload.
     * Set default issuer, issuance and expiration fields if not specified.
     * See section 4.1 of http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html
     * @param payload
     * @returns {*}
     */
    create ({payload}: JWTMethodCreateProps) {
        const iss = _.isNil(payload.iss) ? this.issuer : payload.iss
        const iat = _.isNil(payload.iat) ? Math.floor(new Date().getTime() / 1000) : payload.iat // Issued now by default
        const exp = _.isNil(payload.exp) ? Math.floor(moment().add(1, 'month').toDate().getTime() / 1000) : payload.exp // Expire in 1 month by default
        const _payload = _.extend(payload, {iss, iat, exp})
        return jwt.sign(_payload, this.JWT_SECRET, {algorithm: 'HS256'})
    }

    /**
     * Verifies given jwt and returns parsed payload,
     * with extra meta fields for easy usage.
     * @param token
     * @returns {*}
     */
    verify (token: string): Record<string, string> | undefined {
        try {
            const parsedToken = jwt.verify(token, this.JWT_SECRET) as jwt.JwtPayload
            const { exp, iat, owner, role } = parsedToken
            if (!exp) return undefined

            parsedToken.meta = {}
            parsedToken.meta.expiresAt = moment(exp * 1000)
            if (iat !== undefined) parsedToken.meta.issuedAt = moment(iat * 1000)

            return parsedToken
        } catch (err) {
            if (err instanceof jwt.TokenExpiredError) {
                const decodedToken = jwt.decode(token)
                this.logger.warn({token: decodedToken}, 'Token is expired')
            } else {
                this.logger.error({error: err}, 'Token is not valid')
            }
            throw err
        }
    }
}
