import { Outlet } from 'react-router-dom';
import FunderSidebar from '../../components/layout/FunderSidebar';
import { useState } from 'react';
import { Menu } from 'lucide-react';

export default function FunderLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f7f8fa] flex">
      <FunderSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/25 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main area */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 h-14 flex items-center px-4 gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-500 hover:text-slate-700 cursor-pointer p-1">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm font-[Outfit]">G</span>
            </div>
            <span className="text-[15px] font-bold text-slate-800 font-[Outfit]">GrantBridge</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
