export type WithID<Type, IdType = string> = Type & { id: IdType };
export type WithLodashID<Type, IdType = string> = Type & { _id: IdType };

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export interface GeoPoint {
  type: "Point";
  coordinates: number[];
}

export interface PaginatedResponse<T> {
  res: T[];
  count: number;
  page: number;
  pageSize: number;
}

export interface ApiResponse<T> {
  res: T;
}

export interface ApiError {
  error: string;
}

export interface ApiClientConfig {
  baseURL: string;
  headers?: Record<string, string>;
}
