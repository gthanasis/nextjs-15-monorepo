import {IUser} from 'api-client'
import {BadRequestError} from 'library'

const validate = (user: Partial<IUser>): void => {
    if (user.email == null) throw new BadRequestError({ code: 400, message: 'User email can not be empty' })
}

export const validateLocation = (location: { lat: string, long: string}): void => {
    if (location.lat == null || location.long == null) throw new BadRequestError({ code: 400, message: 'Location lat and long can not be empty' })
}

export const User = (props: Partial<IUser>): Partial<IUser> => {
    validate(props)
    const { 
        name = 'Sample User',
        email,
        phone = '',
        profileImage,
        location = {
            address: '',
            country: '',
            state: '',
            city: '',
            zip: '',
            geo: undefined,
            lastSeenOn: undefined
        },
        about = '',
        social = {
            google: {},
            instagram: {},
            facebook: {},
            linkedin: {},
            twitter: {}
        },
        enabled = process.env.DISABLE_USER_ON_REGISTRATION !== 'true',
        role = 'user',
        publicProfile = false
    } = props
    const createdAt = new Date()
    return {
        name,
        email,
        phone,
        location,
        about,
        social,
        role,
        profileImage,
        enabled,
        publicProfile,
        createdAt: createdAt.toISOString(),
        deletedAt: null,
        updatedAt: null,
        version: 1
    }
}
