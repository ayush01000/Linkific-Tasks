const API_URL =
  import.meta.env.VITE_API_URL ??
  "http://127.0.0.1:8000/api/v1";

export class ApiError extends Error {
  constructor(message, status = 0, errors = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest(
  path,
  {
    method = "GET",
    body,
    headers = {},
  } = {},
) {
  const token = localStorage.getItem(
    "savefolio_access_token",
  );

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: {
        Accept: "application/json",
        ...(body
          ? { "Content-Type": "application/json" }
          : {}),
        ...(token
          ? { Authorization: `Bearer ${token}` }
          : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Cannot connect to the server. Check that the backend is running.",
    );
  }

  if (response.status === 204) {
    return null;
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem(
        "savefolio_access_token",
      );
      localStorage.removeItem("savefolio_user");

      window.dispatchEvent(
        new Event("savefolio:unauthorized"),
      );
    }

    throw new ApiError(
      data?.message ??
        data?.detail ??
        "The request could not be completed.",
      response.status,
      data?.errors ?? [],
    );
  }

  return data;
}