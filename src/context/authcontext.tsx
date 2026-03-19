"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import Cookies from "js-cookie";
import api from "@/lib/axios";

// Fallback User type for the client app
export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clean up any legacy token cookie that might have an invalid value
    if (Cookies.get("token")) {
      Cookies.remove("token");
    }
    const stored = Cookies.get("ecospark_user");

    // Guard against invalid values like the literal string "undefined" or "null"
    if (!stored || stored === "undefined" || stored === "null") {
      if (stored) {
        Cookies.remove("ecospark_user");
      }
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as User;
      setUser(parsed);
    } catch (err) {
      console.error("Failed to parse stored user", err);
      Cookies.remove("ecospark_user");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{
      message: string;
      accessToken: string;
      refreshToken: string;
      user: User;
    }>("auth/login", { email, password });

    const { accessToken, refreshToken, user: loggedInUser } = data;

    if (!accessToken || !refreshToken) {
      console.error("Auth response missing tokens", data);
      throw new Error("Authentication failed: tokens not provided by server");
    }

    Cookies.set("accessToken", accessToken, { sameSite: "lax" });
    Cookies.set("refreshToken", refreshToken, { sameSite: "lax" });
    Cookies.set("ecospark_user", JSON.stringify(loggedInUser), {
      sameSite: "lax",
    });
    setUser(loggedInUser);
  };

  const register = async (name: string, email: string, password: string) => {
    await api.post<{
      message: string;
      accessToken: string;
      refreshToken: string;
      user: User;
    }>("auth/register", {
      name,
      email,
      password,
    });
    // Do NOT auto-login after registration.
    // The user must explicitly log in to populate `user` state.
  };

  const logout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("ecospark_user");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};