import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import useAuth from "../hooks/useAuth";
import {
  getCurrentUser,
  loginUser,
} from "../services/authService";
import { AuthProvider } from "./AuthContext";


vi.mock("../services/authService", () => ({
  getCurrentUser: vi.fn(),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
}));


function AuthHarness() {
  const { user, login, logout } = useAuth();

  return (
    <div>
      <span>{user ? user.name : "Signed out"}</span>
      <button
        type="button"
        onClick={() => login({
          email: "person@example.com",
          password: "password123",
        })}
      >
        Log in
      </button>
      <button type="button" onClick={logout}>
        Log out
      </button>
    </div>
  );
}


describe("AuthProvider", () => {
  beforeEach(() => {
    getCurrentUser.mockReset();
    loginUser.mockReset();
  });

  it("stores a successful login and removes it on logout", async () => {
    const user = userEvent.setup();
    const authenticatedUser = {
      id: 1,
      name: "Test User",
      email: "person@example.com",
      is_admin: false,
    };
    loginUser.mockResolvedValue({
      access_token: "access-token",
      user: authenticatedUser,
    });

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await user.click(screen.getByRole("button", { name: "Log in" }));
    expect(await screen.findByText("Test User")).toBeInTheDocument();
    expect(localStorage.getItem("savefolio_access_token")).toBe(
      "access-token",
    );
    expect(JSON.parse(localStorage.getItem("savefolio_user"))).toEqual(
      authenticatedUser,
    );

    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(screen.getByText("Signed out")).toBeInTheDocument();
    expect(localStorage.getItem("savefolio_access_token")).toBeNull();
  });

  it("clears stale authentication when session restoration fails", async () => {
    localStorage.setItem("savefolio_access_token", "expired-token");
    localStorage.setItem(
      "savefolio_user",
      JSON.stringify({ id: 1, name: "Stale User" }),
    );
    getCurrentUser.mockRejectedValue(new Error("Expired"));

    render(
      <AuthProvider>
        <AuthHarness />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Signed out")).toBeInTheDocument();
    });
    expect(localStorage.getItem("savefolio_access_token")).toBeNull();
    expect(localStorage.getItem("savefolio_user")).toBeNull();
  });
});
