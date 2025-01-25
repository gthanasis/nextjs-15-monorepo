import { IImage } from 'api-client'
import { BunyanLogger } from 'logger'
import { Storage, StorageOptions } from '@google-cloud/storage'
import {DeleteImageDTO, InsertImageDTO, RetrieveByIdDTO} from './types'

export class ImagesRepository {
    private logger: BunyanLogger
    private storage: Storage
    private bucketName: string

    constructor ({ logger }: { logger: BunyanLogger }) {
        this.logger = logger
        this.bucketName = process.env.STORAGE_BUCKET_NAME as string
        // Initialize Google Cloud Storage with environment variables
        const privateKey = Buffer.from(process.env.STORAGE_GCP_PRIVATE_KEY || '', 'base64').toString('utf-8')
        this.storage = new Storage({
            projectId: process.env.STORAGE_GCP_PROJECT_ID, // Project ID from env
            credentials: {
                type: 'service_account',
                project_id: process.env.STORAGE_GCP_PROJECT_ID,
                private_key_id: process.env.STORAGE_GCP_PRIVATE_KEY_ID,
                private_key: privateKey,
                client_email: process.env.STORAGE_GCP_CLIENT_EMAIL,
                client_id: process.env.STORAGE_GCP_CLIENT_ID,
                token_uri: 'https://oauth2.googleapis.com/token',
                auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
                client_x509_cert_url: process.env.STORAGE_GCP_CLIENT_CERT_URL
            } as StorageOptions['credentials']
        })
    }

    // Generate a path with the workspaceId, e.g. "workspaceId/images"
    static getPath (workspaceId: string): string {
        const envPrefix = process.env.STORAGE_ENV_PREFIX || 'local'
        return `${envPrefix}/${workspaceId}/images`
    }

    // Use current timestamp as a prefix to ensure unique file names
    static generateFileId (extension: string): string {
        const timestamp = new Date().getTime()
        return `${timestamp}.${extension}`
    }

    async retrieveById ({ id, workspaceId }: { id: string, workspaceId: string }): Promise<RetrieveByIdDTO> {
        try {
            const bucket = this.storage.bucket(this.bucketName)
            const path = `${ImagesRepository.getPath(workspaceId)}/${id}`

            const file = bucket.file(path)

            // Check if file exists
            const [exists] = await file.exists()
            if (!exists) {
                throw new Error(`Image with ID ${id} not found at path ${path}.`)
            }

            // Get file metadata (acting as image info for this example)
            const [metadata] = await file.getMetadata()
            const image: IImage = {
                id: id,
                name: metadata.name,
                contentType: metadata.contentType,
                size: typeof metadata.size === 'string' ? parseInt(metadata.size) : metadata.size || 0,
                url: `https://storage.googleapis.com/${this.bucketName}/${path}`,
                createdAt: metadata.timeCreated
            }

            // Mocking pagination and count for simplicity
            const count = 1
            const pagination = { page: 1, pageSize: 1, filtered: 1 }

            return { image, count, pagination }
        } catch (error) {
            this.logger.error(`Failed to retrieve image by ID: ${id}`, error)
            throw error
        }
    }

    // Insert (Upload) a new image to Cloud Storage
    async insert (payload: InsertImageDTO, extension: string): Promise<IImage> {
        try {
            const { fileName, buffer, workspaceId } = payload
            if (!fileName || !buffer) {
                throw new Error('Missing required fields: fileName, buffer')
            }

            // Generate a unique file ID by prefixing the filename with a timestamp
            const id = ImagesRepository.generateFileId(extension)

            const bucket = this.storage.bucket(this.bucketName)
            const path = `${ImagesRepository.getPath(workspaceId)}/${id}`
            const file = bucket.file(path)

            // Upload the file to the bucket
            const res = await file.save(buffer, {
                contentType: extension,
                metadata: {
                    cacheControl: 'public, max-age=31536000'
                }
            })

            this.logger.info({ res }, `Image ${fileName} uploaded successfully to ${this.bucketName}`)

            // Returning the uploaded image details
            const image: IImage = {
                id: id, // Use the original file name for the user-facing ID
                name: fileName,
                contentType: extension,
                size: buffer.length,
                url: `https://storage.googleapis.com/${this.bucketName}/${path}`,
                createdAt: new Date().toISOString()
            }

            return image
        } catch (error) {
            this.logger.error('Failed to upload image', error)
            throw error
        }
    }

    // Delete an image by ID from Cloud Storage
    async delete ({ id, workspaceId }: DeleteImageDTO): Promise<IImage[]> {
        try {
            const bucket = this.storage.bucket(this.bucketName)
            const file = bucket.file(`${ImagesRepository.getPath(workspaceId)}/${id}`)

            // Check if file exists
            const [exists] = await file.exists()
            if (!exists) {
                throw new Error(`Image with ID ${id} not found.`)
            }

            // Delete the file
            await file.delete()
            this.logger.info(`Image ${id} deleted successfully from ${this.bucketName}`)

            return [] // Return any relevant metadata, or an empty array as needed
        } catch (error) {
            this.logger.error(`Failed to delete image by ID: ${id}`, error)
            throw error
        }
    }
}
