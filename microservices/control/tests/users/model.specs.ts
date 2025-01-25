import { assert } from 'chai'
import { User } from '../../src/useCases/users/model'
import { BadRequestError } from 'library'

describe('User', () => {
    describe('validate', () => {
        it('should throw BadRequestError if email is \'null\'', () => {
            const user = { name: 'Sample User' }
            assert.throw(() => User(user), BadRequestError)
        })

        it('should not throw if email is not \'null\'', () => {
            const user = { name: 'Sample User', email: 'a@a.com' }
            assert.doesNotThrow(() => User(user), BadRequestError)
        })
    })

    describe('User', () => {
        it('should return a user with default values', () => {
            const user = User({ email: 'a@a.com' })
            assert.exists(user.name, 'name does not exist')
            assert.exists(user.email, 'email does not exist')
            assert.exists(user.phone, 'phone does not exist')
            assert.exists(user.location, 'location does not exist')
            assert.exists(user.about, 'about does not exist')
            assert.exists(user.role, 'role does not exist')
            assert.exists(user.createdAt, 'createdAt does not exist')
            assert.notExists(user.deletedAt, 'deletedAt should be null')
            assert.notExists(user.updatedAt, 'updatedAt should be null')
            assert.notExists(user.profileImage, 'profileImage should be null')
            assert.isFalse(user.publicProfile, 'publicProfile should be false when creating user')
            assert.exists(user.location?.zip)
            assert.exists(user.social?.google)
            assert.exists(user.location?.city)
            assert.exists(user.location?.state)
            assert.exists(user.social?.facebook)
            assert.exists(user.location?.address)
            assert.exists(user.location?.country)
            assert.exists(user.social?.instagram)
        })

        it('should return a user with the actual values', () => {
            const user = User({
                name: 'John Doe',
                email: 'johndoe@example.com',
                phone: '555-555-5555',
                location: {
                    address: '123 Main St.',
                    country: 'USA',
                    state: 'California',
                    city: 'Los Angeles',
                    zip: '90001',
                    geo: undefined,
                    lastSeenOn: undefined
                },
                profileImage: 'https://google.com/image.png',
                social: {
                    google: { id: '11111', token: '11111', url: 'asdasdas' },
                    instagram: {},
                    facebook: {}
                },
                enabled: true,
                publicProfile: false
            })

            const { createdAt, version, ...userToAssert } = user
            assert.deepEqual(userToAssert, {
                name: 'John Doe',
                email: 'johndoe@example.com',
                phone: '555-555-5555',
                location: {
                    address: '123 Main St.',
                    country: 'USA',
                    state: 'California',
                    city: 'Los Angeles',
                    zip: '90001',
                    geo: undefined,
                    lastSeenOn: undefined
                },
                about: '',
                social: {
                    google: { id: '11111', token: '11111', url: 'asdasdas' },
                    instagram: {},
                    facebook: {}
                },
                profileImage: 'https://google.com/image.png',
                role: 'user',
                deletedAt: null,
                updatedAt: null,
                enabled: true,
                publicProfile: false
            })
        })
    })
})
