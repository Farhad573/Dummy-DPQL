// Main application component
import React, { useState } from "react";
import DatasetCard from "./components/DatasetCard";
import QueryEditor from "./components/QueryEditor";
import ResultsTable from "./components/ResultsTable";
import DatasetsLoaded from "./components/DatasetsLoaded";
import { executeQuery, getUcc } from "./api";

// preset queries for testing
const PRESET_QUERIES = {
  foreignKeys: `SELECT X AS ForeignKey, Y AS Key
FROM CC(*) X, CC(*) Y
WHERE IND(X,Y) AND UCC(Y) AND SPLIT(X,Y) AND SIZE(Y) <= 2`,

  functionalDependencies: `SELECT X AS Determinant, Y AS Dependent
FROM CC(*) X, CC(*) Y
WHERE FD(X,Y) AND SIZE(X) = 1 AND SIZE(Y) = 1`,

  uniqueKeys: `SELECT X AS UniqueKey
FROM CC(*) X
WHERE UCC(X) AND SIZE(X) <= 2`
};

// Convert result table to CSV format for download
function convertToCSV(table: { name?: string; columns: string[]; rows: any[][] }): string {
  const header = table.columns.join(",");
  const dataRows = table.rows.map(row =>
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`)
       .join(",")
  );
  return [header, ...dataRows].join("\n");
}

export default function App() {
  // Simple state management
  const [query, setQuery] = useState<string>(PRESET_QUERIES.foreignKeys);
  const [result, setResult] = useState<any>(null);
  const [status, setStatus] = useState<string>("");

  //Execute the current query
  const runQuery = async () => {
    setStatus("Running query...");
    try {
      const response = await executeQuery(query);
      console.log("Query result:", response.result);
      setResult(response.result);
      setStatus("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Query failed";
      setStatus(errorMessage);
      setResult(null);
    }
  };

  // Run specific preset queries
  const runForeignKeys = async () => {
    setQuery(PRESET_QUERIES.foreignKeys);
    await runQuery();
  };

  const runFunctionalDependencies = async () => {
    setQuery(PRESET_QUERIES.functionalDependencies);
    await runQuery();
  };

  const runUniqueKeys = async () => {
    setStatus("Finding unique keys...");
    try {
      const response = await getUcc(2);
      console.log("UCC result:", response);
      setResult(response);
      setStatus("");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "UCC search failed";
      setStatus(errorMessage);
      setResult(null);
    }
  };

  // Download results as CSV
  const downloadResults = () => {
    if (!result?.tables?.length) return;

    const table = result.tables[0];
    const csvContent = convertToCSV(table);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${table.name || "results"}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold  text-gray-700 text-center">DPQL Demo - Data Profiling Tool</h1>
      <p className="text-gray-600 text-center">
        Upload CSV files and discover relationships between your data!
      </p>

      {/* Main content area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DatasetCard />
        <QueryEditor query={query} setQuery={setQuery} onRun={runQuery} />

        {/* Datasets overview */}
        <div className="md:col-span-2">
          <DatasetsLoaded />
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={runForeignKeys}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          title="Find foreign key relationships between datasets"
        >
          Find Foreign Keys
        </button>

        <button
          onClick={runUniqueKeys}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          title="Find columns with unique values"
        >
          Find Unique Keys
        </button>

        <button
          onClick={runFunctionalDependencies}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          title="Find functional dependencies within datasets"
        >
          Find Dependencies
        </button>

        <button
          onClick={downloadResults}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          disabled={!result?.tables?.length}
          title="Download results as CSV file"
        >
          Download Results
        </button>
      </div>

      {/* Status messages */}
      {status && (
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-blue-700">{status}</p>
        </div>
      )}

      {/* Results display */}
      <ResultsTable result={result} />

      {/* Simple footer */}
      <footer className="text-center text-sm text-gray-500 pt-6 border-t">
        DPQL Demo - Learn data profiling concepts through hands-on exploration
      </footer>
    </div>
  );
}
