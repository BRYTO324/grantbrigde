import { useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import Button from "../../components/ui/Button";
import { authApi } from "../../lib/api";
import type { UserRole } from "../../lib/store";

export default function VerifyEmailPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};
  const userRole: UserRole = role === "funder" ? "funder" : "entrepreneur";
  const email = state.email || "your@email.com";
  const [resent, setResent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleVerified = async () => {
    if (!otp || otp.length < 6) {
      setError("Please enter the 6-digit code from your email.");
      return;
    }
    setVerifying(true);
    setError("");
    try {
      await authApi.verifyEmail(email, otp);
      navigate(`/account-created/${role}`, { state });
    } catch (err: any) {
      setError(err.message || "Invalid or expired code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResent(true);
    try {
      await authApi.resendVerification(email);
    } catch {}
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <AuthLayout role={userRole} variant="verify">
      <div className="text-center">
        {/* Animated envelope */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            damping: 12,
            stiffness: 200,
            delay: 0.1,
          }}
          className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-brand-100"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Mail size={36} className="text-brand-500" />
          </motion.div>
        </motion.div>

        <h1 className="text-[22px] font-bold text-slate-900 font-[Outfit] mb-2">
          Check Your Email
        </h1>
        <p className="text-[13px] text-slate-500 mb-1">
          We've sent a verification link to
        </p>
        <p className="text-[14px] font-semibold text-slate-800 mb-6 bg-slate-50 inline-block px-4 py-1.5 rounded-lg">
          {email}
        </p>

        <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-[12px] text-slate-600 leading-relaxed">
            Enter the 6-digit code sent to your email to confirm your account.
            The code expires in <span className="font-semibold text-slate-800">15 minutes</span>.
          </p>
          <p className="text-[11px] text-slate-400 mt-2">
            Can't find the email? Check your spam or junk folder.
          </p>
        </div>

        {/* OTP input */}
        <div className="flex justify-center gap-2 mb-4">
          {[0,1,2,3,4,5].map((i) => (
            <input
              key={i}
              type="text"
              maxLength={1}
              className="w-10 h-12 text-center text-lg font-semibold border border-slate-200 rounded-xl focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-all"
              value={otp[i] || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9]?$/.test(val)) {
                  const arr = otp.split("");
                  arr[i] = val;
                  setOtp(arr.join(""));
                  if (val && i < 5) {
                    const next = e.target.nextElementSibling as HTMLInputElement;
                    next?.focus();
                  }
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !otp[i] && i > 0) {
                  const prev = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  prev?.focus();
                }
              }}
            />
          ))}
        </div>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <Button variant="primary" size="lg" fullWidth onClick={handleVerified} disabled={verifying}>
          {verifying ? "Verifying..." : "Verify Email"}
          {!verifying && <ArrowRight size={17} />}
        </Button>

        <div className="mt-4 flex items-center justify-center gap-1">
          <button
            onClick={handleResend}
            disabled={resent}
            className="text-[13px] font-medium text-brand-600 hover:text-brand-700 disabled:text-slate-400 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={13} className={resent ? "animate-spin" : ""} />
            {resent ? "Email sent!" : "Resend verification email"}
          </button>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[12px] text-slate-400">
            Wrong email?{" "}
            <Link
              to={`/signup/${role}`}
              className="text-brand-600 font-medium hover:underline"
            >
              Go back to signup
            </Link>
          </p>
        </div>

        {/* Demo shortcut */}
        <div className="mt-4">
          <button
            onClick={() => navigate(`/link-expired/${role}`, { state })}
            className="text-[11px] text-slate-300 hover:text-slate-400 cursor-pointer"
          >
            (Demo: Show link expired)
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
