import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Rocket, DollarSign } from "lucide-react";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  role: "entrepreneur" | "funder";
  variant?: "signup" | "login" | "verify" | "success" | "error" | "reset";
}

const leftContent = {
  entrepreneur: {
    signup: {
      icon: Rocket,
      title: "Turn Your Vision\nInto Reality",
      subtitle:
        "Join thousands of entrepreneurs who have found funding for their innovative ideas on GrantBridge.",
      bullets: [
        "Pitch to 500+ verified funders",
        "Free pitch creation tools",
        "Average funding time: 45 days",
      ],
    },
    login: {
      icon: Rocket,
      title: "Welcome Back,\nInnovator",
      subtitle:
        "Continue building your dream. Your pitches and connections are waiting.",
      bullets: [
        "12 new funder views on your pitch",
        "3 funding requests pending",
        "Your pitch is trending in FinTech",
      ],
    },
    verify: {
      icon: Rocket,
      title: "Almost There!\nVerify Your Account",
      subtitle:
        "We need to confirm your identity to keep the platform safe for everyone.",
      bullets: [
        "Verified profiles get 5x more visibility",
        "Funders trust verified entrepreneurs",
        "One-time verification process",
      ],
    },
    success: {
      icon: Rocket,
      title: "You're All Set!\nWelcome Aboard",
      subtitle:
        "Your account is ready. Start building your pitch and connect with funders today.",
      bullets: [
        "Create your first pitch in minutes",
        "Get matched with relevant funders",
        "Track your funding progress live",
      ],
    },
    error: {
      icon: Rocket,
      title: "Oops!\nSomething Went Wrong",
      subtitle: "Don't worry, we can fix this. Let's get you back on track.",
      bullets: [
        "Request a new verification link",
        "Contact support if issues persist",
        "Your data is safe and secure",
      ],
    },
    reset: {
      icon: Rocket,
      title: "Reset Your\nPassword",
      subtitle:
        "It happens to the best of us. Let's get you back into your account.",
      bullets: [
        "Secure password reset process",
        "Link expires in 1 hour",
        "Your data remains safe",
      ],
    },
  },
  funder: {
    signup: {
      icon: DollarSign,
      title: "Discover the Next\nBig Opportunity",
      subtitle:
        "Access a curated pipeline of verified startups and innovative projects ready for investment.",
      bullets: [
        "Browse 2,400+ verified startups",
        "AI-powered deal matching",
        "Avg. portfolio return: 3.2x",
      ],
    },
    login: {
      icon: DollarSign,
      title: "Welcome Back,\nInvestor",
      subtitle:
        "New opportunities await. Check out the latest pitches from top entrepreneurs.",
      bullets: [
        "8 new pitches matching your criteria",
        "2 entrepreneurs want to connect",
        "Portfolio up 12% this quarter",
      ],
    },
    verify: {
      icon: DollarSign,
      title: "Verify Your\nInvestor Account",
      subtitle:
        "Verification ensures you access only legitimate, vetted projects.",
      bullets: [
        "Access exclusive deal flow",
        "Priority support for investors",
        "Secure transaction environment",
      ],
    },
    success: {
      icon: DollarSign,
      title: "Welcome to\nGrantBridge!",
      subtitle:
        "Your investor account is ready. Start discovering high-potential projects.",
      bullets: [
        "Browse curated pitch marketplace",
        "Set your investment preferences",
        "Connect with entrepreneurs directly",
      ],
    },
    error: {
      icon: DollarSign,
      title: "Oops!\nSomething Went Wrong",
      subtitle: "Don't worry, we can fix this. Let's get you back on track.",
      bullets: [
        "Request a new verification link",
        "Contact support if issues persist",
        "Your data is safe and secure",
      ],
    },
    reset: {
      icon: DollarSign,
      title: "Reset Your\nPassword",
      subtitle:
        "It happens to the best of us. Let's get you back into your account.",
      bullets: [
        "Secure password reset process",
        "Link expires in 1 hour",
        "Your data remains safe",
      ],
    },
  },
};

export default function AuthLayout({
  children,
  role,
  variant = "signup",
}: AuthLayoutProps) {
  const content = leftContent[role][variant];
  const Icon = content.icon;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[520px] xl:w-[520px] bg-gradient-to-br from-brand-500 via-brand-600 to-emerald-700 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-[0.07]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, #fff 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 -left-16 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 w-full">
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-14">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl font-[Outfit]">
                  G
                </span>
              </div>
              <span className="text-xl font-bold text-white font-[Outfit] tracking-tight">
                GrantBridge
              </span>
            </Link>

            <div className="mb-8">
              <Icon size={44} className="text-white/70 mb-5" />
              <h2 className="text-[28px] xl:text-[32px] font-bold text-white font-[Outfit] leading-tight whitespace-pre-line">
                {content.title}
              </h2>
              <p className="mt-4 text-[14px] text-brand-100/90 leading-relaxed max-w-sm">
                {content.subtitle}
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            {content.bullets.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2
                  size={16}
                  className="text-brand-200/80 flex-shrink-0"
                />
                <span className="text-[13px] text-brand-100/90">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-5 sm:p-8 lg:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[440px]"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
