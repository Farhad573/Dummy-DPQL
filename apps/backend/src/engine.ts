// Simple engine for DPQL operations
import type { Dataset, QueryResult, ResultTable, SimpleQuery } from "./types.js";

// get unique values from a column
function getUniqueValues(dataset: Dataset, columnNames: string[]): string[][] {
  const columnIndexes = columnNames.map(name => dataset.columns.indexOf(name));
  const values: string[][] = [];

  for (const row of dataset.rows) {
    const value = columnIndexes.map(index => String(row[index] || ""));
    values.push(value);
  }

  return values;
}

//if a set of columns contains only unique values
function isUniqueKey(dataset: Dataset, columnNames: string[]): boolean {
  const values = getUniqueValues(dataset, columnNames);
  const stringValues = values.map(v => v.join("|"));
  const uniqueValues = new Set(stringValues);

  return uniqueValues.size === values.length;
}

//if values from one dataset are contained in another dataset
function isSubset(leftDataset: Dataset, leftColumns: string[],
                 rightDataset: Dataset, rightColumns: string[]): boolean {
  const leftValues = getUniqueValues(leftDataset, leftColumns);
  const rightValues = getUniqueValues(rightDataset, rightColumns);
  const rightSet = new Set(rightValues.map(v => v.join("|")));

  for (const leftValue of leftValues) {
    if (!rightSet.has(leftValue.join("|"))) {
      return false;
    }
  }

  return true;
}

//fnd foreign key relationships between datasets
function findForeignKeys(datasets: Record<string, Dataset>): ResultTable {
  const results: string[][] = [];
  const datasetNames = Object.keys(datasets);

  //Compare each pair of datasets
  for (let i = 0; i < datasetNames.length; i++) {
    for (let j = 0; j < datasetNames.length; j++) {
      if (i === j) continue; // Skip same dataset

      const leftDataset = datasets[datasetNames[i]];
      const rightDataset = datasets[datasetNames[j]];

      //Check each column in left dataset against each column in right dataset
      for (const leftColumn of leftDataset.columns) {
        for (const rightColumn of rightDataset.columns) {
          // Check if right column is unique (primary key candidate)
          if (isUniqueKey(rightDataset, [rightColumn])) {
            // Check if left column values are subset of right column values
            if (isSubset(leftDataset, [leftColumn], rightDataset, [rightColumn])) {
              const foreignKey = `${datasetNames[i]}.${leftColumn}`;
              const primaryKey = `${datasetNames[j]}.${rightColumn}`;
              results.push([foreignKey, primaryKey]);
            }
          }
        }
      }
    }
  }

  return {
    name: "ForeignKeys",
    columns: ["ForeignKey", "Key"],
    rows: results
  };
}

//Fnd unique keys (columns with unique values)
export function findUniqueKeys(datasets: Record<string, Dataset>): ResultTable {
  const results: string[][] = [];

  for (const [datasetName, dataset] of Object.entries(datasets)) {
    //Check single columns
    for (const column of dataset.columns) {
      if (isUniqueKey(dataset, [column])) {
        results.push([`${datasetName}.${column}`]);
      }
    }

    // Check pairs of columns
    for (let i = 0; i < dataset.columns.length; i++) {
      for (let j = i + 1; j < dataset.columns.length; j++) {
        const columnPair = [dataset.columns[i], dataset.columns[j]];
        if (isUniqueKey(dataset, columnPair)) {
          results.push([`${datasetName}.${columnPair.join(", ")}`]);
        }
      }
    }
  }

  return {
    name: "UniqueKeys",
    columns: ["Key"],
    rows: results
  };
}

//ind functional dependencies (one column determines another)
function findFunctionalDependencies(datasets: Record<string, Dataset>): ResultTable {
  const results: string[][] = [];

  for (const [datasetName, dataset] of Object.entries(datasets)) {
    // Check if one column functionally determines another
    for (let i = 0; i < dataset.columns.length; i++) {
      for (let j = 0; j < dataset.columns.length; j++) {
        if (i === j) continue; // Skip same column

        const determinant = dataset.columns[i];
        const dependent = dataset.columns[j];

        // Check if determinant -> dependent is a valid functional dependency
        if (isFunctionalDependency(dataset, [determinant], [dependent])) {
          results.push([`${datasetName}.${determinant}`, `${datasetName}.${dependent}`]);
        }
      }
    }
  }

  return {
    name: "FunctionalDependencies",
    columns: ["Determinant", "Dependent"],
    rows: results
  };
}

// Check if leftColumns functionally determine rightColumns
function isFunctionalDependency(dataset: Dataset, leftColumns: string[], rightColumns: string[]): boolean {
  const leftValues = getUniqueValues(dataset, leftColumns);
  const rightValues = getUniqueValues(dataset, rightColumns);

  // Group right values by left values
  const mapping = new Map<string, string>();

  for (let i = 0; i < leftValues.length; i++) {
    const leftKey = leftValues[i].join("|");
    const rightValue = rightValues[i].join("|");

    if (mapping.has(leftKey)) {
      // If we've seen this left value before, check if right value is the same
      if (mapping.get(leftKey) !== rightValue) {
        return false; // Not a functional dependency
      }
    } else {
      mapping.set(leftKey, rightValue);
    }
  }

  return true;
}

// Main execution function - simplified approach
export function executeSimpleQuery(query: SimpleQuery, datasets: Record<string, Dataset>): QueryResult {
  const warnings: string[] = [];

  if (Object.keys(datasets).length === 0) {
    warnings.push("No datasets loaded. Please upload CSV files first.");
    return { tables: [], warnings };
  }

  let table: ResultTable;

  switch (query.operation) {
    case "find_foreign_keys":
      table = findForeignKeys(datasets);
      break;
    case "find_unique_keys":
      table = findUniqueKeys(datasets);
      break;
    case "find_dependencies":
      table = findFunctionalDependencies(datasets);
      break;
    default:
      table = findForeignKeys(datasets); // Default fallback
  }

  if (table.rows.length === 0) {
    warnings.push(`No ${query.operation.replace(/_/g, " ")} found in the current datasets.`);
  }

  return { tables: [table], warnings };
}
