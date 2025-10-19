//express server for DPQL
import express from "express";
import cors from "cors";
import multer from "multer";

import { parseSimpleDPQL } from "./dpqlParser.js";
import { loadCsv } from "./csv.js";
import { executeSimpleQuery, findUniqueKeys } from "./engine.js";
import type { Dataset } from "./types.js";

// Create Express app
const app = express();
app.use(cors()); // Allow requests from frontend
app.use(express.json({ limit: "10mb" })); // Parse JSON requests

// Configure file upload
const upload = multer();

// Store datasets in memory
const datasets: Record<string, Dataset> = {};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "DPQL backend is running!" });
});

// Upload CSV file endpoint
app.post("/api/upload", upload.single("file"), (req, res) => {
  try {
    //get dataset name from request or use filename
    const providedName = req.body.name as string;
    const fileName = req.file?.originalname;
    const fallbackName = fileName ? fileName.replace(/\.[^.]+$/, "") : "dataset";
    const datasetName = (providedName && providedName.trim()) ? providedName.trim() : fallbackName;

    // Get CSV content from file or request body
    const csvContent = req.file
      ? req.file.buffer.toString("utf-8")
      : req.body.csv as string;

    if (!csvContent) {
      return res.status(400).json({ ok: false, error: "No CSV content provided" });
    }

    // Load the CSV into our dataset format
    const dataset = loadCsv(datasetName, csvContent);
    dataset.source = fileName || providedName || datasetName;

    // Store in memory
    datasets[datasetName] = dataset;

    // Send success response
    res.json({
      ok: true,
      dataset: {
        name: dataset.name,
        columns: dataset.columns,
        rows: dataset.rows.length,
        source: dataset.source
      }
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Failed to upload CSV"
    });
  }
});

// Get list of all datasets
app.get("/api/datasets", (req, res) => {
  const datasetList = Object.values(datasets).map(dataset => ({
    name: dataset.name,
    columns: dataset.columns,
    rowCount: dataset.rows.length,
    source: dataset.source
  }));

  res.json({ ok: true, datasets: datasetList });
});

// Delete a specific dataset
app.delete("/api/datasets/:name", (req, res) => {
  const datasetName = req.params.name;

  if (!datasetName) {
    return res.status(400).json({ ok: false, error: "Dataset name is required" });
  }

  if (!datasets[datasetName]) {
    return res.status(404).json({ ok: false, error: "Dataset not found" });
  }

  delete datasets[datasetName];
  res.json({ ok: true, deleted: datasetName });
});

//Dlete all datasets
app.delete("/api/datasets", (req, res) => {
  const deletedNames = Object.keys(datasets);

  // Clear all datasets
  for (const name of deletedNames) {
    delete datasets[name];
  }

  res.json({ ok: true, deleted: deletedNames });
});

// Execute DPQL query
app.post("/api/execute", (req, res) => {
  try {
    const queryText = req.body.query as string;

    if (!queryText || !queryText.trim()) {
      return res.status(400).json({ ok: false, error: "Query is required" });
    }

    // Parse the query into a simple format
    const parsedQuery = parseSimpleDPQL(queryText);

    // Execute the query
    const result = executeSimpleQuery(parsedQuery, datasets);

    res.json({
      ok: true,
      parsed: parsedQuery,
      result: result
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Query execution failed"
    });
  }
});

// Find unique keys endpoint (simplified)
app.get("/api/ucc", (req, res) => {
  try {
    const result = findUniqueKeys(datasets);
    res.json({
      ok: true,
      result: { tables: [result], warnings: [] }
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "UCC mining failed"
    });
  }
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`DPQL backend running on http://localhost:${PORT}`);
  console.log("Ready to process CSV files and DPQL queries!");
});
