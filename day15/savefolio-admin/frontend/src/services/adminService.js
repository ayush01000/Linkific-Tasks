import { apiRequest } from "./apiClient";


export function getAdminOverview() {
  return apiRequest("/admin/overview");
}


export function getAdminUsers({
  search = "",
  skip = 0,
  limit = 10,
}) {
  const parameters = new URLSearchParams();

  if (search.trim()) {
    parameters.set("search", search.trim());
  }

  parameters.set("skip", String(skip));
  parameters.set("limit", String(limit));

  return apiRequest(`/admin/users?${parameters}`);
}


export function updateAdminUser(id, data) {
  return apiRequest(`/admin/users/${id}`, {
    method: "PATCH",
    body: data,
  });
}


export function getAdminTransactions({
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
    `/admin/transactions?${parameters}`,
  );
}


export function deleteAdminTransaction(id) {
  return apiRequest(`/admin/transactions/${id}`, {
    method: "DELETE",
  });
}
