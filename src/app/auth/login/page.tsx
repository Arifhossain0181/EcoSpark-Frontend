"use client";

import { useAuth } from "@/context/authcontext";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

// Fallback to fetch stats using axios directly if `api` from lib isn't needed or available
const fetchStats = async () => {
  const resolvedBaseUrl =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5000/api"
      : process.env.NEXT_PUBLIC_API_URL;
  const res = await axios.get(`${resolvedBaseUrl}/stats`);
  return res.data;
};

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => login(form.email, form.password),
    onSuccess: () => {
      toast.success("Login successful");
      router.push("/");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const message = err?.response?.data?.message ?? "Login failed";
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
    mutate();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-emerald-900 flex-col justify-between p-12 relative overflow-hidden text-emerald-50">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <Image src="/ecospark-logo.svg" alt="EcoSpark Hub" width={140} height={40} className="h-10 w-auto brightness-0 invert" priority />
        </div>

        {/* Quote */}
        <div className="z-10">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            The Earth does not
            <br />
            <span className="text-emerald-400 italic">belong to us.</span>
            <br />
            We belong to the Earth.
          </h2>
          <p className="text-emerald-200 text-base leading-relaxed max-w-sm">
            Join thousands of changemakers sharing sustainability ideas that make a real difference for our planet.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-8 z-10 transition-all duration-300">
          {[
            { value: stats?.ideasShared ? `${stats.ideasShared}+` : "...", label: "Ideas Shared" },
            { value: stats?.members ? `${stats.members}+` : "...", label: "Members" },
            { value: stats?.approved ? `${stats.approved}+` : "...", label: "Approved" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-emerald-400 text-3xl font-bold tracking-tight">{s.value}</p>
              <p className="text-emerald-200 text-sm opacity-80 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 text-foreground">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Image src="/ecospark-logo.svg" alt="EcoSpark Hub" width={126} height={36} className="h-9 w-auto dark:invert" priority />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-foreground">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                Email Address
              </label>
              <div
                className={`flex items-center gap-3 border rounded-lg px-4 py-3 bg-background transition-colors ${
                  errors.email
                    ? "border-destructive/60 focus-within:border-destructive"
                    : "border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
                }`}
              >
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="flex-1 outline-none text-foreground text-sm bg-transparent placeholder:text-muted-foreground"
                />
              </div>
              {errors.email && (
                <p className="text-destructive text-xs mt-1 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:text-primary/80 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div
                className={`flex items-center gap-3 border rounded-lg px-4 py-3 bg-background transition-colors ${
                  errors.password
                    ? "border-destructive/60 focus-within:border-destructive"
                    : "border-input focus-within:border-primary focus-within:ring-1 focus-within:ring-primary"
                }`}
              >
                <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="flex-1 outline-none text-foreground text-sm bg-transparent placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1 font-medium">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-60 disabled:cursor-not-allowed font-medium py-3.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm shadow-sm"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-primary font-semibold hover:underline transition"
            >
              Create one &rarr;
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
