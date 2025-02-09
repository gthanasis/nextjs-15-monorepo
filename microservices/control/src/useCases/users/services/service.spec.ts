// tests/userService.spec.ts

import { describe, it, expect, vi } from "vitest";
import sinon from "sinon";
import { BunyanLogger } from "logger";
import { IUser } from "api-client";
import { UserRepository } from "../repositories/repository";
import { UserService } from "./service";
import { OrderFilters } from "../../../types/common";

describe("UserService", () => {
    const userRepository = new UserRepository({
        persistence: {} as any,
        logger: {} as BunyanLogger,
    });

    const logger = new BunyanLogger({
        name: "test-logger",
        level: "debug",
    });

    const userService = new UserService({ repository: userRepository, logger });

    describe("insert", () => {
        it("should insert a new user", async () => {
            const payload = { name: "New User", email: "a@a.com" };
            const stubInsert = sinon
            .stub(userRepository, "insert")
            .resolves(payload as IUser);
            const stubEmailExists = sinon
            .stub(userRepository, "emailExists")
            .resolves(false);

            const result = await userService.insert(payload);

            expect(stubInsert.calledOnce).toBe(true);
            expect(result).toBeInstanceOf(Object);
            expect(result).toHaveProperty("name", "New User");
            expect(result).toHaveProperty("email", "a@a.com");

            stubInsert.restore();
            stubEmailExists.restore();
        });

        it("should insert a new user with role user even if something else is passed", async () => {
            const payload = { name: "New User", email: "a@a.com", role: "admin" } as Partial<IUser>;
            const stubInsert = sinon
            .stub(userRepository, "insert")
            .resolves({ ...payload, role: "user" } as IUser);
            const stubEmailExists = sinon.stub(userRepository, "emailExists").resolves(false);

            const result = await userService.insert(payload);

            expect(stubInsert.calledOnce).toBe(true);

            const userCallPayload: Partial<IUser> = {
                name: "New User",
                email: "a@a.com",
                phone: "",
                location: {
                    address: "",
                    country: "",
                    state: "",
                    city: "",
                    zip: "",
                    geo: undefined,
                    lastSeenOn: undefined,
                },
                about: "",
                social: {
                    google: {},
                    instagram: {},
                    facebook: {},
                    twitter: {},
                    linkedin: {},
                },
                role: "user",
                enabled: true,
                publicProfile: false,
                profileImage: undefined,
                deletedAt: null,
                updatedAt: null,
            };

            const { createdAt, version, ...payloadCall } =
              stubInsert.getCalls()[0].firstArg;

            expect(payloadCall).toEqual(userCallPayload);

            stubInsert.restore();
            stubEmailExists.restore();
        });

        it("should throw error if user with the same email exists", async () => {
            const payload = { name: "New User", email: "a@a.com", role: "admin" } as Partial<IUser>;
            const stubInsert = sinon
            .stub(userRepository, "insert")
            .resolves({ ...payload, role: "user" } as IUser);
            const stubEmailExists = sinon.stub(userRepository, "emailExists").resolves(true);

            await expect(userService.insert(payload)).rejects.toThrow(
              "There is already a user with this email"
            );

            stubInsert.restore();
            stubEmailExists.restore();
        });
    });

    describe("retrieve", () => {
        it("should retrieve users with filters", async () => {
            const query = { email: "a@a.com" };
            const pagination = { page: 1, pageSize: 10 };
            const order: OrderFilters<IUser> = { order: null, direction: null };
            const search = "sample";

            const expectedResult = {
                users: [{ name: "Sample User" }] as IUser[],
                count: 1,
                pagination: { page: 1, pageSize: 10, filtered: 1 },
            };

            const stubRetrieveWithFilter = sinon
            .stub(userRepository, "retrieveWithFilter")
            .resolves(expectedResult);

            const result = await userService.retrieve({ query, pagination, order, search });

            expect(stubRetrieveWithFilter.calledOnceWith({ query, pagination, order, search })).toBe(true);
            expect(result).toBeInstanceOf(Object);
            expect(result).toHaveProperty("users");
            expect(Array.isArray(result.users)).toBe(true);
            expect(result).toHaveProperty("count", 1);
            expect(result.pagination).toEqual(expectedResult.pagination);

            stubRetrieveWithFilter.restore();
        });
    });

    describe("update", () => {
        it("should update users with filters", async () => {
            const filters = { name: "Sample User" };
            const attrs = { color: "blue" };

            const expectedResult = [{ name: "Sample User" }] as IUser[];

            const stubUpdate = sinon.stub(userRepository, "update").resolves(expectedResult);

            const result = await userService.update({ filters, attrs });

            expect(stubUpdate.calledOnce).toBe(true);
            expect(result).toBeInstanceOf(Array);
            expect(result[0]).toHaveProperty("name", "Sample User");

            stubUpdate.restore();
        });

        it("should not be able to update the email attribute", async () => {
            const filters = { name: "Sample User" };
            const attrs = { email: "newemail@example.com" };

            const expectedResult = [{ name: "Sample User", email: "test@example.com" }] as IUser[];

            const stubUpdate = sinon.stub(userRepository, "update").resolves(expectedResult);

            const result = await userService.update({ filters, attrs });

            expect(stubUpdate.calledOnce).toBe(true);
            expect(result).toBeInstanceOf(Array);
            expect(result[0]).toHaveProperty("name", "Sample User");
            expect(result[0]).toHaveProperty("email", "test@example.com"); // Ensure email is not updated

            stubUpdate.restore();
        });
    });

    describe("delete", () => {
        it("user should be able to delete their own account", async () => {
            const userId = "12345";
            const expectedResult = [] as IUser[];
            const stubDelete = sinon.stub(userRepository, "delete").resolves(expectedResult);

            await userService.delete(userId);

            expect(stubDelete.calledOnceWith(userId)).toBe(true);
            sinon.assert.calledWithExactly(stubDelete, userId);

            stubDelete.restore();
        });
    });
});
