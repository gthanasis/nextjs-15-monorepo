import sinon from 'sinon'
import { assert } from 'chai'
import { logger, persistence } from '../mocked'
import {ObjectID} from 'library'
import {UserRepository} from '../../src/useCases/users/repository'

describe('User Repository', () => {
    it('should create a simple mongo query if called with a simple field', () => {
        const spy = sinon.spy(persistence, 'query')
        const repo = new UserRepository({ logger, persistence })
        repo.retrieveWithFilter({
            order: {direction: null, order: null},
            pagination: {page: 0, pageSize: 0},
            query: { test: 'a' },
            search: null
        })
        const expected: any = {
            query: { test: 'a', deletedAt: null },
            table: 'users',
            order: { field: '_id', direction: 'asc' },
            pagination: { offset: -0, limit: 0 },
            'projection': {
                '_id': 1,
                'about': 1,
                'createdAt': 1,
                'email': 1,
                'enabled': 1,
                'location': 1,
                'name': 1,
                'phone': 1,
                'profileImage': 1,
                'publicProfile': 1,
                'role': 1,
                'social.facebook.url': 1,
                'social.instagram.url': 1,
                'social.linkedin.url': 1,
                'social.twitter.url': 1,
                'updatedAt': 1
            }
        }
        assert(spy.calledOnce)
        assert.deepEqual(spy.getCall(0).args[0], expected)
        spy.restore()
    })

    it('should transform social to dot notation', () => {
        const spy = sinon.spy(persistence, 'update')
        const repo = new UserRepository({ logger, persistence })
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
        const results = spy.getCall(0).args[0]
        const { updatedAt, ...rest } = results
        assert.deepEqual(rest, expected)
        spy.restore()
    })
})
