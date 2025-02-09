import { describe, it, expect, beforeEach, afterEach } from "vitest";
import sinon from "sinon";
import { BunyanLogger } from "logger";
import { ImagesRepository } from "../repositories/repository";

// Mock the Google Cloud Storage
const mockStorage = {
    bucket: sinon.stub().returns({
        file: sinon.stub().returns({
            exists: sinon.stub(),
            getMetadata: sinon.stub(),
            save: sinon.stub(),
            delete: sinon.stub(),
        }),
    }),
};

describe("Images Repository", () => {
    let logger: BunyanLogger;
    let imagesRepo: ImagesRepository;

    beforeEach(() => {
        logger = { info: sinon.spy(), error: sinon.spy() } as unknown as BunyanLogger;
        imagesRepo = new ImagesRepository({ logger });

        // Replace storage with mock
        (imagesRepo as any).storage = mockStorage;
        process.env.STORAGE_BUCKET_NAME = "test-bucket";
        process.env.STORAGE_ENV_PREFIX = "test";
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("retrieveById", () => {
        it.skip("should retrieve an image by ID successfully", async () => {
            const mockImageId = "mock-id";
            const mockWorkspaceId = "workspace-id";
            const mockMetadata = {
                name: "mock-image.jpg",
                contentType: "image/jpeg",
                size: 1024,
                timeCreated: new Date().toISOString(),
            };

            mockStorage.bucket().file().exists.resolves([true]);
            mockStorage.bucket().file().getMetadata.resolves([mockMetadata]);

            const expected = {
                id: mockImageId,
                name: mockMetadata.name,
                contentType: mockMetadata.contentType,
                size: mockMetadata.size,
                url: `https://storage.googleapis.com/test-bucket/test/workspace-id/images/${mockImageId}`,
                createdAt: mockMetadata.timeCreated,
            };

            const result = await imagesRepo.retrieveById({ id: mockImageId, workspaceId: mockWorkspaceId });

            expect(result.image).toEqual(expected);
            expect(result.count).toBe(1);
            expect(result.pagination).toEqual({ page: 1, pageSize: 1, filtered: 1 });
        });

        it("should throw an error if the image does not exist", async () => {
            const mockImageId = "non-existent-id";
            const mockWorkspaceId = "workspace-id";

            mockStorage.bucket().file().exists.resolves([false]);

            await expect(imagesRepo.retrieveById({ id: mockImageId, workspaceId: mockWorkspaceId }))
            .rejects.toThrowError(`Image with ID ${mockImageId} not found at path test/workspace-id/images/${mockImageId}.`);
        });
    });

    describe("insert", () => {
        it("should upload an image successfully", async () => {
            const mockPayload = {
                fileName: "mock-image.jpg",
                buffer: Buffer.from("mock-image-content"),
                workspaceId: "workspace-id",
            };
            const extension = "image/jpeg";

            mockStorage.bucket().file().save.resolves();

            const result = await imagesRepo.insert(mockPayload, extension);

            // Remove 'id' and 'createdAt' from the result and expected objects
            delete result.id;
            delete result.createdAt;
            delete (result as any).url;

            const expected = {
                name: mockPayload.fileName,
                contentType: extension,
                size: mockPayload.buffer.length,
            };

            expect(result).toEqual(expected);
        });

        it("should throw an error if fileName or buffer is missing", async () => {
            const mockPayload = {
                fileName: "",
                buffer: Buffer.alloc(0),
                workspaceId: "workspace-id",
            };
            const extension = "image/jpeg";

            await expect(imagesRepo.insert(mockPayload, extension))
            .rejects.toThrowError("Missing required fields: fileName, buffer");
        });
    });

    describe("delete", () => {
        it("should delete an image successfully", async () => {
            const mockImageId = "mock-id";
            const mockWorkspaceId = "workspace-id";

            mockStorage.bucket().file().exists.resolves([true]);
            mockStorage.bucket().file().delete.resolves();

            const result = await imagesRepo.delete({ id: mockImageId, workspaceId: mockWorkspaceId });

            expect(result).toEqual([]);
        });

        it("should throw an error if the image does not exist", async () => {
            const mockImageId = "non-existent-id";
            const mockWorkspaceId = "workspace-id";

            mockStorage.bucket().file().exists.resolves([false]);

            await expect(imagesRepo.delete({ id: mockImageId, workspaceId: mockWorkspaceId }))
            .rejects.toThrowError(`Image with ID ${mockImageId} not found.`);
        });
    });
});
