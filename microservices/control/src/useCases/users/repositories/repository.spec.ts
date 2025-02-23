// tests/userRepository.spec.ts
import { describe, it, expect, afterEach } from 'vitest'
import sinon from 'sinon'
import { ObjectID } from 'library'
import { UserRepository } from './repository'
import {logger, persistence} from '../../../utils/mocked'

describe('User Repository', () => {
    afterEach(() => {
        sinon.restore() // Reset all Sinon spies/stubs after each test
    })

    it('should create a simple MongoDB query if called with a simple field', () => {
        const repo = new UserRepository({ logger, persistence })
        const querySpy = sinon.stub(persistence, 'query').resolves([])
        const countSpy = sinon.stub(persistence, 'count').resolves(0)
        repo.retrieveWithFilter({
            order: { direction: null, order: null },
            pagination: { page: 0, pageSize: 0 },
            query: { test: 'a' },
            search: null
        })

        const expected: any = {
            query: { test: 'a', deletedAt: null },
            table: 'users',
            order: { field: '_id', direction: 'asc' },
            pagination: { offset: -0, limit: 0 },
            projection: {
                _id: 1,
                about: 1,
                createdAt: 1,
                email: 1,
                enabled: 1,
                location: 1,
                name: 1,
                phone: 1,
                profileImage: 1,
                publicProfile: 1,
                role: 1,
                'social.facebook.url': 1,
                'social.instagram.url': 1,
                'social.linkedin.url': 1,
                'social.twitter.url': 1,
                updatedAt: 1
            }
        }

        expect(querySpy.calledOnce).toBe(true)
        expect(querySpy.getCall(0).args[0]).toEqual(expected)

        querySpy.restore()
    })

    it('should transform social attributes to dot notation', () => {
        const repo = new UserRepository({ logger, persistence })
        const updateSpy = sinon.stub(persistence, 'update').resolves([])
        repo.update({
            filters: { id: ObjectID() },
            attrs: {
                social: {
                    facebook: { url: 'a' },
                    instagram: { url: 'a' },
                    linkedin: { url: 'a' },
                    twitter: { url: 'a' }
                }
            }
        })

        const expected: any = {
            'social.facebook.url': 'a',
            'social.instagram.url': 'a',
            'social.linkedin.url': 'a',
            'social.twitter.url': 'a'
        }

        const results = updateSpy.getCall(0).args[0]
        const { updatedAt, ...rest } = results

        expect(rest).toEqual(expected)
        updateSpy.restore()
    })
})
