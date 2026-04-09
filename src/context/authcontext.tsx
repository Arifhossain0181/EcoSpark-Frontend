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
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfileLocal: (next: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const readStoredUser = (): User | null => {
    const cookieUser = Cookies.get("ecospark_user");
    const localUser = typeof window !== "undefined" ? window.localStorage.getItem("ecospark_user") : null;
    const stored = cookieUser || localUser;

    if (!stored || stored === "undefined" || stored === "null") return null;

    try {
      return JSON.parse(stored) as User;
    } catch {
      return null;
    }
  };

  const persistSession = (loggedInUser: User, accessToken: string, refreshToken: string) => {
    Cookies.set("accessToken", accessToken, { sameSite: "lax", path: "/" });
    Cookies.set("refreshToken", refreshToken, { sameSite: "lax", path: "/" });
    Cookies.set("ecospark_user", JSON.stringify(loggedInUser), {
      sameSite: "lax",
      path: "/",
    });

    if (typeof window !== "undefined") {
      window.localStorage.setItem("accessToken", accessToken);
      window.localStorage.setItem("refreshToken", refreshToken);
      window.localStorage.setItem("ecospark_user", JSON.stringify(loggedInUser));
    }
  };

  const clearSession = () => {
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("refreshToken", { path: "/" });
    Cookies.remove("ecospark_user", { path: "/" });

    if (typeof window !== "undefined") {
      window.localStorage.removeItem("accessToken");
      window.localStorage.removeItem("refreshToken");
      window.localStorage.removeItem("ecospark_user");
      window.localStorage.removeItem("token");
    }
  };

  const hydrateUserFromApi = async () => {
    try {
      const { data } = await api.get<{ id: string; name: string; email: string; role?: string }>("auth/me");
      const hydratedUser: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
      };
      Cookies.set("ecospark_user", JSON.stringify(hydratedUser), { sameSite: "lax", path: "/" });
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ecospark_user", JSON.stringify(hydratedUser));
      }
      setUser(hydratedUser);
    } catch {
      clearSession();
      setUser(null);
    }
  };

  useEffect(() => {
    const bootstrapAuth = async () => {
      // Clean up any legacy token cookie that might have an invalid value
      if (Cookies.get("token")) {
        Cookies.remove("token", { path: "/" });
      }

      if (typeof window !== "undefined" && window.localStorage.getItem("token")) {
        window.localStorage.removeItem("token");
      }

      const parsedUser = readStoredUser();
      const accessToken =
        Cookies.get("accessToken") ||
        (typeof window !== "undefined" ? window.localStorage.getItem("accessToken") || undefined : undefined);

      if (parsedUser) {
        setUser(parsedUser);
        return;
      }

      if (accessToken) {
        await hydrateUserFromApi();
      } else {
        clearSession();
        setUser(null);
      }
    };

    bootstrapAuth().finally(() => {
      setLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post<{
      message: string;
      accessToken: string;
      refreshToken: string;
      user: User;
      data?: {
        accessToken?: string;
        refreshToken?: string;
        user?: User;
      };
    }>("auth/login", { email, password });

    const root = response.data;
    const nested = root?.data;

    const accessToken = root?.accessToken || nested?.accessToken;
    const refreshToken = root?.refreshToken || nested?.refreshToken;
    const loggedInUser = root?.user || nested?.user;

    if (!accessToken || !refreshToken || !loggedInUser) {
      console.error("Auth response missing expected fields", response.data);
      throw new Error("Authentication failed: invalid server response");
    }

    persistSession(loggedInUser, accessToken, refreshToken);
    setUser(loggedInUser);
    return loggedInUser;
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
    clearSession();
    setUser(null);
  };

  const updateProfileLocal = (next: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        ...(next.name ? { name: next.name } : {}),
        ...(next.email ? { email: next.email } : {}),
      };
      Cookies.set("ecospark_user", JSON.stringify(updated), { sameSite: "lax", path: "/" });
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ecospark_user", JSON.stringify(updated));
      }
      return updated;
    });
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfileLocal,
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