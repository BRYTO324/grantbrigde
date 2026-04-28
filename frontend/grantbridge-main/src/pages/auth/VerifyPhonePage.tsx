import { useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Smartphone, RefreshCw, ShieldCheck } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import Button from "../../components/ui/Button";
import type { UserRole } from "../../lib/store";

export default function VerifyPhonePage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};
  const userRole: UserRole = role === "funder" ? "funder" : "entrepreneur";
  const phone = state.phone || "+234 800 000 0000";

  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    navigate(`/account-created/${role}`, { state });
  };

  const handleResend = () => {
    setResent(true);
    setTimeout(() => setResent(false), 3000);
  };

  return (
    <AuthLayout role={userRole} variant="verify">
      <div className="text-center">
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
          <Smartphone size={36} className="text-brand-500" />
        </motion.div>

        <h1 className="text-[22px] font-bold text-slate-900 font-[Outfit] mb-2">
          Verify Phone Number
        </h1>
        <p className="text-[13px] text-slate-500 mb-1">
          Enter the 6-digit code sent to
        </p>
        <p className="text-[14px] font-semibold text-slate-800 mb-6 bg-slate-50 inline-block px-4 py-1.5 rounded-lg">
          {phone}
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2.5 mb-2" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <motion.input
              key={i}
              ref={(el) => {
                inputRefs.current[i] = el;
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05, duration: 0.25 }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all ${
                digit
                  ? "border-brand-400 bg-brand-50/50 text-brand-700"
                  : "border-slate-200 text-slate-800"
              } focus:border-brand-500 focus:ring-2 focus:ring-brand-100`}
            />
          ))}
        </div>

        {error && <p className="text-[12px] text-red-500 mb-4">{error}</p>}

        <div className="flex items-center justify-center gap-1 mb-6 mt-3">
          <ShieldCheck size={13} className="text-slate-400" />
          <p className="text-[11px] text-slate-400">
            Code expires in{" "}
            <span className="font-semibold text-slate-500">10:00</span>
          </p>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={handleVerify}>
          Verify Phone Number
        </Button>

        <div className="mt-4 flex items-center justify-center gap-1">
          <button
            onClick={handleResend}
            disabled={resent}
            className="text-[13px] font-medium text-brand-600 hover:text-brand-700 disabled:text-slate-400 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={13} className={resent ? "animate-spin" : ""} />
            {resent ? "Code sent!" : "Resend code"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
