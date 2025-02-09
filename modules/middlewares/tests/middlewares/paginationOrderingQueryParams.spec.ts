// tests/middleware/paginationOrderingQueryParams.spec.ts

import { describe, it, expect, beforeEach } from "vitest";
import { stub } from "sinon";
import { BadRequestError } from "library";
import { paginationOrderingQueryParams } from "../../src";

describe("paginationOrderingQueryParams Middleware", () => {
  let next: any;

  beforeEach(() => {
    next = stub();
  });

  it("should set default pageSize and page when query params are not provided", async () => {
    const req = { query: {} } as any;
    const res = { locals: {} } as any;

    const middleware = paginationOrderingQueryParams();
    await middleware(req, res, next);

    expect(res.locals.pageSize).toBe(50);
    expect(res.locals.page).toBe(1);
    expect(next.calledOnce).toBe(true);
  });

  it("should parse pageSize and page from query params", async () => {
    const req = { query: { pageSize: "20", page: "2" } } as any;
    const res = { locals: {} } as any;

    const middleware = paginationOrderingQueryParams();
    await middleware(req, res, next);

    expect(res.locals.pageSize).toBe(20);
    expect(res.locals.page).toBe(2);
    expect(next.calledOnce).toBe(true);
  });

  it("should parse order and orderDirection from query params", async () => {
    const req = { query: { order: "name", orderDirection: "asc" } } as any;
    const res = { locals: {} } as any;

    const middleware = paginationOrderingQueryParams();
    await middleware(req, res, next);

    expect(res.locals.orderField).toBe("name");
    expect(res.locals.orderDirection).toBe("asc");
    expect(next.calledOnce).toBe(true);
  });

  it("should throw BadRequestError if pageSize is less than or equal to 0", async () => {
    const req = { query: { pageSize: "0" } } as any;
    const res = { locals: {} } as any;

    const middleware = paginationOrderingQueryParams();
    await middleware(req, res, next);

    expect(next.calledOnce).toBe(true);
    const error = next.firstCall.args[0];
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toBe("pageSize should be larger than 0");
  });

  it("should throw BadRequestError if page is less than 1", async () => {
    const req = { query: { page: "0" } } as any;
    const res = { locals: {} } as any;

    const middleware = paginationOrderingQueryParams();
    await middleware(req, res, next);

    expect(next.calledOnce).toBe(true);
    const error = next.firstCall.args[0];
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toBe("page should be larger or equal to 1");
  });

  it("should throw BadRequestError if orderDirection is invalid", async () => {
    const req = { query: { orderDirection: "invalid" } } as any;
    const res = { locals: {} } as any;

    const middleware = paginationOrderingQueryParams();
    await middleware(req, res, next);

    expect(next.calledOnce).toBe(true);
    const error = next.firstCall.args[0];
    expect(error).toBeInstanceOf(BadRequestError);
    expect(error.message).toBe("order direction should be one of asc, desc");
  });
});
