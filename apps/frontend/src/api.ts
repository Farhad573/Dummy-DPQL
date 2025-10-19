//API functions for communicating with the backend
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

//handle API responses
async function handleResponse(response: Response) {
  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

// upload a CSV file to the backend
export async function uploadCsv(file: File, datasetName?: string) {
  const formData = new FormData();

  if (datasetName && datasetName.trim()) {
    formData.append("name", datasetName.trim());
  }

  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: "POST",
    body: formData
  });

  return handleResponse(response);
}

//execute a DPQL query
export async function executeQuery(queryText: string) {
  const response = await fetch(`${API_BASE_URL}/api/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: queryText })
  });

  return handleResponse(response);
}

// get list of all loaded datasets
export async function getDatasets() {
  const response = await fetch(`${API_BASE_URL}/api/datasets`);
  const data = await handleResponse(response);
  return data.datasets;
}

//find unique column combinations
export async function getUcc(maxWidth = 2) {
  const response = await fetch(`${API_BASE_URL}/api/ucc?maxWidth=${maxWidth}`);
  const data = await handleResponse(response);
  return data.result;
}

//   Delete a specific dataset
export async function deleteDataset(datasetName: string) {
  const response = await fetch(`${API_BASE_URL}/api/datasets/${encodeURIComponent(datasetName)}`, {
    method: "DELETE"
  });

  return handleResponse(response);
}

//Delete  all datasets
export async function deleteAllDatasets() {
  const response = await fetch(`${API_BASE_URL}/api/datasets`, {
    method: "DELETE"
  });

  return handleResponse(response);
}
