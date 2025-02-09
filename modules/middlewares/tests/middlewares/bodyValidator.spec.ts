// tests/middleware/bodyValidator.spec.ts

import { describe, it, expect } from "vitest";
import { BadRequestError } from "library";
import { bodyValidator } from "../../src";
import { stub } from "sinon";

describe("bodyValidator Middleware", () => {
  it("should call next() when the request body is valid", async () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name", "age"],
    };

    const req = { body: { name: "Alice", age: 30 } } as any;
    const res = {} as any;
    const next = stub();

    const middleware = bodyValidator(schema);
    await middleware(req, res, next);

    expect(next.calledOnce).toBe(true);
    // No arguments passed to next() on success
    expect(next.firstCall.args.length).toBe(0);
  });

  it("should call next() with BadRequestError when the request body is invalid", async () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
        age: { type: "number" },
      },
      required: ["name", "age"],
    };

    // Missing required field 'age'
    const req = { body: { name: "Alice" } } as any;
    const res = {} as any;
    const next = stub();

    const middleware = bodyValidator(schema);
    await middleware(req, res, next);

    expect(next.calledOnce).toBe(true);
    const error = next.firstCall.args[0];
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toMatch(/Bad Request/);
  });

  it("should handle schema validation errors correctly", async () => {
    const schema = {
      type: "object",
      properties: {
        name: { type: "string" },
      },
      required: ["name"],
    };

    // Completely invalid body
    const req = { body: {} } as any;
    const res = {} as any;
    const next = stub();

    const middleware = bodyValidator(schema);
    await middleware(req, res, next);

    expect(next.calledOnce).toBe(true);
    const error = next.firstCall.args[0];
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toMatch(/Bad Request/);
  });
});
