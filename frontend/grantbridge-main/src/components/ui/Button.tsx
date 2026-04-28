import type { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "white"
    | "invertedWhite";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  fullWidth?: boolean;
  icon?: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  children,
  fullWidth = false,
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700 shadow-md shadow-brand-500/20",
    secondary: "bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900",
    outline:
      "border-2 border-brand-500 text-brand-600 hover:bg-brand-50 active:bg-brand-100",
    ghost: "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
    white:
      "bg-white text-brand-600 border-slate-100 border-2 hover:bg-brand-500 hover:text-white active:bg-brand-700 shadow-md",
    invertedWhite:
      "text-brand-600 border-slate-100 border-2 hover:bg-white hover:text-brand-600 active:bg-brand-700 shadow-md text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-1.5",
    md: "px-6 py-3 text-sm gap-2",
    lg: "px-8 py-4 text-base gap-2.5",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...(props as any)}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
