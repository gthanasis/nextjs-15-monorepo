// tests/mongodbPersistence.spec.ts

import { describe, it, expect } from "vitest";
import {
  MongoDbPersistence,
  DateQueryParams,
  RangeQueryParams,
  ObjectID,
} from "../src";
import { MongoNetworkError } from "mongodb";
import { stub } from "sinon";

describe("MongoDbPersistence Class", () => {
  describe("translateDateQuery function", () => {
    it("should return a range query when both fromDate and toDate are provided", () => {
      const props = {
        fromDate: "2021-09-01",
        toDate: "2021-09-30",
        field: "createdAt",
      };
      const persistence = new MongoDbPersistence({
        connectionString: "mongodb://test-mongo:27017",
      });
      const result = persistence.translateDateQuery(props);
      const expected = {
        createdAt: {
          $gte: new Date("2021-09-01"),
          $lte: new Date("2021-09-30"),
        },
      };
      expect(result).toEqual(expected);
    });

    it("should return a range query when only fromDate is provided", () => {
      const props: DateQueryParams = {
        fromDate: "2021-09-01",
        field: "createdAt",
        toDate: null,
      };
      const persistence = new MongoDbPersistence({
        connectionString: "mongodb://test-mongo:27017",
      });
      const result = persistence.translateDateQuery(props);
      const expected = { createdAt: { $gte: new Date("2021-09-01") } };
      expect(result).toEqual(expected);
    });

    it("should return a range query when only toDate is provided", () => {
      const props: DateQueryParams = {
        toDate: "2021-09-30",
        field: "createdAt",
        fromDate: null,
      };
      const persistence = new MongoDbPersistence({
        connectionString: "mongodb://test-mongo:27017",
      });
      const result = persistence.translateDateQuery(props);
      const expected = { createdAt: { $lte: new Date("2021-09-30") } };
      expect(result).toEqual(expected);
    });
  });

  describe("resolveId function", () => {
    it("should convert _id to id", () => {
      const persistence = new MongoDbPersistence({
        connectionString: "mongodb://test-mongo:27017",
      });
      const obj = { _id: "123", name: "Test" };
      const result = persistence.resolveId(obj);
      const expected = { id: "123", name: "Test" };
      expect(result).toEqual(expected);
    });
  });

  describe("translateQuery function", () => {
    it("should translate id to _id and convert to ObjectID when given a single value", () => {
      const persistence = new MongoDbPersistence({
        connectionString: "mongodb://test-mongo:27017",
      });
      const result = persistence.translateQuery({
        id: "6153e3ab7bb12f520144731d",
      });
      expect(result).toEqual({ _id: ObjectID("6153e3ab7bb12f520144731d") });
    });
  });

  describe("translateRangeQuery function", () => {
    it("should return a range query when both from and to are provided", () => {
      const props: RangeQueryParams = {
        from: "10",
        to: "20",
        field: "price",
        mapper: Number,
      };
      const persistence = new MongoDbPersistence({
        connectionString: "mongodb://test-mongo:27017",
      });
      const result = persistence.translateRangeQuery(props);
      const expected = { price: { $gte: 10, $lte: 20 } };
      expect(result).toEqual(expected);
    });
  });

  describe("getPagination function", () => {
    it("should return the correct offset and limit when page is 2 and pageSize is 5", () => {
      const props = { page: 2, pageSize: 5 };
      const expected = { offset: 5, limit: 5 };
      const persistence = new MongoDbPersistence({
        connectionString: "mongodb://test-mongo:27017",
      });
      const result = persistence.getPagination(props);
      expect(result).toEqual(expected);
    });
  });

  describe("translateGeoWithinQuery function", () => {
    it("should return the correct query when given a single point", () => {
      const props = { lat: 1, lng: 2, radius: 3, field: "location" };
      const calculatedRadians =
        props.radius / MongoDbPersistence.EARTH_RADIUS_IN_KILOMETERS;
      const expected = {
        [props.field]: {
          $geoWithin: {
            $centerSphere: [[props.lng, props.lat], calculatedRadians],
          },
        },
      };
      const persistence = new MongoDbPersistence({
        connectionString: "mongodb://test-mongo:27017",
      });
      const result = persistence.translateGeoWithinQuery(props);
      expect(result).toEqual(expected);
    });
  });

  describe("close function", () => {
    it("should reconnect if MongoNetworkError and not connecting", async () => {
      const persistence = new MongoDbPersistence({
        connectionString: "mongodb://test-mongo:27017",
      });
      const networkError = new MongoNetworkError("Mock network error");
      const connectStub = stub(persistence, "connect").resolves();

      await persistence.close(networkError, 0);

      // Wait for `setTimeout` execution
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Ensure reconnection attempt is made
      expect(connectStub.calledOnce).toBe(true);
      connectStub.restore();
    });

    it("should not reconnect if the error is not a MongoNetworkError", async () => {
      const persistence = new MongoDbPersistence({
        connectionString: "mongodb://test-mongo:27017",
      });
      const genericError = new Error("Generic error");
      const connectStub = stub(persistence, "connect").resolves();

      await persistence.close(genericError);

      // Ensure no reconnection attempt
      expect(connectStub.called).toBe(false);
      connectStub.restore();
    });
  });
});
