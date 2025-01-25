import { ImagesRepository } from './repository'
import { BunyanLogger } from 'logger'
import { IImage } from 'api-client'
import sharp from 'sharp'
import fileType from 'file-type'
import {InsertImageDTO, DeleteImageDTO, RetrieveByIdDTO, FileImageTypes} from './types'
import {BadRequestError} from 'library'

export class ImagesService {
    private repository: ImagesRepository
    private logger: BunyanLogger

    constructor ({ repository, logger }: { repository: ImagesRepository, logger: BunyanLogger }) {
        this.repository = repository
        this.logger = logger
    }

    // Retrieve image by ID or with filters (if filters were implemented in the repository)
    async retrieveById (id: string, workspaceId: string): Promise<RetrieveByIdDTO> {
        try {
            return await this.repository.retrieveById({ id, workspaceId })
        } catch (error) {
            this.logger.error(`Error retrieving image with ID ${id}`, error)
            throw error
        }
    }

    // Insert (upload) a new image
    async insert (payload: InsertImageDTO): Promise<IImage> {
        try {
            // Convert to webp
            const type = await this.detectImageType(payload.buffer)
            switch (type) {
                case FileImageTypes.JPEG:
                case FileImageTypes.PNG:
                    payload.buffer = await this.optimizeImage(payload.buffer)
                    return await this.repository.insert(payload, 'webp')
                case FileImageTypes.WEBP:
                case FileImageTypes.GIF:
                    return await this.repository.insert(payload, type.split('image/')[1])
                default:
                    throw new Error(`Unsupported File Type ${type}`)
            }
        } catch (error) {
            this.logger.error('Error inserting new image', error)
            throw new BadRequestError()
        }
    }

    // Delete image by ID
    async delete (id: string, workspaceId: string): Promise<IImage[]> {
        try {
            const deletePayload: DeleteImageDTO = { id, workspaceId }
            return await this.repository.delete(deletePayload)
        } catch (error) {
            this.logger.error(`Error deleting image with ID ${id}`, error)
            throw error
        }
    }

    private async optimizeImage (buffer: Buffer): Promise<Buffer> {
        return sharp(buffer)
        .toFormat('webp', { quality: 80 })
        .withMetadata()
        .toBuffer()
    }

    private async detectImageType (buffer: Buffer): Promise<string | undefined> {
        const type = await fileType.fromBuffer(buffer)
        return type?.mime
    }
}
