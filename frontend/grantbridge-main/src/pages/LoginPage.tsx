import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAppStore } from "../lib/store";
import { authApi } from "../lib/api";
import type { UserRole } from "../lib/store";

export default function LoginPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const userRole: UserRole = role === "funder" ? "funder" : "entrepreneur";
  const isEntrepreneur = userRole === "entrepreneur";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const handleLogin = async () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "Email is required";
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setApiError("");
    try {
      const res = await authApi.login({ email: form.email, password: form.password });
      // SimpleJWT returns tokens at top level, not nested under data
      const access = res.data?.access || (res as any).access;
      const refresh = res.data?.refresh || (res as any).refresh;
      const user = res.data?.user || (res as any).user;
      login(
        {
          id: user!.id,
          email: user!.email,
          fullName: user!.full_name,
          role: user!.role as UserRole,
          verificationStatus: user!.is_email_verified ? "verified" : "pending",
        },
        { access: access!, refresh: refresh! }
      );
      navigate("/dashboard");
    } catch (err: any) {
      setApiError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* LEFT PANEL (Desktop only) */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-gradient-to-br from-brand-500 via-brand-600 to-emerald-700 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-16">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl font-[Outfit]">
                  G
                </span>
              </div>
              <span className="text-xl font-bold text-white font-[Outfit] tracking-tight">
                GrantBridge
              </span>
            </Link>

            {/* Welcome text */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white font-[Outfit] leading-tight whitespace-pre-line">
                {isEntrepreneur
                  ? "Welcome Back,\nInnovator"
                  : "Welcome Back,\nInvestor"}
              </h2>

              <p className="mt-4 text-brand-100 leading-relaxed">
                {isEntrepreneur
                  ? "Continue building your dream. Your pitches and connections are waiting."
                  : "New opportunities await. Check out the latest pitches from top entrepreneurs."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Always visible) */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-brand-600 font-[Outfit]">
                GrantBridge
              </h2>
              <p className="text-sm text-slate-500">
                New here?{" "}
                <Link
                  to={`/signup/${role}`}
                  className="text-brand-600 font-medium hover:underline"
                >
                  Create account
                </Link>
              </p>
            </div>

            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center">
                🔑
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-center text-slate-900 font-[Outfit]">
              Welcome back
            </h1>
            <p className="text-sm text-center text-slate-500 mt-1 mb-6">
              Log in to your GrantBridge account
            </p>

            {/* Form */}
            <div className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                icon={<Mail size={18} />}
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                error={errors.email}
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                icon={<Lock size={18} />}
                value={form.password}
                onChange={(e) => updateField("password", e.target.value)}
                error={errors.password}
              />

              <div className="flex justify-end">
                <a href="#" className="text-sm text-brand-600 hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Log in"}
                {!loading && <ArrowRight size={18} />}
              </Button>
              {apiError && (
                <p className="text-sm text-red-500 text-center">{apiError}</p>
              )}
            </div>

            {/* Info box */}
            {/* <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-500">
              ℹ️ You don't need to select your role. We'll take you straight to
              your dashboard — entrepreneur or funder.
            </div> */}

            {/* Footer */}
            <div className="mt-6 border-t pt-4 text-center text-sm text-slate-500">
              Don’t have an account?{" "}
              <Link
                to={`/signup/${role}`}
                className="text-brand-600 font-medium hover:underline"
              >
                Sign up for free
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
