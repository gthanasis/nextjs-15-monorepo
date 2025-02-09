import {ControlMsc} from '../../service'
import {UserRepository} from './repositories/repository'
import {UserService} from './services/service'

export const generateUsersService = (msc: ControlMsc) => {
    const { persistence, logger } = msc
    const repository = new UserRepository({ persistence, logger })
    return new UserService({ repository, logger })
}
