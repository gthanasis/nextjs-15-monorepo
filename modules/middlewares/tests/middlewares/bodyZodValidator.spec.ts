// tests/middleware/zodBodyValidator.spec.ts

import { describe, it, expect } from "vitest";
import { stub } from "sinon";
import { z } from "zod";
import { zodBodyValidator } from "../../src";
import { BadRequestError } from "library";

describe("zodBodyValidator Middleware", () => {
  it("should call next() when the request body is valid", async () => {
    // Define a simple Zod schema
    const schema = z.object({
      name: z.string(),
      age: z.number().min(1),
    });

    // Prepare mocks/stubs
    const req = { body: { name: "Alice", age: 30 } } as any;
    const res = {} as any;
    const next = stub();

    // Create the middleware
    const middleware = zodBodyValidator(schema);

    // Invoke the middleware
    await middleware(req, res, next);

    // next() should be called once, with no error
    expect(next.calledOnce).toBe(true);
    expect(next.firstCall.args.length).toBe(0);
  });

  it("should call next() with BadRequestError if the request body is invalid", async () => {
    // The same schema as above, requiring { name: string, age: number }
    const schema = z.object({
      name: z.string(),
      age: z.number().min(1),
    });

    const req = { body: { name: "Alice" } } as any; // Missing 'age'
    const res = {} as any;
    const next = stub();

    const middleware = zodBodyValidator(schema);
    await middleware(req, res, next);

    expect(next.calledOnce).toBe(true);
    // next() is called with an error as the first argument
    const errorArg = next.firstCall.args[0];
    expect(errorArg).toBeInstanceOf(BadRequestError);

    // Check that it's indeed a "Bad Request" error
    expect(errorArg.message).toBe("Bad Request");

    // If you want to verify the Zod issues, you can do:
    // Since we passed `errors: (error as ZodError).errors` to BadRequestError,
    // errorArg.errors should contain an array of Zod issues
    expect(errorArg.errors).toHaveLength(1);
    // This is the default format { code, message, path, ... }
    expect(errorArg.errors[0].message).toMatch(/required/i);
    expect(errorArg.errors[0].path).toEqual(["age"]);
  });

  it("should throw an error if a non-Zod error occurs", async () => {
    // We'll simulate a scenario where something unexpected happens
    // inside schema.parse() that isn't a ZodError (very rare, but let's test).
    // For simplicity, let's create a "fake schema" that throws a normal Error.
    const fakeSchema: any = {
      parse: () => {
        throw new Error("Something unexpected");
      },
    };

    const req = { body: {} } as any;
    const res = {} as any;
    const next = stub();

    const middleware = zodBodyValidator(fakeSchema);
    await middleware(req, res, next);

    expect(next.calledOnce).toBe(true);
    // The first argument to next() is the original error
    const errorArg = next.firstCall.args[0];
    expect(errorArg).toBeInstanceOf(Error);
    expect(errorArg.message).toBe("Something unexpected");
  });
});
