import {ControlMsc} from '../../service'
import {UserService} from './service'
import {UserRepository} from './repository'

export const generateUsersService = (msc: ControlMsc) => {
    const { persistence, logger } = msc
    const repository = new UserRepository({ persistence, logger })
    return new UserService({ repository, logger })
}
