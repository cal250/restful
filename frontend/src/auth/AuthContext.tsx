import { createContext, useContext, useState } from "react";
import { api } from "../lib/api";
import type { User } from "../lib/types";

type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

type RegistrationOtpResponse = {
  email: string;
  expiresInMinutes: number;
};

type AuthContextValue = {
  user: User | null;
  login(email: string, password: string): Promise<void>;
  startRegistration(input: RegisterInput): Promise<RegistrationOtpResponse>;
  verifyRegistrationOtp(input: { email: string; otp: string }): Promise<void>;
  resendRegistrationOtp(email: string): Promise<RegistrationOtpResponse>;
  logout(): Promise<void>;
  syncUser(user: User): void;
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
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
  }

  /** Starts registration and requests an email verification code. */
  async function startRegistration(input: RegisterInput) {
    return api<RegistrationOtpResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(input)
    });
  }

  /** Verifies the registration OTP and stores the authenticated session. */
  async function verifyRegistrationOtp(input: { email: string; otp: string }) {
    const result = await api<{ user: User; token: string }>("/auth/verify-registration-otp", {
      method: "POST",
      body: JSON.stringify(input)
    });
    localStorage.setItem("token", result.token);
    localStorage.setItem("user", JSON.stringify(result.user));
    setUser(result.user);
  }

  /** Requests a fresh registration OTP for a pending signup. */
  async function resendRegistrationOtp(email: string) {
    return api<RegistrationOtpResponse>("/auth/resend-registration-otp", {
      method: "POST",
      body: JSON.stringify({ email })
    });
  }

  /** Handles sign-out and clears stored credentials. */
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        startRegistration,
        verifyRegistrationOtp,
        resendRegistrationOtp,
        logout,
        syncUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Returns the auth context; throws if used outside AuthProvider. */
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider is required");
  return value;
}
