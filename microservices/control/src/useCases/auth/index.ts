import {AuthService} from './service'
import {ControlMsc} from '../../service'
import {OAuth2Client} from 'google-auth-library'
import {generateUsersService} from '../users'

export const generateAuthService = (msc: ControlMsc) => {
    const { logger, jtwLib } = msc
    const userService = generateUsersService(msc)
    const googleClient = new OAuth2Client({
        clientId: process.env.GOOGLE_LOGIN_CLIENTID,
        clientSecret: process.env.GOOGLE_LOGIN_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_LOGIN_REDIRECT_URI
    })
    const jwtLib = jtwLib
    return new AuthService({ logger, client: googleClient, userService, jwtLib })
}
