import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  ApiError,
  apiRequest,
} from "./apiClient";


function jsonResponse(status, body) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: vi.fn().mockResolvedValue(body),
  };
}


describe("apiRequest", () => {
  it("sends JSON and the stored bearer token", async () => {
    localStorage.setItem("savefolio_access_token", "test-token");
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(201, { id: 7 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiRequest("/transactions/", {
      method: "POST",
      body: { title: "Lunch" },
    });

    expect(result).toEqual({ id: 7 });
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/api/v1/transactions/",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-token",
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({ title: "Lunch" }),
      }),
    );
  });

  it("clears stale authentication after a 401 response", async () => {
    localStorage.setItem("savefolio_access_token", "expired-token");
    localStorage.setItem(
      "savefolio_user",
      JSON.stringify({ id: 1 }),
    );
    const unauthorizedListener = vi.fn();
    window.addEventListener(
      "savefolio:unauthorized",
      unauthorizedListener,
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(401, { message: "Token expired." }),
      ),
    );

    await expect(apiRequest("/auth/me")).rejects.toMatchObject({
      name: "ApiError",
      message: "Token expired.",
      status: 401,
    });
    expect(localStorage.getItem("savefolio_access_token")).toBeNull();
    expect(localStorage.getItem("savefolio_user")).toBeNull();
    expect(unauthorizedListener).toHaveBeenCalledOnce();

    window.removeEventListener(
      "savefolio:unauthorized",
      unauthorizedListener,
    );
  });

  it("converts a network failure into a useful ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(apiRequest("/health/")).rejects.toEqual(
      new ApiError(
        "Cannot connect to the server. Check that the backend is running.",
      ),
    );
  });
});
