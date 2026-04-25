// Database query result types
export interface DbQueryResult {
  [key: string]: string | number | boolean | null | undefined;
}

export type DbQueryResults = DbQueryResult[];

