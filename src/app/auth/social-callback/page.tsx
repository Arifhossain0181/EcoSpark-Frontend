"use client";

import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface SocialUser {
  id: string;
  name: string;
  email: string;
  role?: string;
}

const decodeUser = (encoded: string): SocialUser | null => {
  try {
    const json = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as SocialUser;
  } catch {
    return null;
  }
};

export default function SocialCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const encodedUser = params.get("user");

    if (error) {
      toast.error(error);
      router.replace("/auth/login");
      return;
    }

    if (!accessToken || !refreshToken || !encodedUser) {
      toast.error("Social login failed. Missing auth payload.");
      router.replace("/auth/login");
      return;
    }

    const user = decodeUser(encodedUser);
    if (!user) {
      toast.error("Social login failed. Invalid user payload.");
      router.replace("/auth/login");
      return;
    }

    Cookies.set("accessToken", accessToken, { sameSite: "lax", path: "/" });
    Cookies.set("refreshToken", refreshToken, { sameSite: "lax", path: "/" });
    Cookies.set("ecospark_user", JSON.stringify(user), { sameSite: "lax", path: "/" });

    window.localStorage.setItem("accessToken", accessToken);
    window.localStorage.setItem("refreshToken", refreshToken);
    window.localStorage.setItem("ecospark_user", JSON.stringify(user));

    toast.success("Logged in with social account");
    router.replace("/");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f4e9] px-4">
      <div className="text-center">
        <p className="text-lg font-semibold text-[#1a3a2a]">Completing social login...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait a moment.</p>
      </div>
    </div>
  );
}
