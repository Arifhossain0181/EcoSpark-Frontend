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
    const fetchMe = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) {
          setLoading(false);
          return;
        }

        const { data } = await api.get<User>("/auth/me");
        setUser(data);
      } catch (err) {
        Cookies.remove("token");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: User }>(
      "/auth/login",
      { email, password }
    );

    Cookies.set("token", data.token, { expires: 7 });
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post<{ token: string; user: User }>(
      "/auth/register",
      {
        name,
        email,
        password,
      }
    );

    Cookies.set("token", data.token, { expires: 7 });
    setUser(data.user);
  };

  const logout = () => {
    Cookies.remove("token");
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

export const  useAuths = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
export const useAuth = () => useContext(AuthContext);