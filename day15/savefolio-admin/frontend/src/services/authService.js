import { apiRequest } from "./apiClient";

export function registerUser(data) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: data,
  });
}

export function loginUser(data) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: data,
  });
}

export function getCurrentUser() {
  return apiRequest("/auth/me");
}