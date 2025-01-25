import {IUser as UserModel, IUserPublicProfile, WithLodashID} from 'api-client'
import {BunyanLogger} from 'logger'
import {MongoDbPersistence, MongoQueryOptions, ObjectID} from 'library'
import {RetrieveWithFilterProps} from '../../types/common'

type IUser = WithLodashID<UserModel>

export class UserRepository {
    private persistence: MongoDbPersistence
    private readonly table: string
    private logger: BunyanLogger
    private publicProfileProjection: Record<any, any>

    constructor ({ persistence, logger }: {persistence: MongoDbPersistence, logger: BunyanLogger}) {
        this.persistence = persistence
        this.logger = logger
        this.table = 'users'
        this.publicProfileProjection = {
            _id: 1,
            name: 1,
            email: 1,
            phone: 1,
            location: 1,
            about: 1,
            'social.facebook.url': 1,
            'social.instagram.url': 1,
            'social.twitter.url': 1,
            'social.linkedin.url': 1,
            role: 1,
            profileImage: 1,
            publicProfile: 1,
            enabled: 1,
            createdAt: 1,
            updatedAt: 1
        }
    }

    async retrieveWithFilter ({ query, pagination, order, search }: RetrieveWithFilterProps<UserModel>): Promise<{ users: IUserPublicProfile[], count: number, pagination: { page: number, pageSize: number, filtered: number } }> {
        // here we normalize filters
        const filters = { ...this.extractFilters({ query, search }), ...{ deletedAt: null } }
        const mongoPagination = this.persistence.getPagination(pagination)
        const mongoOrder: MongoQueryOptions<IUser>['order'] = {
            field: order.order ? order.order : '_id',
            direction: order.direction ? order.direction : 'asc'
        }

        const results = await this.persistence.query<IUser>({
            table: this.table,
            query: filters,
            order: mongoOrder,
            pagination: mongoPagination,
            projection: this.publicProfileProjection
        })
        const count = await this.persistence.count<IUser>({
            query: filters,
            table: this.table,
            pagination: undefined,
            order: mongoOrder
        })
        return {
            users: results.map((user) => this.persistence.resolveId<IUser>(user)),
            count: count,
            pagination: { page: pagination.page, pageSize: pagination.pageSize, filtered: results.length }
        }
    }

    async retrieveByIds (ids: string[], query: any): Promise<IUserPublicProfile[]> {
        const results = await this.persistence.query<IUser>({
            table: this.table,
            query: { _id: { $in: ids.map(ObjectID) }, ...query },
            projection: this.publicProfileProjection
        })
        return results.map((user) => this.persistence.resolveId<IUserPublicProfile>(user))
    }

    async emailExists (email: string): Promise<boolean> {
        const results = await this.persistence.query<IUser>({
            table: this.table,
            query: { email: email },
            projection: this.publicProfileProjection
        })
        return results.length > 0
    }

    async insert (payload: Partial<IUser>): Promise<IUserPublicProfile> {
        const user = await this.persistence.create<IUser>(this.toDB(payload), this.table, this.publicProfileProjection)
        return this.persistence.resolveId<IUser>(user)
    }

    async update ({ filters, attrs }: any): Promise<IUserPublicProfile[]> {
        attrs['updatedAt'] = new Date()
        delete attrs['createdAt']
        delete attrs['deletedAt']

        // Email should not be able to be update so the Google login doesn't break
        delete attrs['email']

        if (attrs['social']) {
            const socialObject = { ...attrs['social'] }
            delete attrs['social']
            for (const key in socialObject) {
                // Check if the social network has a URL to update
                if (socialObject[key].url) {
                    attrs[`social.${key}.url`] = socialObject[key].url
                }
            }
        }

        const updateFilters = { 
            ...this.extractFilters({ query: filters, search: null, fromDate: null, toDate: null }), 
            ...{ deletedAt: null } 
        }
        // TODO: use updateMany and update with atomic ops (eg. { $set: {}, $pull: {} })
        const users = await this.persistence.update<IUser>(
            attrs, this.toDB(updateFilters),
            this.table, 
            this.publicProfileProjection
        )
        return users.map((user) => this.persistence.resolveId<IUser>(user))
    }

    async delete (userId: string): Promise<IUserPublicProfile[]> {
        const updateFilters = { ...this.extractFilters({ query: { id: userId }, ...{ deletedAt: null } }) }
        // TODO: use updateMany and update with atomic ops (eg. { $set: {}, $pull: {} })
        const users = await this.persistence.update<IUserPublicProfile>(
            this.toDB({
                deletedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }), 
            updateFilters,
            this.table, 
            this.publicProfileProjection
        )
        return users.map((user) => this.persistence.resolveId<IUserPublicProfile>(user))
    }

    private extractFilters ({ query, search }: any) {
        // if (query['budget.amount'] !== undefined) query['budget.amount'] = parseFloat(query['budget.amount'])

        const normalizedFilters = this.persistence.translateQuery(query, search)
        // const budgetFilters = this.persistence.translateRangeQuery({ from: query['budget.amount.from'], to: query['budget.amount.to'], field: 'budget.amount', mapper: parseFloat })
        // const capacityFilters = this.persistence.translateRangeQuery({ from: query['preferences.capacity.from'], to: query['preferences.capacity.to'], field: 'preferences.capacity', mapper: parseInt })

        return {
            ...normalizedFilters
        }
    }

    private toDB (user: any) {
        // if createdAt, updatedAt, deleteAt are defined, we need to convert them to date
        if (user.createdAt) user.createdAt = new Date(user.createdAt)
        if (user.updatedAt) user.updatedAt = new Date(user.updatedAt)
        if (user.deletedAt) user.deletedAt = new Date(user.deletedAt)
        return user
    }
}
