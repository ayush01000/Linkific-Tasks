import {
  createContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCurrentUser,
  loginUser,
  registerUser,
} from "../services/authService";

export const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const storedUser = localStorage.getItem(
      "savefolio_user",
    );

    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  function saveAuthentication(data) {
    localStorage.setItem(
      "savefolio_access_token",
      data.access_token,
    );

    localStorage.setItem(
      "savefolio_user",
      JSON.stringify(data.user),
    );

    setUser(data.user);
  }

  async function login(credentials) {
    const data = await loginUser(credentials);
    saveAuthentication(data);
    return data;
  }

  async function register(details) {
    return registerUser(details);
  }

  function logout() {
    localStorage.removeItem(
      "savefolio_access_token",
    );
    localStorage.removeItem("savefolio_user");
    setUser(null);
  }

  useEffect(() => {
    const token = localStorage.getItem(
      "savefolio_access_token",
    );

    if (!token) {
      return undefined;
    }

    let active = true;

    getCurrentUser()
      .then((currentUser) => {
        if (!active) {
          return;
        }

        localStorage.setItem(
          "savefolio_user",
          JSON.stringify(currentUser),
        );
        setUser(currentUser);
      })
      .catch(() => {
        if (!active) {
          return;
        }

        localStorage.removeItem(
          "savefolio_access_token",
        );
        localStorage.removeItem("savefolio_user");
        setUser(null);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
    }

    window.addEventListener(
      "savefolio:unauthorized",
      handleUnauthorized,
    );

    return () => {
      window.removeEventListener(
        "savefolio:unauthorized",
        handleUnauthorized,
      );
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
    }),
    [user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
