// import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import Button from "../../components/ui/Button";
import { useAppStore } from "../../lib/store";
import type { UserRole } from "../../lib/store";

export default function AccountCreatedPage() {
  const { role } = useParams<{ role: string }>();
  // const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};
  const login = useAppStore((s) => s.login);
  const userRole: UserRole = role === "funder" ? "funder" : "entrepreneur";

  const handleContinue = () => {
    login({
      id: "1",
      email: state.email || "user@example.com",
      fullName:
        state.fullName ||
        (userRole === "entrepreneur" ? "Onyin Eunice" : "Sochi Nakolisa"),
      role: userRole,
      company: state.company || "",
      phone: state.phone || "",
      verificationStatus: "pending",
    });
    // navigate("/dashboard");
  };

  return (
    <AuthLayout role={userRole} variant="success">
      <div className="text-center">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            damping: 10,
            stiffness: 150,
            delay: 0.1,
          }}
          className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-brand-100 relative"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              damping: 8,
              stiffness: 200,
              delay: 0.3,
            }}
          >
            <CheckCircle2 size={48} className="text-brand-500" />
          </motion.div>
          {/* Confetti particles */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0.5],
                x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 8)],
                y: [0, -(20 + i * 10)],
              }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: [
                  "#22c55e",
                  "#4ade80",
                  "#86efac",
                  "#fbbf24",
                  "#60a5fa",
                  "#a78bfa",
                ][i],
              }}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full mb-3">
            <Sparkles size={12} className="text-brand-500" />
            <span className="text-[11px] font-semibold text-brand-700">
              Account Verified
            </span>
          </div>

          <h1 className="text-[24px] font-bold text-slate-900 font-[Outfit] mb-2">
            Account Created!
          </h1>
          <p className="text-[13px] text-slate-500 leading-relaxed mb-8 max-w-sm mx-auto">
            Congratulations! Your {userRole} account has been successfully
            created and verified. You're all set to{" "}
            {userRole === "entrepreneur"
              ? "start pitching your ideas"
              : "discover investment opportunities"}
            .
          </p>

          <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left space-y-2.5">
            {[
              { label: "Name", value: state.fullName || "Adaeze Okafor" },
              { label: "Email", value: state.email || "user@example.com" },
              {
                label: "Role",
                value: userRole === "entrepreneur" ? "Entrepreneur" : "Funder",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="text-[12px] text-slate-400">{item.label}</span>
                <span className="text-[12px] font-medium text-slate-700">
                  {item.value}
                </span>
              </div>
            ))}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleContinue}
          >
            Go to Dashboard
            <ArrowRight size={17} />
          </Button>
        </motion.div>
      </div>
    </AuthLayout>
  );
}
