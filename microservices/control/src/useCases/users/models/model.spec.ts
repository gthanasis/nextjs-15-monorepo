import { describe, it, expect } from 'vitest'
import { BadRequestError } from 'library'
import { User } from './model'

describe('User', () => {
    describe('validate', () => {
        it("should throw BadRequestError if email is 'null'", () => {
            const user = { name: 'Sample User' }
            expect(() => User(user)).toThrow(BadRequestError)
        })

        it("should not throw if email is not 'null'", () => {
            const user = { name: 'Sample User', email: 'a@a.com' }
            expect(() => User(user)).not.toThrow(BadRequestError)
        })
    })

    describe('User', () => {
        it('should return a user with default values', () => {
            const user = User({ email: 'a@a.com' })

            expect(user.name).toBeDefined()
            expect(user.email).toBeDefined()
            expect(user.phone).toBeDefined()
            expect(user.location).toBeDefined()
            expect(user.about).toBeDefined()
            expect(user.role).toBeDefined()
            expect(user.createdAt).toBeDefined()
            expect(user.deletedAt).toBeNull()
            expect(user.updatedAt).toBeNull()
            expect(user.profileImage).toBeUndefined()
            expect(user.publicProfile).toBe(false)

            // Location & Social checks
            expect(user.location?.zip).toBeDefined()
            expect(user.social?.google).toBeDefined()
            expect(user.location?.city).toBeDefined()
            expect(user.location?.state).toBeDefined()
            expect(user.social?.facebook).toBeDefined()
            expect(user.location?.address).toBeDefined()
            expect(user.location?.country).toBeDefined()
            expect(user.social?.instagram).toBeDefined()
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

            expect(userToAssert).toEqual({
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
