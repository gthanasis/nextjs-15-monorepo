import {GeoPoint} from './generic'

type SocialProviderData = {
    url?: string
    id?: string
    token?: string
}

type Location = {
    address: string
    country: string
    state: string
    city: string
    zip: string
    geo?: {
        point: GeoPoint
    }
    lastSeenOn?: {
        point: GeoPoint
    }
}

export class IUser {
    id: string
    name: string
    email: string
    phone: string
    profileImage?: string
    location: Location
    about: string
    settings: Record<string,any>
    impersonated?: boolean
    social: {
        google?: SocialProviderData
        instagram?: SocialProviderData
        facebook?: SocialProviderData
        linkedin?: SocialProviderData
        twitter?: SocialProviderData
    }
    role: 'user' | 'admin'
    enabled: boolean
    publicProfile: boolean
    createdAt: string
    updatedAt: string | null
    deletedAt: string | null
    version: number
    // extra
    meta?: Record<string, unknown>
}

export type IUserPublicProfile = Pick<InstanceType<typeof IUser>,
  'id'
  | 'name'
  | 'email'
  | 'phone'
  | 'location'
  | 'about'
  | 'social'
  | 'role'
  | 'profileImage'
  | 'publicProfile'
  | 'enabled'
  | 'createdAt'
  | 'updatedAt'
  | 'meta'
  | 'impersonated'
>

export type CreateUserDto = Omit<InstanceType<typeof IUser>,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
    | 'deletedAt'
    | 'version'
    | 'enabled'
    | 'impersonated'
> & {
    // Override any fields that should be optional during creation
    profileImage?: string
    settings?: Record<string, any>
    social?: {
        google?: SocialProviderData
        instagram?: SocialProviderData
        facebook?: SocialProviderData
        linkedin?: SocialProviderData
        twitter?: SocialProviderData
    }
}

export type UpdateUserDto = Partial<Omit<CreateUserDto, 'role'>> & {
    id: string
}
