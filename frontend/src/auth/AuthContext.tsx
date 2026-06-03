import { createContext, useContext, useState } from "react";
import { api } from "../lib/api";
import type { User } from "../lib/types";

type AuthContextValue = {
  user: User | null;
  login(email: string, password: string): Promise<void>;
  registerAccount(input: RegisterInput): Promise<void>;
  logout(): Promise<void>;
  syncUser(user: User): void;
};

type RegisterInput = {
  email: string; password: string; firstName: string; lastName: string;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Provides authentication state and login/logout actions to the app. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  /** Handles user sign-in and persists the session token and profile. */
  async function login(email: string, password: string) {
    const result = await api<{ user: User; token: string }>("/auth/login", {
      method: "POST", body: JSON.stringify({ email, password })
    });
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
  }

  /** Handles new account registration and stores the authenticated session. */
  async function registerAccount(input: RegisterInput) {
    const result = await api<{ user: User; token: string }>("/auth/register", {
      method: "POST", body: JSON.stringify(input)
    });
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
  }

  /** Handles sign-out and clears stored credentials. */
  async function logout() {
    try { await api("/auth/logout", { method: "POST" }); } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  }

  /** Updates the cached user profile after profile edits. */
  function syncUser(nextUser: User) {
    localStorage.setItem("user", JSON.stringify(nextUser));
    setUser(nextUser);
  }

  return <AuthContext.Provider value={{ user, login, registerAccount, logout, syncUser }}>{children}</AuthContext.Provider>;
}

/** Returns the auth context; throws if used outside AuthProvider. */
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider is required");
  return value;
}
