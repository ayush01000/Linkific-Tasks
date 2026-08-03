import { apiRequest } from "./apiClient";

export function getTransactions({
  search = "",
  type = "",
  skip = 0,
  limit = 10,
}) {
  const parameters = new URLSearchParams();

  if (search.trim()) {
    parameters.set("search", search.trim());
  }

  if (type) {
    parameters.set("type", type);
  }

  parameters.set("skip", String(skip));
  parameters.set("limit", String(limit));

  return apiRequest(
    `/transactions/?${parameters.toString()}`,
  );
}

export function createTransaction(data) {
  return apiRequest("/transactions/", {
    method: "POST",
    body: data,
  });
}

export function updateTransaction(id, data) {
  return apiRequest(`/transactions/${id}`, {
    method: "PATCH",
    body: data,
  });
}

export function deleteTransaction(id) {
  return apiRequest(`/transactions/${id}`, {
    method: "DELETE",
  });
}