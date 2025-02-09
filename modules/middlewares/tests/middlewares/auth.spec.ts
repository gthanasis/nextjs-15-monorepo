// tests/middleware/auth.spec.ts

import { describe, it, expect, beforeEach } from "vitest";
import { stub, SinonStub } from "sinon";
import { auth } from "../../src";
import {
  testLogger as logger,
  jwt as jwtLib,
  generateRes,
  generateReq,
} from "../helpers";

describe("auth Middleware", () => {
  let next: SinonStub;

  beforeEach(() => {
    // Using sinon stubs here; you could also switch to vi.fn()
    next = stub();
  });

  it("should return 401 if no token is provided", async () => {
    const req = generateReq();
    const res = generateRes();

    const middleware = auth({ jtwLib: jwtLib, logger });
    await middleware(req, res, next);

    expect(res.status.calledWith(401)).toBe(true);
    expect(res.json.calledWith({ error: "No auth token provided" })).toBe(true);
    expect(next.called).toBe(false);
  });

  it("should return 401 if token is invalid", async () => {
    const req = generateReq({
      headers: { authorization: "Bearer invalidToken" },
    });
    const res = generateRes();

    const middleware = auth({ jtwLib: jwtLib, logger });
    await middleware(req, res, next);

    expect(res.status.calledWith(401)).toBe(true);
    expect(res.json.calledWith({ error: "Invalid auth token" })).toBe(true);
    expect(next.called).toBe(false);
  });

  it("should return 401 if user role is not allowed", async () => {
    const token = jwtLib.create({ payload: { id: "123", role: "user" } });
    const req = generateReq({ headers: { authorization: `Bearer ${token}` } });
    const res = generateRes();

    const middleware = auth({ jtwLib: jwtLib, roles: ["admin"], logger });
    await middleware(req, res, next);

    expect(res.status.calledWith(401)).toBe(true);
    expect(
      res.json.calledWith({
        error: `You don't have permission to access this resource`,
      }),
    ).toBe(true);
    expect(next.called).toBe(false);
  });

  it("should call next if user role is allowed", async () => {
    const token = jwtLib.create({ payload: { id: "123", role: "user" } });
    const req = generateReq({ headers: { authorization: `Bearer ${token}` } });
    // Merging res so we can store locals
    const res = { ...generateRes(), locals: {} };

    const middleware = auth({ jtwLib: jwtLib, roles: ["user"], logger });
    await middleware(req, res, next);

    expect(res.locals.userId).toBe("123");
    expect(res.locals.decoded.id).toBe("123");
    expect(res.locals.decoded.role).toBe("user");
    expect(next.calledOnce).toBe(true);
  });

  it("should enforce user ID when `enforceUserId` is true", async () => {
    const token = jwtLib.create({ payload: { id: "123", role: "user" } });
    const req = generateReq({ headers: { authorization: `Bearer ${token}` } });
    const res = generateRes();

    const middleware = auth({
      jtwLib: jwtLib,
      roles: ["user"],
      enforceUserId: true,
      logger,
    });
    await middleware(req, res, next);

    expect(next.calledOnce).toBe(true);
  });

  it("should return 400 if admin role and `restrictUserId` is true but no user ID is provided", async () => {
    const token = jwtLib.create({ payload: { id: "123", role: "admin" } });
    const req = generateReq({ headers: { authorization: `Bearer ${token}` } });
    const res = generateRes();

    const middleware = auth({
      jtwLib: jwtLib,
      roles: ["admin"],
      restrictUserId: true,
      logger,
    });
    await middleware(req, res, next);

    expect(res.status.calledWith(400)).toBe(true);
    expect(
      res.json.calledWith({ error: "You need to provide a user ID" }),
    ).toBe(true);
    expect(next.called).toBe(false);
  });

  it("should allow admin to access resources without user ID if `restrictUserId` is false", async () => {
    const token = jwtLib.create({ payload: { id: "123", role: "admin" } });
    const req = generateReq({ headers: { authorization: `Bearer ${token}` } });
    const res = generateRes();

    const middleware = auth({
      jtwLib: jwtLib,
      roles: ["admin"],
      restrictUserId: false,
      logger,
    });
    await middleware(req, res, next);

    expect(next.calledOnce).toBe(true);
    // If you’re setting res.locals.userId = null, check:
    // expect(res.locals.userId).toBeNull();
  });
});
