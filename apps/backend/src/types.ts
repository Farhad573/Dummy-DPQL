//data structures for the DPQL system

// Basic dataset structure
export type Dataset = {
  name: string;
  columns: string[];
  rows: (string | number | null)[][];
  source?: string;
};

// Simple query result
export type ResultTable = {
  name: string;
  columns: string[];
  rows: any[][];
};

export type QueryResult = {
  tables: ResultTable[];
  warnings: string[];
};

// Simple query structure. only support basic operations
export type SimpleQuery = {
  selectColumns: string[];
  operation: "find_foreign_keys" | "find_unique_keys" | "find_dependencies";
};
