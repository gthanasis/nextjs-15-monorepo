import { Document, Filter } from 'mongodb'

export interface MongoQueryOptions<ReturnType extends Document> {
  query: Filter<ReturnType>;
  order?: {
    field: keyof (ReturnType & { _id: string });
    direction: 'asc' | 'desc';
  };
  pagination?: {
    offset: number;
    limit: number;
  };
  projection?: Partial<Record<keyof ReturnType, 1 | 0 | { [operator: string]: any }>>;
}
