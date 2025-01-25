import 'mocha'
import { assert } from 'chai'
import {MongoDbPersistence, DateQueryParams, RangeQueryParams, ObjectID} from '../src'
import {MongoNetworkError} from 'mongodb'
import {stub} from 'sinon'

describe('MongoDbPersistence Class', () => {
    describe('translateDateQuery function', () => {
        it('should return a range query when both fromDate and toDate are provided', function () {
            const props = { fromDate: '2021-09-01', toDate: '2021-09-30', field: 'createdAt' }
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateDateQuery(props)
            const expected = {
                createdAt: {
                    $gte: new Date('2021-09-01'),
                    $lte: new Date('2021-09-30')
                }
            }
            assert.deepEqual(result, expected)
        })

        it('should return a range query when only fromDate is provided', function () {
            const props: DateQueryParams = { fromDate: '2021-09-01', field: 'createdAt', toDate: null }
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateDateQuery(props)
            const expected = {
                createdAt: {
                    $gte: new Date('2021-09-01')
                }
            }
            assert.deepEqual(result, expected)
        })

        it('should return a range query when only toDate is provided', function () {
            const props: DateQueryParams = { toDate: '2021-09-30', field: 'createdAt', fromDate: null }
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateDateQuery(props)
            const expected = {
                createdAt: {
                    $lte: new Date('2021-09-30')
                }
            }
            assert.deepEqual(result, expected)
        })
    })
    describe('resolveId function', () => {
        it('should convert _id to id', function () {
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const obj = { _id: '123', name: 'Test' }
            const result = persistence.resolveId(obj)
            const expected = { id: '123', name: 'Test' }
            assert.deepEqual(result, expected)
        })

        it('should leave other fields unchanged', function () {
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const obj = { _id: '123', name: 'Alice', email: 'alice@example.com' }
            const result = persistence.resolveId(obj)
            const expected = { id: '123', name: 'Alice', email: 'alice@example.com' }
            assert.deepEqual(result, expected)
        })
    })
    describe('translateRangeQuery function', () => {
        it('should return empty object when given no query params', function () {
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateQuery({})
            assert.deepStrictEqual(result, {})
        })

        it('should translate id to _id and convert to ObjectID when given a single value', function () {
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateQuery({ id: '6153e3ab7bb12f520144731d' })
            assert.deepStrictEqual(result, { _id: ObjectID('6153e3ab7bb12f520144731d') })
        })

        it('should translate id to _id and convert to ObjectID when given an array of values', function () {
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateQuery({ id: ['6153e3ab7bb12f520144732d', '6153e3ab7bb12f520144731d'] })
            assert.deepStrictEqual(result, { _id: { $in: [ObjectID('6153e3ab7bb12f520144732d'), ObjectID('6153e3ab7bb12f520144731d')] } })
        })

        it('should translate any other field to itself when given a single value', function () {
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateQuery({ name: 'Alice' })
            assert.deepStrictEqual(result, { name: 'Alice' })
        })

        it('should translate any other field to itself when given an array of values', function () {
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateQuery({ name: ['Alice', 'Bob'] })
            assert.deepStrictEqual(result, { name: { $in: ['Alice', 'Bob'] } })
        })

        it('should add a $text search operator when given a search parameter', function () {
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateQuery({ name: 'Alice' }, 'Bob')
            assert.deepStrictEqual(result, { name: 'Alice', $text: { $search: 'Bob' } })
        })

        it('should return a range query when both from and to are provided', function () {
            const props: RangeQueryParams = { from: '10', to: '20', field: 'price', mapper: Number }
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateRangeQuery(props)
            const expected = {
                price: {
                    $gte: 10,
                    $lte: 20
                }
            }
            assert.deepEqual(result, expected)
        })

        it('should return a range query when only from is provided', function () {
            const props: RangeQueryParams = { from: '10', field: 'price', mapper: Number, to: null }
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateRangeQuery(props)
            const expected = {
                price: {
                    $gte: 10
                }
            }
            assert.deepEqual(result, expected)
        })

        it('should return a range query when only to is provided', function () {
            const props: RangeQueryParams = { to: '20', field: 'price', mapper: Number, from: null }
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateRangeQuery(props)
            const expected = {
                price: {
                    $lte: 20
                }
            }
            assert.deepEqual(result, expected)
        })
    })
    describe('getPagination function', () => {
        it('should return the correct offset and limit when page and pageSize are 1 and 10, respectively', function () {
            const props = { page: 1, pageSize: 10 }
            const expected = { offset: 0, limit: 10 }
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.getPagination(props)
            assert.deepEqual(result, expected)
        })

        it('should return the correct offset and limit when page is 2 and pageSize is 5', function () {
            const props = { page: 2, pageSize: 5 }
            const expected = { offset: 5, limit: 5 }
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.getPagination(props)
            assert.deepEqual(result, expected)
        })

        it('should return the correct offset and limit when page is 10 and pageSize is 50', function () {
            const props = { page: 10, pageSize: 50 }
            const expected = { offset: 450, limit: 50 }
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.getPagination(props)
            assert.deepEqual(result, expected)
        })
    })
    describe('translateGeoWithinQuery function', () => {
        it('should return the correct query when given a single point', function () {
            const props = { lat: 1, lng: 2, radius: 3, field: 'location' }
            const calculatedRadians = props.radius / MongoDbPersistence.EARTH_RADIUS_IN_KILOMETERS
            const expected = { [props.field]: { $geoWithin: { $centerSphere: [[props.lng, props.lat], calculatedRadians] } } }
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const result = persistence.translateGeoWithinQuery(props)
            assert.deepEqual(result, expected)
        })
    })
    describe('close function', () => {
        it('should reconnect if MongoNetworkError and not connecting', async function () {
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const networkError = new MongoNetworkError('Mock network error')
            const connectStub = stub(persistence, 'connect').resolves()

            await persistence.close(networkError)

            // wait for 6000ms
            setTimeout(() => {
                assert.isTrue(connectStub.calledOnce)
                connectStub.restore()
            }, 6000)
        })

        it('should not reconnect if the error is not a MongoNetworkError', async function () {
            const persistence = new MongoDbPersistence({ connectionString: 'mongodb://test-mongo:27017' })
            const genericError = new Error('Generic error')
            const connectStub = stub(persistence, 'connect').resolves()

            await persistence.close(genericError)

            assert.isFalse(connectStub.called)

            connectStub.restore()
        })
    })
})
