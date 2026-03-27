"use client";

import { useAuth } from "@/context/authcontext";
import { Eye, EyeOff, Mail, User, Lock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register } = useAuth();
    const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

    const [showPass, setShowPass] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({}); 
  const [showConfirm, setShowConfirm] = useState(false); 
  const [agreed , setAgreed] = useState(false);


    const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())
      e.name = "Full name is required";
    else if (form.name.trim().length < 3)
      e.name = "Minimum 3 characters";
    if (!form.email)
      e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
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
    mutationFn: () => register(form.name, form.email, form.password),
    onSuccess: () => {
      toast.success("Welcome to Ecospark! Your account has been created.");
      router.push("/auth/login");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (err: any) => {
      const message = err?.response?.data?.message ?? "Registration failed. Please try again.";
      toast.error(message);
    }
  });

  const handleSubmit = ( e: React.FormEvent) =>{
    e.preventDefault()
    if (!validate()) return;
    mutate();
  }

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
    <div className="min-h-screen bg-[#f8f4e9] flex">

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-[#1a3a2a] via-[#2d6a4f] to-[#40916c] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute -bottom-16 -left-16 w-96 h-96 rounded-full bg-white/5" />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <Image src="/ecospark-logo.svg" alt="EcoSpark Hub" width={140} height={40} className="h-10 w-auto" priority />
        </div>

        {/* Features */}
        <div className="z-10">
          <h2 className="text-3xl font-bold text-white mb-6 leading-tight">
            Join the movement
            <br />
            <span className="text-[#74c69d] italic">for a greener world</span>
          </h2>
          <div className="space-y-4">
            {[
              { icon: "", title: "Share Ideas",    desc: "Post your sustainability ideas for the community"  },
              { icon: "", title: "Vote & Discuss", desc: "Upvote great ideas and join the conversation"      },
              { icon: "", title: "Get Recognized", desc: "Top ideas get featured on the homepage"            },
              { icon: "", title: "Make Impact",    desc: "Turn ideas into real environmental change"         },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-[#b7e4c7] text-xs opacity-80 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[#b7e4c7] text-sm opacity-70 z-10">
           100% free to join. No spam ever.
        </p>
      </div>

      {/* ── Right Panel ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Image src="/ecospark-logo.svg" alt="EcoSpark Hub" width={126} height={36} className="h-9 w-auto" priority />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1a3a2a] mb-2">
              Create account 
            </h1>
            <p className="text-gray-500 text-sm">
              Join the EcoSpark community today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-[#1a3a2a] mb-1.5">
                Full Name
              </label>
              <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 bg-white transition-colors ${
                errors.name
                  ? "border-red-400"
                  : "border-gray-200 focus-within:border-[#40916c]"
              }`}>
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  placeholder="Your full name"
                  className="flex-1 outline-none text-gray-800 text-sm bg-transparent placeholder:text-gray-400"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

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
              <label className="block text-sm font-medium text-[#1a3a2a] mb-1.5">
                Password
              </label>
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
                  placeholder="Min. 6 characters"
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
                            : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${
                    strength.label === "Weak"
                      ? "text-red-500"
                      : strength.label === "Medium"
                      ? "text-yellow-600"
                      : "text-green-600"
                  }`}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#1a3a2a] mb-1.5">
                Confirm Password
              </label>
              <div className={`flex items-center gap-3 border-2 rounded-xl px-4 py-3 bg-white transition-colors ${
                errors.confirmPassword
                  ? "border-red-400"
                  : form.confirmPassword &&
                    form.password === form.confirmPassword
                  ? "border-green-400"
                  : "border-gray-200 focus-within:border-[#40916c]"
              }`}>
                <Lock className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({ ...form, confirmPassword: e.target.value })
                  }
                  placeholder="Re-enter your password"
                  className="flex-1 outline-none text-gray-800 text-sm bg-transparent placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirm
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
              {form.confirmPassword &&
                form.password === form.confirmPassword && (
                  <p className="text-green-600 text-xs mt-1">
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
                  className="mt-0.5 w-4 h-4 accent-green-600"
                />
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-[#2d6a4f] font-medium hover:underline"
                  >
                    Terms of Use
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-[#2d6a4f] font-medium hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </span>
              </label>
              {errors.agreed && (
                <p className="text-red-500 text-xs mt-1">{errors.agreed}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#2d6a4f] hover:bg-[#1a3a2a] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 text-sm mt-2"
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

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-[#2d6a4f] font-semibold hover:text-[#1a3a2a] transition"
            >
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
    
}