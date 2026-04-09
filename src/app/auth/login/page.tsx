"use client";

import { useAuth } from "@/context/authcontext";
import { Eye, EyeOff, Mail, Lock, Facebook, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

const getApiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

const LAST_LOGIN_EMAIL_KEY = "ecospark_last_login_email";

type LoginCredentials = {
  email: string;
  password: string;
};

// Fallback to fetch stats using axios directly if `api` from lib isn't needed or available
const fetchStats = async () => {
  const resolvedBaseUrl = getApiBase();
  const res = await axios.get(`${resolvedBaseUrl}/stats`);
  return res.data;
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({ x: (py - 0.5) * -10, y: (px - 0.5) * 10 });
  };

  const handleCardMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email.trim())) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      login(credentials.email.trim(), credentials.password),
    onSuccess: () => {
      if (typeof window !== "undefined") {
        const trimmedEmail = form.email.trim();
        if (trimmedEmail) {
          window.localStorage.setItem(LAST_LOGIN_EMAIL_KEY, trimmedEmail);
        }
      }
      toast.success("Login successful");
      router.push("/");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unable to login right now. Please try again.";
      toast.error(message);
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutate({ email: form.email, password: form.password });
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    const apiBase = getApiBase();
    if (!apiBase || typeof window === "undefined") {
      toast.error("Social login is not configured yet.");
      return;
    }

    window.location.href = `${apiBase}/auth/${provider}`;
  };

  const handleQuickFill = () => {
    if (typeof window === "undefined") {
      toast.error("Quick fill is only available in browser.");
      return;
    }

    const savedEmail = window.localStorage.getItem(LAST_LOGIN_EMAIL_KEY) || "";
    if (!savedEmail) {
      toast.error("No saved account found on this browser yet.");
      return;
    }

    setForm((prev) => ({ ...prev, email: savedEmail }));
    setErrors((prev) => ({ ...prev, email: "" }));
    toast.success("Saved email filled. Enter password or use browser autofill to sign in.");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden px-4 py-8">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-linear-to-br from-white/45 via-white/30 to-emerald-100/25 dark:from-black/65 dark:via-black/50 dark:to-emerald-950/35" />
      <div className="pointer-events-none absolute -top-20 -left-16 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl animate-pulse [animation-delay:900ms]" />

      <div
        className="relative z-10 w-full max-w-md bg-white/55 dark:bg-black/30 backdrop-blur-2xl border border-white/65 dark:border-white/15 ring-1 ring-white/45 dark:ring-white/10 rounded-3xl p-7 sm:p-8 shadow-[0_24px_70px_-28px_rgba(16,185,129,0.55)] text-slate-900 dark:text-white transition-transform duration-300"
        style={{
          transform: `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
      >
        <div className="flex items-center gap-2 mb-6">
          <Image src="/ecospark-logo.svg" alt="EcoSpark Hub" width={126} height={36} className="h-9 w-auto dark:brightness-0 dark:invert" priority />
        </div>

        <div className="mb-7">
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-slate-700 dark:text-white/80 text-sm">Sign in to your account to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-800 dark:text-white/90">
                Email Address
              </label>
              <div
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-white/30 dark:bg-black/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/40 dark:hover:bg-black/30 hover:shadow-[0_8px_30px_-18px_rgba(16,185,129,0.8)] ${
                  errors.email
                    ? "border-red-400 focus-within:border-red-400"
                    : "border-slate-300/70 dark:border-white/20 focus-within:border-emerald-600 dark:focus-within:border-emerald-300"
                }`}
              >
                <Mail className="w-4 h-4 text-slate-500 dark:text-white/60 shrink-0" />
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  value={form.email}
                  onChange={(e) => {
                    setForm({ ...form, email: e.target.value });
                    if (errors.email) {
                      setErrors((prev) => ({ ...prev, email: "" }));
                    }
                  }}
                  placeholder="you@example.com"
                  className="flex-1 outline-none text-slate-900 dark:text-white text-sm bg-transparent placeholder:text-slate-500 dark:placeholder:text-white/50"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 dark:text-red-200 text-xs mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-800 dark:text-white/90">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-slate-700 dark:text-white/90 hover:text-slate-900 dark:hover:text-white font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div
                className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-white/30 dark:bg-black/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/40 dark:hover:bg-black/30 hover:shadow-[0_8px_30px_-18px_rgba(16,185,129,0.8)] ${
                  errors.password
                    ? "border-red-400 focus-within:border-red-400"
                    : "border-slate-300/70 dark:border-white/20 focus-within:border-emerald-600 dark:focus-within:border-emerald-300"
                }`}
              >
                <Lock className="w-4 h-4 text-slate-500 dark:text-white/60 shrink-0" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => {
                    setForm({ ...form, password: e.target.value });
                    if (errors.password) {
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }
                  }}
                  placeholder="Enter your password"
                  className="flex-1 outline-none text-slate-900 dark:text-white text-sm bg-transparent placeholder:text-slate-500 dark:placeholder:text-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 dark:text-red-200 text-xs mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm bg-linear-to-r from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <button
              type="button"
              onClick={handleQuickFill}
              className="w-full py-3 rounded-xl font-semibold text-sm border border-emerald-200 bg-emerald-50/80 text-emerald-800 hover:bg-emerald-100 transition-colors"
            >
              Quick Fill Saved Account
            </button>

            <p className="text-[11px] text-slate-600 dark:text-white/65 text-center">
              Password autofill is provided by your browser password manager.
            </p>
          </form>

          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-300/70 dark:border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-white/55 dark:bg-black/30 px-3 text-slate-600 dark:text-white/70">or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300/70 dark:border-white/20 bg-white/35 dark:bg-black/20 py-2.5 text-sm font-semibold text-slate-800 dark:text-white hover:bg-white/55 dark:hover:bg-black/30 transition-colors"
              >
                <Globe className="h-4 w-4" />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300/70 dark:border-white/20 bg-white/35 dark:bg-black/20 py-2.5 text-sm font-semibold text-slate-800 dark:text-white hover:bg-white/55 dark:hover:bg-black/30 transition-colors"
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { value: stats?.ideasShared ? `${stats.ideasShared}+` : "...", label: "Ideas" },
              { value: stats?.members ? `${stats.members}+` : "...", label: "Members" },
              { value: stats?.approved ? `${stats.approved}+` : "...", label: "Approved" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-300/70 dark:border-white/20 bg-white/35 dark:bg-black/20 backdrop-blur-md p-2.5 text-center">
                <p className="text-base font-bold text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-[11px] text-slate-600 dark:text-white/70">{s.label}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-700 dark:text-white/75 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-slate-900 dark:text-white font-semibold hover:underline transition"
            >
              Create one &rarr;
            </Link>
          </p>
      </div>
      </div>
  );
}
