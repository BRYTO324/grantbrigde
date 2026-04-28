import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, LogOut, User, Bell, LayoutDashboard, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '../../lib/store';

const navLinks = [
  { label: 'Dashboard', path: '/dashboard/entrepreneur', icon: LayoutDashboard },
  { label: 'My Projects', path: '/dashboard/entrepreneur/projects', icon: FolderOpen },
];

export default function EntrepreneurNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-100">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/25">
              <span className="text-white font-bold text-lg font-[Outfit]">G</span>
            </div>
            <span className="text-xl font-bold text-slate-800 font-[Outfit] tracking-tight hidden sm:block">GrantBridge</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = link.path === '/dashboard/entrepreneur'
                ? location.pathname === '/dashboard/entrepreneur'
                : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive ? 'text-brand-600 bg-brand-50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <link.icon size={16} />
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="entrepreneur-nav-indicator"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
            </button>
            <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l border-slate-100">
              <div className="w-8 h-8 bg-brand-500 rounded-full flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-slate-700 leading-tight">{user?.fullName?.split(' ')[0]}</p>
                <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer" title="Logout">
              <LogOut size={16} />
            </button>
            <button className="md:hidden p-2 text-slate-600 hover:text-slate-800 cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      <motion.div
        initial={false}
        animate={mobileOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
        className="md:hidden overflow-hidden bg-white border-t border-slate-100"
      >
        <div className="px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const isActive = link.path === '/dashboard/entrepreneur'
              ? location.pathname === '/dashboard/entrepreneur'
              : location.pathname.startsWith(link.path);
            return (
              <Link key={link.path} to={link.path} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                  isActive ? 'text-brand-600 bg-brand-50' : 'text-slate-600 hover:bg-slate-50'
                }`}>
                <link.icon size={18} />{link.label}
              </Link>
            );
          })}
          <div className="pt-2 mt-2 border-t border-slate-100">
            <button onClick={() => { handleLogout(); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl cursor-pointer">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </motion.div>
    </nav>
  );
}
