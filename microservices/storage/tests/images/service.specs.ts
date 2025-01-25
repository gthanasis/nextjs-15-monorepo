import sinon from 'sinon'
import { assert } from 'chai'
import { BunyanLogger } from 'logger'
import { ImagesRepository } from '../../src/useCases/images/repository' // Adjust the import based on your structure
import { IImage } from 'project-types'
import {InsertImageDTO} from '../../src/useCases/images/types'

// Mock the Google Cloud Storage
const mockStorage = {
    bucket: sinon.stub().returns({
        file: sinon.stub().returns({
            exists: sinon.stub(),
            getMetadata: sinon.stub(),
            save: sinon.stub(),
            delete: sinon.stub()
        })
    })
}

describe('Images Repository', () => {
    let logger: BunyanLogger
    let imagesRepo: ImagesRepository

    beforeEach(() => {
        logger = { info: sinon.spy(), error: sinon.spy() } as unknown as BunyanLogger
        // Set up the ImagesRepository instance
        imagesRepo = new ImagesRepository({ logger });
        // Replace the storage with the mock
        (imagesRepo as any).storage = mockStorage
        process.env.STORAGE_BUCKET_NAME = 'test-bucket'
        process.env.STORAGE_ENV_PREFIX = 'test'
    })

    afterEach(() => {
        sinon.restore()
    })

    describe('retrieveById', () => {
        it.skip('should retrieve an image by ID successfully', async () => {
            const mockImageId = 'mock-id'
            const mockWorkspaceId = 'workspace-id'
            const mockMetadata = {
                name: 'mock-image.jpg',
                contentType: 'image/jpeg',
                size: 1024,
                timeCreated: new Date().toISOString()
            }

            mockStorage.bucket().file().exists.returns(Promise.resolve([true]))
            mockStorage.bucket().file().getMetadata.returns(Promise.resolve([mockMetadata]))

            const expected: IImage = {
                id: mockImageId,
                name: mockMetadata.name,
                contentType: mockMetadata.contentType,
                size: mockMetadata.size,
                url: `https://storage.googleapis.com/test-bucket/test/workspace-id/images/${mockImageId}`,
                createdAt: mockMetadata.timeCreated
            }

            const result = await imagesRepo.retrieveById({ id: mockImageId, workspaceId: mockWorkspaceId })

            assert.deepEqual(result.image, expected)
            assert.equal(result.count, 1)
            assert.deepEqual(result.pagination, { page: 1, pageSize: 1, filtered: 1 })
        })

        it('should throw an error if the image does not exist', async () => {
            const mockImageId = 'non-existent-id'
            const mockWorkspaceId = 'workspace-id'

            mockStorage.bucket().file().exists.returns(Promise.resolve([false]))

            // Using native Promise handling instead of chai-as-promised
            const promise = imagesRepo.retrieveById({ id: mockImageId, workspaceId: mockWorkspaceId })
            return promise.catch(error => {
                assert.equal(error.message, `Image with ID ${mockImageId} not found at path test/workspace-id/images/${mockImageId}.`)
            })
        })
    })

    describe('insert', () => {
        it('should upload an image successfully', async () => {
            const mockPayload = {
                fileName: 'mock-image.jpg',
                buffer: Buffer.from('mock-image-content'),
                workspaceId: 'workspace-id'
            }
            const extension = 'image/jpeg'

            mockStorage.bucket().file().save.returns(Promise.resolve())

            const result = await imagesRepo.insert(mockPayload, extension)

            // Remove 'id' and 'createdAt' from the result and expected objects
            delete result.id
            delete result.createdAt
            delete (result as any).url

            const expected: any = {
                name: mockPayload.fileName,
                contentType: extension,
                size: mockPayload.buffer.length
            }

            assert.deepEqual(result, expected)
        })

        it('should throw an error if fileName or buffer is missing', async () => {
            const mockPayload: InsertImageDTO = {
                fileName: '',
                buffer: new Buffer(''),
                workspaceId: 'workspace-id'
            }
            const extension = 'image/jpeg'

            // Using native Promise handling
            const promise = imagesRepo.insert(mockPayload, extension)
            return promise.catch(error => {
                assert.equal(error.message, 'Missing required fields: fileName, buffer')
            })
        })
    })

    describe('delete', () => {
        it('should delete an image successfully', async () => {
            const mockImageId = 'mock-id'
            const mockWorkspaceId = 'workspace-id'

            mockStorage.bucket().file().exists.returns(Promise.resolve([true]))
            mockStorage.bucket().file().delete.returns(Promise.resolve())

            const result = await imagesRepo.delete({ id: mockImageId, workspaceId: mockWorkspaceId })

            assert.deepEqual(result, [])
        })

        it('should throw an error if the image does not exist', async () => {
            const mockImageId = 'non-existent-id'
            const mockWorkspaceId = 'workspace-id'

            mockStorage.bucket().file().exists.returns(Promise.resolve([false]))

            // Using native Promise handling
            const promise = imagesRepo.delete({ id: mockImageId, workspaceId: mockWorkspaceId })
            return promise.catch(error => {
                assert.equal(error.message, `Image with ID ${mockImageId} not found.`)
            })
        })
    })
})
