// Simple parser for basic DPQL queries
import type { SimpleQuery } from "./types.js";

// Simple parser that recognizes common patterns
export function parseSimpleDPQL(query: string): SimpleQuery {
  const cleanQuery = query.toLowerCase().replace(/\s+/g, " ").trim();

  // Check if it's a foreign key query
  if (cleanQuery.includes("ind(") && cleanQuery.includes("ucc(")) {
    return {
      selectColumns: ["ForeignKey", "Key"],
      operation: "find_foreign_keys"
    };
  }

  // Check if it's a unique key query
  if (cleanQuery.includes("ucc(") && !cleanQuery.includes("ind(")) {
    return {
      selectColumns: ["UniqueKey"],
      operation: "find_unique_keys"
    };
  }

  // Check if it's a functional dependency query
  if (cleanQuery.includes("fd(")) {
    return {
      selectColumns: ["Determinant", "Dependent"],
      operation: "find_dependencies"
    };
  }

  // Default to foreign keys
  return {
    selectColumns: ["ForeignKey", "Key"],
    operation: "find_foreign_keys"
  };
}
