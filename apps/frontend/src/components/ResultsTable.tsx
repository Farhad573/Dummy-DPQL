//component to display query results
import React from "react";

// Component props
type ResultsTableProps = {
  result: any;
};

export default function ResultsTable({ result }: ResultsTableProps) {
  // Don't render anything if there are no results
  if (!result) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-600">No results yet. Upload some data and run a query!</p>
      </div>
    );
  }

  const { tables, warnings } = result;

  //display cell content
  const displayCellContent = (cellValue: any): string => {
    if (Array.isArray(cellValue)) {
      return cellValue.join(", ");
    }
    return String(cellValue);
  };

  return (
    <div className="space-y-6">
      {/* Show warnings if any */}
      {warnings && warnings.length > 0 && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">⚠️ Warnings:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {warnings.map((warning: string, index: number) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Display each result table */}
      {tables && tables.map((table: any, tableIndex: number) => (
        <div key={tableIndex} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {table.name} ({table.rows.length} results)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-100">
                <tr>
                  {table.columns.map((columnName: string, colIndex: number) => (
                    <th
                      key={colIndex}
                      className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b"
                    >
                      {columnName}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {table.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={table.columns.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No data found
                    </td>
                  </tr>
                ) : (
                  table.rows.map((row: any[], rowIndex: number) => (
                    <tr
                      key={rowIndex}
                      className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {row.map((cell: any, cellIndex: number) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-sm text-gray-900 border-b font-mono"
                        >
                          {displayCellContent(cell)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Show message if no tables */}
      {(!tables || tables.length === 0) && (
        <div className="p-6 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">No tables in results</p>
        </div>
      )}
    </div>
  );
}
