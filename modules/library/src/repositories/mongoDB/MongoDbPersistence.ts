import {
  Db,
  MongoClient,
  MongoNetworkError,
  ObjectId,
  Document,
  Sort,
  WithId,
  Filter,
  UpdateFilter,
} from "mongodb";
import IPersistence from "../IPersistence";
import _ from "lodash";
import { WithLodashID } from "api-client";
import { MongoQueryOptions } from "./interfaces/MongoQueryOptions";
import { MongoAggregateOptions } from "./types/MongoAggregationOptions";
import { PageOffsetLimit } from "./types/PageOffsetLimits";
import {
  DateQueryParams,
  GeoWithinQueryParams,
  RangeQueryParams,
} from "./types/QueryTypes";
import { GetPaginationProps } from "./types/GetPaginationProps";

export class MongoDbPersistence implements IPersistence {
  public static EARTH_RADIUS_IN_KILOMETERS = 6371;
  private connectionString: any;
  private options: {
    socketTimeoutMS: number;
    connectTimeoutMS: number;
  };
  private client: MongoClient;
  private db: Db | undefined;
  private connecting: boolean;
  private id: string;
  private listenersAttached: boolean;

  constructor(props: { connectionString: string }) {
    const { connectionString } = props;
    // random id in case we need it
    this.id = Math.random().toString(36).substring(7);
    this.connectionString = connectionString;
    // Updated options to be compatible with the latest MongoDB client
    this.options = {
      connectTimeoutMS: 120000, // Connection timeout in milliseconds
      socketTimeoutMS: 0, // No timeout by default, waits indefinitely for a response
    };
    this.client = new MongoClient(this.connectionString, this.options);
    this.connecting = false;
    this.listenersAttached = false;
    this.attachListeners();
  }

  attachListeners() {
    if (!this.listenersAttached) {
      this.client.on("close", this.close.bind(this));
      this.client.on("reconnect", () => {
        console.log(
          `MongoDB database connection re-established. Connection Id: ${this.id}`,
        );
      });
      this.listenersAttached = true;
    }
  }

  async query<ReturnType extends Document>(
    props: MongoQueryOptions<ReturnType> & { table: string },
  ): Promise<WithId<ReturnType>[]> {
    const { query, table, order, pagination, projection } = props;

    if (!this.db) throw new Error("MongoDB not yet connected");

    const collection = this.db.collection<ReturnType>(table);

    let cursor = collection.find(query);

    if (projection && Object.keys(projection).length > 0) {
      cursor = cursor.project(projection);
    }

    if (pagination) {
      cursor = cursor.skip(pagination.offset).limit(pagination.limit);
    }

    if (order) {
      // Correctly constructing the sort object
      const sortObj: Sort = [
        [order.field as string, order.direction === "asc" ? 1 : -1],
      ];
      cursor = cursor.sort(sortObj);
    } else {
      cursor = cursor.sort({ _id: 1 });
    }

    return await cursor.toArray();
  }

  async aggregate<ReturnType extends Document>(
    props: MongoAggregateOptions & { table: string },
  ): Promise<ReturnType[]> {
    const { aggregationsPipeline, table } = props;
    // console.log('Aggregations query', JSON.stringify({ aggregationsPipeline, table }, null, 2))
    if (!this.db) throw new Error("Mongo not yet connected");
    const res = await this.db
      .collection(table)
      .aggregate<ReturnType>(aggregationsPipeline)
      .toArray();
    return res;
  }

  async count<ReturnType extends Document>(
    props: MongoQueryOptions<ReturnType> & { table: string },
  ): Promise<number> {
    const { query, table } = props;
    if (!this.db) throw new Error("MongoDB not yet connected");
    const collection = this.db.collection<ReturnType>(table);
    return await collection.countDocuments(query);
  }

  async create<Model>(
    modelInstances: Partial<Model>,
    table: string,
    projection = {},
  ): Promise<WithLodashID<Model>> {
    if (!this.db) throw new Error("Mongo not yet connected");
    const createRes = await this.db
      .collection(table)
      .insertOne(modelInstances, {});
    // console.log('Create', { modelInstances, table })
    const res = await this.db
      .collection(table)
      .findOne<WithLodashID<Model>>({ _id: createRes.insertedId }, {});
    if (res === null)
      throw new Error(
        `Could not create model, ${JSON.stringify(modelInstances)}`,
      );
    return res;
  }

  async update<ReturnType extends Document>(
    attributes: Partial<ReturnType>,
    where: Filter<ReturnType>,
    table: string,
    projection: Partial<Record<keyof ReturnType, 1 | 0>> = {},
  ): Promise<WithId<ReturnType>[]> {
    // Remove keys with null or undefined values from `where` while preserving type
    // Omit keys in 'where' that are null or undefined
    const nonNullWhere = _.omitBy(where, _.isNil) as Filter<ReturnType>;

    if (!this.db) throw new Error("MongoDB not yet connected");

    const collection = this.db.collection<ReturnType>(table);

    // Perform the update operation
    await collection.updateOne(nonNullWhere, {
      $set: attributes,
    } as UpdateFilter<ReturnType>);

    // Fetch updated records based on `where` and `projection`
    let cursor = collection.find(nonNullWhere);

    if (Object.keys(projection).length > 0) {
      cursor = cursor.project(projection);
    }

    return await cursor.toArray();
  }

  async updateMany<ReturnType extends Document>(
    updateQuery: UpdateFilter<ReturnType>,
    where: Filter<ReturnType>,
    table: string,
    projection: Partial<Record<keyof ReturnType, 1 | 0>> = {},
  ): Promise<WithId<ReturnType>[]> {
    // Remove keys with null or undefined values from `where` while preserving type
    // Omit keys in 'where' that are null or undefined
    const nonNullWhere = _.omitBy(where, _.isNil) as Filter<ReturnType>;

    if (!this.db) throw new Error("MongoDB not yet connected");

    const collection = this.db.collection<ReturnType>(table);

    // Perform the updateMany operation
    await collection.updateMany(nonNullWhere, updateQuery);

    // Fetch updated records based on `where` and `projection`
    let cursor = collection.find(nonNullWhere);

    if (Object.keys(projection).length > 0) {
      cursor = cursor.project(projection);
    }

    return await cursor.toArray();
  }

  async delete<ReturnType extends Document>(
    where: Filter<ReturnType>,
    table: string,
    projection: Partial<Record<keyof ReturnType, 1 | 0>> = {},
  ): Promise<WithId<ReturnType>[]> {
    // Omit keys in 'where' that are null or undefined
    const nonNullWhere = _.omitBy(where, _.isNil) as Filter<ReturnType>;

    if (!this.db) throw new Error("MongoDB not yet connected");

    const collection = this.db.collection<ReturnType>(table);

    // First, find the documents to delete with the specified projection
    let cursor = collection.find(nonNullWhere);

    if (Object.keys(projection).length > 0) {
      cursor = cursor.project(projection);
    }

    const toDelete = await cursor.toArray();

    // Proceed to delete the found documents
    await collection.deleteMany(where);

    // Return the documents that were deleted
    return toDelete;
  }

  async connect(): Promise<void> {
    this.connecting = true;
    this.client = await this.client.connect();
    this.db = this.client.db();
    this.connecting = false;
  }

  async disconnect(): Promise<void> {
    await this.client.close();
  }

  async close(err: Error): Promise<void> {
    if (!(err instanceof MongoNetworkError))
      return console.warn(
        `⛁ MongoDB database connection closed. Connection Id: ${this.id}`,
      );
    if (!this.connecting) setTimeout(() => this.connect.apply(this), 5000);
  }

  resolveId<Type>(obj): Type {
    const { _id, ...rest } = obj;
    return { id: _id, ...rest };
  }

  getPagination(props: GetPaginationProps): PageOffsetLimit {
    const { page, pageSize } = props;
    const offset = (page - 1) * pageSize;
    const limit = pageSize;
    return { offset, limit };
  }

  translateQuery(queryParams: Record<string, any>, search?: string | null) {
    const mongoQuery: any = {};

    for (const [key, value] of Object.entries(queryParams)) {
      switch (key) {
        case "search":
          break;
        case "id":
          if (Array.isArray(value)) {
            mongoQuery._id = { $in: value.map((v) => new ObjectId(v)) };
          } else {
            mongoQuery._id = new ObjectId(value);
          }
          break;
        default:
          if (key.endsWith(".from") || key.endsWith(".to")) break;
          if (Array.isArray(value)) {
            mongoQuery[key] = { $in: value };
          } else if (typeof value === "string" && value.indexOf(",") !== -1) {
            mongoQuery[key] = { $in: value.split(",") };
          } else {
            mongoQuery[key] = value;
          }
          break;
      }
    }
    if (search) mongoQuery.$text = { $search: search as string };
    return mongoQuery;
  }

  translateDateQuery = ({ fromDate, toDate, field }: DateQueryParams) => {
    return this.translateRangeQuery({
      from: fromDate,
      to: toDate,
      field,
      mapper: (e) => new Date(e),
    });
  };

  translateRangeQuery = ({
    from,
    to,
    field,
    mapper = (e) => e,
  }: RangeQueryParams) => {
    const dateQuery: any = {};
    if (from != null && to != null) {
      dateQuery[field] = {
        $gte: mapper(from),
        $lte: mapper(to),
      };
    } else if (from != null) {
      dateQuery[field] = { $gte: mapper(from) };
    } else if (to != null) {
      dateQuery[field] = { $lte: mapper(to) };
    }
    return dateQuery;
  };

  translateGeoWithinQuery = ({
    lat,
    lng,
    radius,
    field,
  }: GeoWithinQueryParams) => {
    const calculatedRadians = this.translateKilometersToRadius(radius);
    return {
      [field]: {
        $geoWithin: {
          $centerSphere: [[lng, lat], calculatedRadians],
        },
      },
    };
  };

  private translateKilometersToRadius = (kilometers: number) => {
    const calculatedRadians =
      kilometers / MongoDbPersistence.EARTH_RADIUS_IN_KILOMETERS;
    return calculatedRadians;
  };

  // Function to create a new ObjectId or parse an existing one
  static ObjectID = (id?: string): ObjectId => {
    if (id) {
      return new ObjectId(id);
    }
    return new ObjectId();
  };
}

const ObjectID = (id?: string) => MongoDbPersistence.ObjectID(id);
ObjectID.isValid = ObjectId.isValid;

export { ObjectID };
export * from "./types/QueryTypes";
export * from "./types/MongoAggregationOptions";
export * from "./types/GetPaginationProps";
export * from "./types/PageOffsetLimits";
export * from "./interfaces/MongoQueryOptions";
