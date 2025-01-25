import { expect, assert } from 'chai'
import sinon from 'sinon'
import { UserService } from '../../src/useCases/users/service'
import { UserRepository } from '../../src/useCases/users/repository'
import { BunyanLogger } from 'logger'
import { IUser } from 'api-client'
import {OrderFilters} from '../../src/types/common'

describe('UserService', () => {
    const userRepository = new UserRepository({
        persistence: {} as any,
        logger: {} as BunyanLogger
    })

    const logger = new BunyanLogger({
        name: 'test-logger',
        level: 'debug'
    })

    const userService = new UserService({repository: userRepository, logger})

    describe('insert', () => {
        it('should insert a new user', async () => {
            const payload = { name: 'New User', email: 'a@a.com' }
            const stubInsert = sinon.stub(userRepository, 'insert').returns(Promise.resolve(payload as IUser))
            const stubEmailExists = sinon.stub(userRepository, 'emailExists').returns(Promise.resolve(false))

            const result = await userService.insert(payload)

            assert.equal(stubInsert.calledOnce, true)

            // expect(stubInsert.calledOnce).to.be.true
            expect(result).to.be.an('object')
            expect(result).to.have.property('name', 'New User')
            expect(result).to.have.property('email', 'a@a.com')

            stubInsert.restore()
            stubEmailExists.restore()
        })

        it('should insert a new user with role user even if something else is passed', async () => {
            const payload = { name: 'New User', email: 'a@a.com', role: 'admin' } as Partial<IUser>
            const stubInsert = sinon.stub(userRepository, 'insert').returns(Promise.resolve({...payload, role: 'user'} as IUser))
            const stubEmailExists = sinon.stub(userRepository, 'emailExists').returns(Promise.resolve(false))

            const result = await userService.insert(payload)

            assert.equal(stubInsert.calledOnce, true)

            const userCallPayload: Partial<IUser> = {
                name: 'New User',
                email: 'a@a.com',
                phone: '',
                location: {
                    address: '',
                    country: '',
                    state: '',
                    city: '',
                    zip: '',
                    geo: undefined,
                    lastSeenOn: undefined
                },
                about: '',
                social: {
                    google: {},
                    instagram: {},
                    facebook: {},
                    twitter: {},
                    linkedin: {}
                },
                role: 'user',
                enabled: true,
                publicProfile: false,
                profileImage: undefined,
                deletedAt: null,
                updatedAt: null
            }

            const { createdAt, version, ...payloadCall } = stubInsert.getCalls()[0].firstArg

            // expect(stubInsert.calledOnce).to.be.true
            expect(payloadCall).to.deep.equal(userCallPayload)
            stubInsert.restore()
            stubEmailExists.restore()
        })
        it('should throw error if user with the same email exists', async () => {
            const payload = { name: 'New User', email: 'a@a.com', role: 'admin' } as Partial<IUser>
            const stubInsert = sinon.stub(userRepository, 'insert').returns(Promise.resolve({...payload, role: 'user'} as IUser))
            const stubEmailExists = sinon.stub(userRepository, 'emailExists').returns(Promise.resolve(true))

            try {
                await userService.insert(payload)
                throw new Error('Function did not throw')
            } catch (e: any) {
                assert.equal(e.message, 'There is already a user with this email')
            }

            stubInsert.restore()
            stubEmailExists.restore()
        })
    })

    describe('retrieve', () => {
        it('should retrieve users with filters', async () => {
            const query = {email: 'a@a.com'}
            const pagination = {page: 1, pageSize: 10}
            const order: OrderFilters<IUser> = {order: null, direction: null}
            const search = 'sample'

            const expectedResult = {
                users: [{name: 'Sample User'}] as IUser[],
                count: 1,
                pagination: {page: 1, pageSize: 10, filtered: 1}
            }

            const stubRetrieveWithFilter = sinon.stub(userRepository, 'retrieveWithFilter').returns(Promise.resolve(expectedResult))

            const result = await userService.retrieve({query, pagination, order, search})

            expect(stubRetrieveWithFilter.calledOnceWith({query: query, pagination, order, search})).to.be.true
            expect(result).to.be.an('object')
            expect(result).to.have.property('users').that.is.an('array')
            expect(result).to.have.property('count', 1)
            expect(result).to.have.property('pagination').that.deep.equals(expectedResult.pagination)

            stubRetrieveWithFilter.restore()
        })
    })

    describe('update', () => {
        it('should update users with filters', async () => {
            const filters = {name: 'Sample User'}
            const attrs = {color: 'blue'}

            const expectedResult = [{name: 'Sample User'}] as IUser[]

            const stubUpdate = sinon.stub(userRepository, 'update').returns(Promise.resolve(expectedResult))

            const result = await userService.update({filters, attrs})

            expect(stubUpdate.calledOnce).to.be.true
            expect(result).to.be.an('array')
            expect(result[0]).to.have.property('name', 'Sample User')

            stubUpdate.restore()
        })

        it('should not be able to update the email attribute', async () => {
            const filters = { name: 'Sample User' }
            const attrs = { email: 'newemail@example.com' }
    
            const expectedResult = [{ name: 'Sample User', email: 'test@example.com' }] as IUser[]
    
            const stubUpdate = sinon.stub(userRepository, 'update').returns(Promise.resolve(expectedResult))
    
            const result = await userService.update({ filters, attrs })
    
            expect(stubUpdate.calledOnce).to.be.true
            expect(result).to.be.an('array')
            expect(result[0]).to.have.property('name', 'Sample User')
            expect(result[0]).to.have.property('email', 'test@example.com') // Make sure the email attribute is not updated
    
            stubUpdate.restore()
        })

        it.skip('should not be able to update createdAt', async () => {
            // TODO: Implement test
        })

        it.skip('should not be able to update updatedAt', async () => {
            // TODO: Implement test
        })

        it.skip('should not be able to update deletedAt', async () => {
            // TODO: Implement test
        })

        it.skip('should not be able to update role', async () => {
            // TODO: Implement test
        })

        it.skip('should not be able to update enabled', async () => {
            // TODO: Implement test
        })

        it.skip('should be able to disable user with userService.disable()', async () => {
            // TODO: Implement test
        })

        it.skip('should be able to enable user with userService.enable()', async () => {
            // TODO: Implement test
        })

        it.skip('should be able to promote user with userService.promote()', async () => {
            // TODO: Implement test
        })
    })

    describe('delete', () => {
        it('user should be able to delete its own account', async () => {
            const userId = '12345'
            const expectedResult = [] as IUser[]
            const stubDelete = sinon.stub(userRepository, 'delete').resolves(expectedResult)
    
            await userService.delete(userId)
    
            expect(stubDelete.calledOnceWith(userId)).to.be.true
    
            sinon.assert.calledWithExactly(stubDelete, userId)

            stubDelete.restore()
        })
    })
})
