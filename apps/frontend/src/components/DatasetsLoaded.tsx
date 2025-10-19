// component to show loaded datasets
import React, { useEffect, useState } from "react";
import { getDatasets, deleteDataset, deleteAllDatasets } from "../api";

// Type for dataset information
type DatasetInfo = {
  name: string;
  columns: string[];
  rowCount: number;
  source?: string;
};

export default function DatasetsLoaded() {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<string>("");

  // Load datasets from the backend
  const loadDatasets = async () => {
    try {
      setIsLoading(true);
      setError("");
      const datasetList = await getDatasets();
      setDatasets(datasetList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load datasets";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a specific dataset
  const handleDeleteDataset = async (datasetName: string) => {
    if (!confirm(`Are you sure you want to delete "${datasetName}"?`)) {
      return;
    }

    setIsDeleting(datasetName);
    setError("");

    try {
      await deleteDataset(datasetName);
      await loadDatasets(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to delete ${datasetName}`;
      setError(errorMessage);
    } finally {
      setIsDeleting("");
    }
  };

  // Delete all datasets
  const handleDeleteAllDatasets = async () => {
    if (datasets.length === 0) return;

    if (!confirm("Are you sure you want to delete all datasets?")) {
      return;
    }

    setIsDeleting("all");
    setError("");

    try {
      await deleteAllDatasets();
      await loadDatasets(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete all datasets";
      setError(errorMessage);
    } finally {
      setIsDeleting("");
    }
  };

  // Load datasets when component mounts and listen for refresh events
  useEffect(() => {
    loadDatasets();

    // Listen for refresh events from other components
    const handleRefresh = () => loadDatasets();
    window.addEventListener("datasets:refresh", handleRefresh);

    return () => {
      window.removeEventListener("datasets:refresh", handleRefresh);
    };
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Loaded Datasets</h2>
        <div className="flex gap-2">
          <button
            onClick={loadDatasets}
            disabled={isLoading || !!isDeleting}
            className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>

          <button
            onClick={handleDeleteAllDatasets}
            disabled={isLoading || !!isDeleting || datasets.length === 0}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isDeleting === "all" ? "Deleting..." : "Delete All"}
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 mb-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Datasets list */}
      {datasets.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>📊 No datasets loaded yet</p>
          <p className="text-sm">Upload CSV files to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {datasets.map((dataset) => (
            <div
              key={dataset.name}
              className="flex justify-between items-start p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">
                  {dataset.name}
                </h3>

                <p className="text-sm text-gray-600">
                  {dataset.rowCount} rows, {dataset.columns.length} columns
                </p>

                {dataset.source && (
                  <p className="text-xs text-gray-500">
                    Source: {dataset.source}
                  </p>
                )}

                <div className="text-xs text-gray-500 mt-1">
                  <strong>Columns:</strong> {dataset.columns.join(", ")}
                </div>
              </div>

              <button
                onClick={() => handleDeleteDataset(dataset.name)}
                disabled={!!isDeleting}
                className="ml-4 px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {isDeleting === dataset.name ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
