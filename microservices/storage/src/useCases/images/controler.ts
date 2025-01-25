import { ImagesService } from './service'
import { BunyanLogger } from 'logger'
import {BadRequestError} from 'library'
import {NextFunction, Response, Request} from 'microservice'

export class ImagesController {
    private readonly activity: { entity: string }
    private service: ImagesService
    private logger: BunyanLogger

    constructor ({ service, logger }: { service: ImagesService, logger: BunyanLogger }) {
        this.service = service
        this.logger = logger
        this.activity = {
            entity: 'image'
        }
    }

    // Retrieve an image by ID
    async getById (req: Request, res: Response, next: NextFunction): Promise<void> {
        const { imageId, workspaceId } = req.params // Change from carId to imageId
        try {
            const result = await this.service.retrieveById(imageId, workspaceId)
            res.json({ res: result })
        } catch (error) {
            this.logger.error('Error fetching image by ID', error)
            res.status(500).json({ error: 'Failed to retrieve image' })
        }
        next()
    }

    // Upload (insert) a new image
    async post (req: Request, res: Response, next: NextFunction): Promise<void> {
        const { workspaceId } = req.params // Change from carId to imageId
        const { fileName } = req.body
        const file = req.file // Multer will provide the uploaded file in req.file
        this.workspaceIdValidation(workspaceId)
        if (!file) {
            throw new BadRequestError({ message: 'No file uploaded' })
        }

        try {
            const result = await this.service.insert({
                fileName,
                buffer: file.buffer, // file.buffer contains the file data as a Buffer
                workspaceId
            })
            res.json({ res: result })
            res.locals.activity = { ...this.activity, action: 'create', data: { id: result.id } }
        } catch (error) {
            this.logger.error('Error uploading image', error)
            res.status(500).json({ error: 'Failed to upload image' })
        }
        next()
    }

    // Delete an image by ID
    async delete (req: Request, res: Response, next: NextFunction): Promise<void> {
        const { imageId, workspaceId } = req.params // Change from userId to imageId
        try {
            const result = await this.service.delete(imageId, workspaceId) // imageId passed directly
            res.json({ res: result })
            res.locals.activity = { ...this.activity, action: 'delete', data: { id: imageId } }
        } catch (error) {
            this.logger.error('Error deleting image', error)
            res.status(500).json({ error: 'Failed to delete image' })
        }
        next()
    }

    private workspaceIdValidation (workspaceId: string): void {
        if (!workspaceId) {
            throw new BadRequestError({ message: 'Missing workspaceId' })
        }
        if (workspaceId.length > 50) {
            throw new BadRequestError({ message: 'Invalid workspaceId' })
        }
        if (workspaceId.includes('/')) {
            throw new BadRequestError({ message: 'Invalid workspaceId' })
        }
    }
}
