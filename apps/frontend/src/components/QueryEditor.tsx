//query editor for DPQL
import React from "react";

// Component props
type QueryEditorProps = {
  query: string;
  setQuery: (newQuery: string) => void;
  onRun: () => void;
};

export default function QueryEditor({ query, setQuery, onRun }: QueryEditorProps) {
  // Sample query for foreign key detection
  const sampleQuery = `SELECT X AS ForeignKey, Y AS Key
FROM CC(*) X, CC(*) Y
WHERE IND(X,Y) AND UCC(Y) AND SPLIT(X,Y) AND SIZE(Y) <= 2`;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold  text-gray-700 mb-4">DPQL Query Editor</h2>

      <div className="space-y-4">
        {/* Query text area */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your DPQL query:
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter DPQL query here..."
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={onRun}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Run Query
          </button>

          <button
            onClick={() => setQuery(sampleQuery)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Load Example
          </button>
        </div>
      </div>

      {/* Help text */}
      <div className="mt-4 text-xs text-gray-500">
        <p>💡 DPQL helps you find patterns like foreign keys, unique constraints, and dependencies in your data.</p>
        <p>🔍 Try the example query or use the preset buttons below for common tasks.</p>
      </div>
    </div>
  );
}
