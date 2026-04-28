import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, User, Building2, Phone, ArrowRight, ArrowLeft, CheckCircle2, Clock,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import { useAppStore } from "../lib/store";
import { authApi } from "../lib/api";
import type { UserRole } from "../lib/store";

type ModalType =
  | "none"
  | "emailSent"
  | "emailVerified"
  | "linkExpired"
  | "phoneVerify";

export default function SignupPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const login = useAppStore((s) => s.login);
  const userRole: UserRole = role === "funder" ? "funder" : "entrepreneur";

  const [step, setStep] = useState(1);
  const [modal, setModal] = useState<ModalType>("none");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    company: "",
    phone: "",
    otp: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!form.fullName.trim()) errs.fullName = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 8)
      errs.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    if (!form.agreeTerms) errs.agreeTerms = "You must agree to the terms";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Submit = () => {
    if (!validateStep1()) return;
    setStep(2);
  };

  const handleStep2Submit = async () => {
    if (!form.company.trim()) {
      setErrors({ company: "Company/Organization name is required" });
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      await authApi.register({
        email: form.email,
        full_name: form.fullName,
        role: userRole,
        password: form.password,
        password2: form.confirmPassword,
      });
      // Auto-login after register
      const loginRes = await authApi.login({ email: form.email, password: form.password });
      const access = (loginRes as any).access;
      const refresh = (loginRes as any).refresh;
      const user = (loginRes as any).user;
      login(
        { id: user.id, email: user.email, fullName: user.full_name, role: user.role as UserRole, verificationStatus: "verified" },
        { access, refresh }
      );
      navigate("/dashboard");
    } catch (err: any) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    // The OTP code will come from the verify-email page
    // For now transition to verified state
    setModal("emailVerified");
  };

  const handleEmailVerifiedContinue = () => {
    setModal("phoneVerify");
  };

  const handlePhoneVerify = () => {
    if (form.otp.length < 4) return;
    login(
      {
        id: "temp",
        email: form.email,
        fullName: form.fullName,
        role: userRole,
        company: form.company,
        phone: form.phone,
        verificationStatus: "pending",
      }
    );
    navigate("/dashboard");
  };

  const handleShowExpired = () => {
    setModal("linkExpired");
  };

  const isEntrepreneur = userRole === "entrepreneur";

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[520px] bg-gradient-to-br from-brand-500 via-brand-600 to-emerald-700 relative overflow-hidden">
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
        <div className="relative z-10 flex flex-col justify-between p-12">
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

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white font-[Outfit] leading-tight">
                {isEntrepreneur
                  ? "Turn Your Vision\nInto Reality"
                  : "Discover the Next\nBig Opportunity"}
              </h2>
              <p className="mt-4 text-brand-100 leading-relaxed">
                {isEntrepreneur
                  ? "Join thousands of entrepreneurs who have found funding for their innovative ideas on GrantBridge."
                  : "Access a curated pipeline of verified startups and innovative projects ready for investment."}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              isEntrepreneur
                ? "Pitch to 500+ verified funders"
                : "Browse 2,400+ verified startups",
              isEntrepreneur
                ? "Free pitch creation tools"
                : "AI-powered deal matching",
              isEntrepreneur
                ? "Average funding time: 45 days"
                : "Avg. portfolio return: 3.2x",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-brand-200 shrink-0" />
                <span className="text-sm text-brand-100">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Role switcher */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
            <Link
              to="/signup/entrepreneur"
              className={`flex-1 py-2.5 text-center text-sm font-medium rounded-lg transition-all ${isEntrepreneur ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Entrepreneur
            </Link>
            <Link
              to="/signup/funder"
              className={`flex-1 py-2.5 text-center text-sm font-medium rounded-lg transition-all ${!isEntrepreneur ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Funder
            </Link>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3 flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step >= s
                      ? "bg-brand-500 text-white"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {step > s ? <CheckCircle2 size={16} /> : s}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:block ${step >= s ? "text-slate-700" : "text-slate-400"}`}
                >
                  {s === 1 ? "Account" : "Details"}
                </span>
                {s < 2 && (
                  <div
                    className={`flex-1 h-0.5 rounded ${step > s ? "bg-brand-500" : "bg-slate-200"}`}
                  />
                )}
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-2xl font-bold text-slate-900 font-[Outfit] mb-1">
                  Create your account
                </h1>
                <p className="text-sm text-slate-500 mb-8">
                  {isEntrepreneur
                    ? "Start pitching your ideas to the world"
                    : "Start discovering investment opportunities"}
                </p>

                <div className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="Sochi Nakolisa"
                    icon={<User size={18} />}
                    value={form.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    error={errors.fullName}
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="sochi@example.com"
                    icon={<Mail size={18} />}
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    error={errors.email}
                  />
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    icon={<Lock size={18} />}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    error={errors.password}
                  />
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter your password"
                    icon={<Lock size={18} />}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    error={errors.confirmPassword}
                  />

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.agreeTerms}
                      onChange={(e) =>
                        updateField("agreeTerms", e.target.checked)
                      }
                      className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-xs text-slate-500">
                      I agree to the{" "}
                      <a href="#" className="text-brand-600 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-brand-600 hover:underline">
                        Privacy Policy
                      </a>
                    </span>
                  </label>
                  {errors.agreeTerms && (
                    <p className="text-xs text-red-500">{errors.agreeTerms}</p>
                  )}

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleStep1Submit}
                    icon={<ArrowRight size={18} />}
                  >
                    Continue
                  </Button>
                </div>

                <p className="mt-6 text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    to={`/login/${role}`}
                    className="text-brand-600 font-semibold hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} /> Back
                </button>

                <h1 className="text-2xl font-bold text-slate-900 font-[Outfit] mb-1">
                  {isEntrepreneur
                    ? "About Your Business"
                    : "About Your Organization"}
                </h1>
                <p className="text-sm text-slate-500 mb-8">
                  {isEntrepreneur
                    ? "Tell us about your venture"
                    : "Tell us about your investment firm"}
                </p>

                <div className="space-y-4">
                  <Input
                    label={
                      isEntrepreneur
                        ? "Company / Startup Name"
                        : "Organization Name"
                    }
                    placeholder={
                      isEntrepreneur
                        ? "e.g. EcoCharge Inc."
                        : "e.g. Venture Capital Fund"
                    }
                    icon={<Building2 size={18} />}
                    value={form.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    error={errors.company}
                  />
                  <Input
                    label="Phone Number"
                    type="tel"
                    placeholder="+234 81 000-0000"
                    icon={<Phone size={18} />}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />

                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleStep2Submit}
                    icon={<ArrowRight size={18} />}
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                  {apiError && (
                    <p className="text-sm text-red-500 text-center">{apiError}</p>
                  )}

                  {/* Demo: Show expired link modal */}
                  <button
                    onClick={handleShowExpired}
                    className="w-full text-center text-xs text-slate-400 hover:text-slate-500 transition-colors cursor-pointer"
                  >
                    (Demo: Show expired link modal)
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      {/* Email Sent */}
      <Modal isOpen={modal === "emailSent"} onClose={() => setModal("none")}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail size={28} className="text-brand-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">
            Check Your Email
          </h3>
          <p className="text-sm text-slate-500 mb-2">
            We've sent a verification link to
          </p>
          <p className="text-sm font-semibold text-slate-700 mb-6">
            {form.email || "your@email.com"}
          </p>
          <p className="text-xs text-slate-400 mb-6">
            Click the link in the email to verify your account. The link expires
            in 24 hours.
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleVerifyEmail}
          >
            I've Verified My Email
          </Button>
          <button
            className="mt-4 text-sm text-brand-600 hover:underline cursor-pointer"
            onClick={() => {}}
          >
            Resend verification email
          </button>
        </div>
      </Modal>

      {/* Email Verified */}
      <Modal
        isOpen={modal === "emailVerified"}
        onClose={() => setModal("none")}
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 200 }}
            >
              <CheckCircle2 size={32} className="text-brand-600" />
            </motion.div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">
            Email Verified!
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Your email has been successfully verified. Let's secure your account
            with phone verification.
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleEmailVerifiedContinue}
          >
            Continue to Phone Verification
          </Button>
        </div>
      </Modal>

      {/* Link Expired */}
      <Modal isOpen={modal === "linkExpired"} onClose={() => setModal("none")}>
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock size={28} className="text-red-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">
            Link Expired
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            The verification link has expired. Please request a new one to
            continue with your registration.
          </p>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setModal("emailSent")}
          >
            Resend Verification Link
          </Button>
          <button
            className="mt-4 text-sm text-slate-500 hover:text-slate-700 cursor-pointer"
            onClick={() => setModal("none")}
          >
            Go back to signup
          </button>
        </div>
      </Modal>

      {/* Phone Verification */}
      <Modal
        isOpen={modal === "phoneVerify"}
        onClose={() => setModal("none")}
        showClose={false}
      >
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Phone size={28} className="text-brand-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">
            Verify Phone Number
          </h3>
          <p className="text-sm text-slate-500 mb-6">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-slate-700">
              {form.phone || "+1 (555) 000-0000"}
            </span>
          </p>

          {/* OTP Input */}
          <div className="flex justify-center gap-2.5 mb-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                className="w-11 h-13 text-center text-lg font-semibold border border-slate-200 rounded-xl focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
                value={form.otp[i] || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^[0-9]?$/.test(val)) {
                    const newOtp = form.otp.split("");
                    newOtp[i] = val;
                    updateField("otp", newOtp.join(""));
                    // Auto-focus next
                    if (val && i < 5) {
                      const next = e.target
                        .nextElementSibling as HTMLInputElement;
                      next?.focus();
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !form.otp[i] && i > 0) {
                    const prev = (e.target as HTMLElement)
                      .previousElementSibling as HTMLInputElement;
                    prev?.focus();
                  }
                }}
              />
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handlePhoneVerify}
          >
            Verify & Complete Signup
          </Button>
          <button className="mt-4 text-sm text-brand-600 hover:underline cursor-pointer">
            Resend code
          </button>
        </div>
      </Modal>
    </div>
  );
}
