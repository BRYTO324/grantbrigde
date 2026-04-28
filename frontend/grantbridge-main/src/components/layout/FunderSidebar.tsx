import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Compass, BarChart3, Bookmark,
  User, Settings, LogOut, X, MapPin, BookOpen,
  FolderOpen, ChevronRight
} from 'lucide-react';
import { useAppStore } from '../../lib/store';

interface FunderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { label: 'Overview', path: '/dashboard/funder', icon: LayoutDashboard, exact: true },
  { label: 'Discover Projects', path: '/dashboard/funder/discover', icon: Compass },
  { label: 'My Projects', path: '/dashboard/funder/my-projects', icon: FolderOpen },
  { label: 'Impact Report', path: '/dashboard/funder/impact', icon: BarChart3 },
  { label: 'Saved Projects', path: '/dashboard/funder/saved', icon: Bookmark },
  { label: 'How it Works', path: '/dashboard/funder/how-it-works', icon: BookOpen },
];

const accountItems = [
  { label: 'Profile', path: '/dashboard/funder/profile', icon: User },
  { label: 'Settings', path: '/dashboard/funder/settings', icon: Settings },
];

export default function FunderSidebar({ isOpen, onClose }: FunderSidebarProps) {
  const { user, logout } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-[270px] bg-white border-r border-slate-100 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-[68px] border-b border-slate-100 flex-shrink-0">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/25">
            <span className="text-white font-bold text-lg font-[Outfit]">G</span>
          </div>
          <span className="text-[17px] font-bold text-slate-800 font-[Outfit] tracking-tight">GrantBridge</span>
        </Link>
        <button className="lg:hidden text-slate-400 hover:text-slate-600 cursor-pointer" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      {/* User Profile Card */}
      <div className="px-4 py-5 border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img
            src="/images/avatar-funder.jpg"
            alt="Avatar"
            className="w-12 h-12 rounded-2xl object-cover ring-2 ring-brand-100"
          />
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold text-slate-800 truncate">{user?.company || user?.fullName || 'Lagos Angel Network'}</p>
            <p className="text-[12px] text-slate-500 truncate">{user?.fullName || 'Sarah Williams'}</p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> Lagos, Nigeria
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-1 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em]">Menu</p>
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                active
                  ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-100/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <span className={active ? 'text-brand-600' : 'text-slate-400'}>
                <item.icon size={18} />
              </span>
              <span className="flex-1 text-left">{item.label}</span>
              {active && <ChevronRight size={14} className="text-brand-400" />}
            </Link>
          );
        })}

        <p className="px-3 pt-5 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.08em]">Account</p>
        {accountItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
                active
                  ? 'bg-brand-50 text-brand-700 shadow-sm shadow-brand-100/50'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <span className={active ? 'text-brand-600' : 'text-slate-400'}>
                <item.icon size={18} />
              </span>
              <span className="flex-1 text-left">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-4 py-3 border-t border-slate-100 flex-shrink-0">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
