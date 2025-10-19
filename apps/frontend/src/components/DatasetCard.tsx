//component for uploading CSV files
import React, { useState } from "react";
import { uploadCsv } from "../api";

export default function DatasetCard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus("Please select a CSV file first");
      return;
    }

    setUploadStatus("Uploading file...");

    try {
      const result = await uploadCsv(selectedFile);
      const dataset = result.dataset;
      const fileName = dataset.source || selectedFile.name;

      setUploadStatus(
        `✅ Uploaded "${dataset.name}" from ${fileName} - ${dataset.rows} rows, ${dataset.columns.length} columns`
      );

      // Tell other components to refresh their dataset lists
      window.dispatchEvent(new CustomEvent("datasets:refresh"));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      setUploadStatus(`❌ Error: ${errorMessage}`);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold  text-gray-700 mb-4">Upload Dataset</h2>

      <div className="space-y-4">
        {/* File selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose CSV File:
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {selectedFile ? "Upload CSV" : "Select a file first"}
        </button>

        {/* Status message */}
        {uploadStatus && (
          <div className="p-3 text-sm bg-gray-50 rounded-lg">
            {uploadStatus}
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-4 text-xs text-gray-500">
        <p>📁 Upload CSV files to start exploring relationships in your data.</p>
        <p>💡 The first row should contain column headers.</p>
      </div>
    </div>
  );
}
