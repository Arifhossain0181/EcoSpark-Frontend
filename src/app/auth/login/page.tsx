"use client";

import { useAuth } from "@/context/authcontext";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  
  const router = useRouter();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});


  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email.trim())
      e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Invalid email format";
    if (!form.password)
      e.password = "Password is required";
    else if (form.password.length < 6)
      e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  //tanstack
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
  const handleSubmit = ( e: React.FormEvent) =>{
    e.preventDefault()
    if (!validate()) return;
    mutate();
  }
  return  (
    <div className="min-h-screen bg-[#f8f4e9] flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1a3a2a] via-[#2d6a4f] to-[#40916c] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <img src="/ecospark-logo.svg" alt="EcoSpark Hub" className="h-10 w-auto" />
        </div>

        {/* Quote */}
        <div className="z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            The Earth does not
            <br />
            <span className="text-[#74c69d] italic">belong to us.</span>
            <br />
            We belong to the Earth.
          </h2>
          <p className="text-[#b7e4c7] text-base leading-relaxed max-w-sm">
            Join thousands of changemakers sharing sustainability ideas
            that make a real difference for our planet.
          </p>
        </div>

        {/* Stats */}
        <div className="flex gap-8 z-10">
          {[
            { value: "500+", label: "Ideas Shared" },
            { value: "2K+",  label: "Members"      },
            { value: "300+", label: "Approved"     },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-[#74c69d] text-2xl font-bold">{s.value}</p>
              <p className="text-[#b7e4c7] text-sm opacity-80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <img src="/ecospark-logo.svg" alt="EcoSpark Hub" className="h-9 w-auto" />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a3a2a] mb-2">
              Welcome back 
            </h1>
            <p className="text-gray-500 text-sm">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#1a3a2a] mb-1.5">
                Email Address
              </label>
              <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 bg-white transition-colors ${
                errors.email
                  ? "border-red-400"
                  : "border-gray-200 focus-within:border-[#40916c]"
              }`}>
                <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  placeholder="you@example.com"
                  className="flex-1 outline-none text-gray-800 text-sm bg-transparent placeholder:text-gray-400"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-[#1a3a2a]">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-[#40916c] hover:text-[#2d6a4f] font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 bg-white transition-colors ${
                errors.password
                  ? "border-red-400"
                  : "border-gray-200 focus-within:border-[#40916c]"
              }`}>
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  className="flex-1 outline-none text-gray-800 text-sm bg-transparent placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPass
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#2d6a4f] hover:bg-[#1a3a2a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 text-sm"
            >
              {isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In "
              )}
            </button>
          </form>

         

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-[#2d6a4f] font-semibold hover:text-[#1a3a2a] transition"
            >
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );


}
