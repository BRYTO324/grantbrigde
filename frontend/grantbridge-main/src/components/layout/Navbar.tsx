import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, X, LogOut, LayoutDashboard, User } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "../../lib/store";
import Button from "../ui/Button";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const isLanding = location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isLanding ? "bg-white/80 backdrop-blur-lg border-b border-slate-100" : "bg-white border-b border-slate-100"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-xl font-bold text-slate-800 font-[Outfit] tracking-tight">
              GrantBridge
            </span>
          </Link>

          {/* Desktop Nav */}
          {/* <div className="hidden md:flex items-center gap-1">
            {isLanding && (
              <>
                <a href="#features" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors rounded-lg hover:bg-brand-50">Features</a>
                <a href="#how-it-works" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors rounded-lg hover:bg-brand-50">How It Works</a>
                <a href="#categories" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-brand-600 transition-colors rounded-lg hover:bg-brand-50">Categories</a>
              </>
            )}
          </div> */}

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<LayoutDashboard size={16} />}
                  >
                    Dashboard
                  </Button>
                </Link>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 rounded-xl">
                  <div className="w-7 h-7 bg-brand-500 rounded-full flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {user?.fullName?.split(" ")[0]}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  icon={<LogOut size={16} />}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login/entrepreneur">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup/entrepreneur">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-800 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatedMobileMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
        isLanding={isLanding}
      />
    </nav>
  );
}

function AnimatedMobileMenu({
  isOpen,
  onClose,
  isAuthenticated,
  user,
  onLogout,
  isLanding,
}: any) {
  return (
    <motion.div
      initial={false}
      animate={
        isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
      }
      className="md:hidden overflow-hidden bg-white border-t border-slate-100"
    >
      <div className="px-4 py-4 space-y-2">
        {isLanding && (
          <>
            {/* <a
              href="#features"
              onClick={onClose}
              className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-brand-50 rounded-lg"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={onClose}
              className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-brand-50 rounded-lg"
            >
              How It Works
            </a>
            <a
              href="#categories"
              onClick={onClose}
              className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-brand-50 rounded-lg"
            >
              Categories
            </a> */}
          </>
        )}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={onClose}
                className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-brand-50 rounded-lg"
              >
                Dashboard
              </Link>
              <div className="px-4 py-2 text-sm text-slate-500">
                Signed in as {user?.fullName}
              </div>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login/entrepreneur"
                onClick={onClose}
                className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-brand-50 rounded-lg"
              >
                Log In
              </Link>
              <Link to="/signup/entrepreneur" onClick={onClose}>
                <div className="px-4 py-2.5 text-sm font-semibold text-white bg-brand-500 rounded-lg text-center">
                  Get Started
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
