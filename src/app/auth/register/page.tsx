"use client";

import { useAuth } from "@/context/authcontext";
import { Eye, EyeOff, Mail, User, Lock, Facebook, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const getApiBase = () =>
  process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api"
    : process.env.NEXT_PUBLIC_API_URL;

const LAST_LOGIN_EMAIL_KEY = "ecospark_last_login_email";

export default function RegisterPage() {
  const { register } = useAuth();
    const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({}); 
  const [showConfirm, setShowConfirm] = useState(false); 
  const [agreed , setAgreed] = useState(false);
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
    if (!form.name.trim())
      e.name = "Full name is required";
    else if (form.name.trim().length < 3)
      e.name = "Minimum 3 characters";
    if (!form.email.trim())
      e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email.trim()))
      e.email = "Invalid email format";
    if (!form.password)
      e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Minimum 6 characters";
    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!agreed)
      e.agreed = "You must agree to the terms";
    setErrors(e);
    return Object.keys(e).length === 0;
  };


  // tanstack 

   const { mutate, isPending } = useMutation({
    mutationFn: () => register(form.name.trim(), form.email.trim(), form.password),
    onSuccess: () => {
      if (typeof window !== "undefined") {
        const trimmedEmail = form.email.trim();
        if (trimmedEmail) {
          window.localStorage.setItem(LAST_LOGIN_EMAIL_KEY, trimmedEmail);
        }
      }
      toast.success("Welcome to Ecospark! Your account has been created.");
      router.push("/auth/login");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      toast.error(message);
    }
  });

  const handleSubmit = ( e: React.FormEvent) =>{
    e.preventDefault()
    if (!validate()) return;
    mutate();
  }

  const handleSocialLogin = (provider: "google" | "facebook") => {
    const apiBase = getApiBase();
    if (!apiBase || typeof window === "undefined") {
      toast.error("Social login is not configured yet.");
      return;
    }

    window.location.href = `${apiBase}/auth/${provider}`;
  };

   // Password strength
  const getStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 6)           score++;
    if (pass.length >= 10)          score++;
    if (/[A-Z]/.test(pass))         score++;
    if (/[0-9]/.test(pass))         score++;
    if (/[^A-Za-z0-9]/.test(pass))  score++;
    if (score <= 1) return { score, label: "Weak",   color: "bg-red-400"    };
    if (score <= 3) return { score, label: "Medium", color: "bg-yellow-400" };
    return              { score, label: "Strong", color: "bg-green-500"  };
  };

 const strength = getStrength(form.password);

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
      <div className="pointer-events-none absolute bottom-0 right-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl animate-pulse [animation-delay:1000ms]" />

      <div
        className="relative z-10 w-full max-w-lg bg-white/55 dark:bg-black/30 backdrop-blur-2xl border border-white/65 dark:border-white/15 ring-1 ring-white/45 dark:ring-white/10 rounded-3xl p-7 sm:p-8 shadow-[0_24px_70px_-28px_rgba(16,185,129,0.55)] text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto transition-transform duration-300"
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
          <h1 className="text-3xl font-bold mb-2">Create account</h1>
          <p className="text-slate-700 dark:text-white/80 text-sm">Join the EcoSpark community today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-white/90 mb-1.5">
                Full Name
              </label>
              <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-white/30 dark:bg-black/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/40 dark:hover:bg-black/30 hover:shadow-[0_8px_30px_-18px_rgba(16,185,129,0.8)] ${
                errors.name
                  ? "border-red-300"
                  : "border-slate-300/70 dark:border-white/20 focus-within:border-emerald-600 dark:focus-within:border-emerald-300"
              }`}>
                <User className="w-4 h-4 text-slate-500 dark:text-white/60 shrink-0" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Your full name"
                  className="flex-1 outline-none text-slate-900 dark:text-white text-sm bg-transparent placeholder:text-slate-500 dark:placeholder:text-white/50"
                />
              </div>
              {errors.name && (
                <p className="text-red-600 dark:text-red-200 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-white/90 mb-1.5">
                Email Address
              </label>
              <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-white/30 dark:bg-black/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/40 dark:hover:bg-black/30 hover:shadow-[0_8px_30px_-18px_rgba(16,185,129,0.8)] ${
                errors.email
                  ? "border-red-300"
                  : "border-slate-300/70 dark:border-white/20 focus-within:border-emerald-600 dark:focus-within:border-emerald-300"
              }`}>
                <Mail className="w-4 h-4 text-slate-500 dark:text-white/60 shrink-0" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="you@example.com"
                  className="flex-1 outline-none text-slate-900 dark:text-white text-sm bg-transparent placeholder:text-slate-500 dark:placeholder:text-white/50"
                />
              </div>
              {errors.email && (
                <p className="text-red-600 dark:text-red-200 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-white/90 mb-1.5">
                Password
              </label>
              <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-white/30 dark:bg-black/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/40 dark:hover:bg-black/30 hover:shadow-[0_8px_30px_-18px_rgba(16,185,129,0.8)] ${
                errors.password
                  ? "border-red-300"
                  : "border-slate-300/70 dark:border-white/20 focus-within:border-emerald-600 dark:focus-within:border-emerald-300"
              }`}>
                <Lock className="w-4 h-4 text-slate-500 dark:text-white/60 shrink-0" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Min. 6 characters"
                  className="flex-1 outline-none text-slate-900 dark:text-white text-sm bg-transparent placeholder:text-slate-500 dark:placeholder:text-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                >
                  {showPass
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 dark:text-red-200 text-xs mt-1">{errors.password}</p>
              )}

              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                          i <= strength.score
                            ? strength.color
                            : "bg-slate-300/60 dark:bg-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.label === "Weak"
                      ? "text-red-600 dark:text-red-200"
                      : strength.label === "Medium"
                      ? "text-yellow-700 dark:text-yellow-200"
                      : "text-emerald-700 dark:text-emerald-200"
                  }`}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-800 dark:text-white/90 mb-1.5">
                Confirm Password
              </label>
              <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-white/30 dark:bg-black/20 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/40 dark:hover:bg-black/30 hover:shadow-[0_8px_30px_-18px_rgba(16,185,129,0.8)] ${
                errors.confirmPassword
                  ? "border-red-300"
                  : form.confirmPassword &&
                    form.password === form.confirmPassword
                  ? "border-emerald-300"
                  : "border-slate-300/70 dark:border-white/20 focus-within:border-emerald-600 dark:focus-within:border-emerald-300"
              }`}>
                <Lock className="w-4 h-4 text-slate-500 dark:text-white/60 shrink-0" />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter your password"
                  className="flex-1 outline-none text-slate-900 dark:text-white text-sm bg-transparent placeholder:text-slate-500 dark:placeholder:text-white/50"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-slate-500 dark:text-white/60 hover:text-slate-900 dark:hover:text-white"
                >
                  {showConfirm
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 dark:text-red-200 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
              {form.confirmPassword &&
                form.password === form.confirmPassword && (
                  <p className="text-emerald-700 dark:text-emerald-200 text-xs mt-1">
                    ✓ Passwords match
                  </p>
                )}
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-emerald-500"
                />
                <span className="text-sm text-slate-700 dark:text-white/85 leading-relaxed">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-slate-900 dark:text-white font-medium hover:underline"
                  >
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-slate-900 dark:text-white font-medium hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreed && (
                <p className="text-red-600 dark:text-red-200 text-xs mt-1">{errors.agreed}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 rounded-xl font-semibold text-white text-sm bg-linear-to-r from-emerald-500 to-green-400 hover:from-emerald-600 hover:to-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 mt-2 shadow-lg shadow-emerald-500/30 hover:-translate-y-0.5"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account "
              )}
            </button>
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

          <p className="text-center text-sm text-slate-700 dark:text-white/75 mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-slate-900 dark:text-white font-semibold hover:underline transition"
            >
              Sign in →
            </Link>
          </p>
      </div>
    </div>
  );

}