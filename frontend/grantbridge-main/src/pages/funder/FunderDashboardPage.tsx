import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  DollarSign, FolderOpen, MessageSquare, TrendingUp,
  ArrowUpRight, ChevronRight, MapPin,
  Search, Bell, Clock, Compass, MoreHorizontal, BadgeCheck
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { formatNaira } from '../../components/shared/PitchGridCard';
import { useDashboard, useMyTransactions, useNotifications } from '../../lib/hooks';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active:    { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  completed: { bg: 'bg-brand-50',   text: 'text-brand-700',   dot: 'bg-brand-500'   },
  pending:   { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
};

const gradients = [
  'from-brand-400 to-emerald-500', 'from-blue-400 to-cyan-500',
  'from-amber-400 to-orange-500',  'from-purple-400 to-pink-500',
  'from-teal-400 to-cyan-500',
];

export default function FunderDashboardPage() {
  const { user } = useAppStore();
  const { data: dashStats, loading } = useDashboard();
  const { data: transactions } = useMyTransactions();
  const { unread } = useNotifications();

  const totalFundsGiven = dashStats ? parseFloat(dashStats.total_funded  || '0') : 0;
  const projectsFunded  = dashStats?.projects_supported  || 0;
  const txCount         = dashStats?.transactions_count  || 0;

  const fundedProjects = transactions.slice(0, 5).map((t: any, i: number) => ({
    id:             t.id,
    title:          t.project_title || 'Project',
    entrepreneurName: t.funder_name || '-',
    location:       '',
    amountFunded:   parseFloat(t.gross_amount || '0'),
    fundedDate:     new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    status:         t.status === 'allocated' ? 'active' : t.status === 'verified' ? 'pending' : 'completed',
    returnRate:     'N/A',
    verified:       true,
  }));

  const stats = [
    { label: 'Total Funds Given', value: formatNaira(totalFundsGiven), icon: DollarSign, change: 'All time',  color: 'bg-brand-50 text-brand-600',     borderColor: 'border-brand-100'   },
    { label: 'Projects Funded',   value: String(projectsFunded),       icon: FolderOpen, change: 'Supported', color: 'bg-emerald-50 text-emerald-600', borderColor: 'border-emerald-100' },
    { label: 'Transactions',      value: String(txCount),              icon: MessageSquare, change: 'Total',  color: 'bg-blue-50 text-blue-600',       borderColor: 'border-blue-100'    },
  ];

  const recentActivity = [
    { text: 'Check your funded projects for updates', time: 'Just now',    icon: FolderOpen,    color: 'text-brand-500 bg-brand-50'   },
    { text: 'New projects available to fund',         time: '1 hour ago',  icon: TrendingUp,    color: 'text-emerald-500 bg-emerald-50' },
    { text: 'Your portfolio is growing',              time: '1 day ago',   icon: MessageSquare, color: 'text-blue-500 bg-blue-50'     },
    { text: 'Transaction receipt available',          time: '3 days ago',  icon: DollarSign,    color: 'text-purple-500 bg-purple-50' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-[1200px] mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-[22px] sm:text-[26px] font-bold text-slate-900 font-[Outfit] tracking-tight">
            My Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Welcome back, {user?.fullName || 'Funder'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search..." className="w-52 pl-9 pr-4 py-2 text-[13px] border border-slate-200 rounded-xl bg-slate-50 placeholder:text-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 focus:bg-white transition-all" />
          </div>
          <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
            <Bell size={18} />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {loading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 p-6 h-32 animate-pulse" />
            ))
          : stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className={`bg-white rounded-2xl border ${stat.borderColor} p-5 sm:p-6 hover:shadow-lg hover:shadow-slate-100/80 transition-all duration-200`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon size={20} />
                  </div>
                  <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ArrowUpRight size={11} /> {stat.change}
                  </span>
                </div>
                <p className="text-[26px] sm:text-[30px] font-bold text-slate-900 font-[Outfit] leading-none">{stat.value}</p>
                <p className="text-[12px] text-slate-400 mt-1.5">{stat.label}</p>
              </motion.div>
            ))
        }
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Funded Projects Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100"
        >
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-800 font-[Outfit]">My Funded Projects</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">{fundedProjects.length} projects in your portfolio</p>
            </div>
            <Link to="/dashboard/funder/discover" className="text-[12px] font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
              Discover More <ChevronRight size={14} />
            </Link>
          </div>

          <div className="hidden sm:grid grid-cols-12 gap-3 px-5 sm:px-6 py-2.5 bg-slate-50/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <div className="col-span-5">Project</div>
            <div className="col-span-3">Amount</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Date</div>
          </div>

          <div className="divide-y divide-slate-50">
            {fundedProjects.length === 0 ? (
              <div className="py-12 text-center">
                <FolderOpen size={28} className="text-slate-300 mx-auto mb-2" />
                <p className="text-[13px] text-slate-500">No funded projects yet</p>
                <Link to="/dashboard/funder/discover" className="text-[12px] text-brand-600 hover:underline mt-1 inline-block">Browse projects</Link>
              </div>
            ) : fundedProjects.map((project, i) => {
              const sc = statusColors[project.status] || statusColors.pending;
              return (
                <motion.div key={project.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 + i * 0.05 }}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-3 items-center px-5 sm:px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                >
                  <div className="sm:col-span-5 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradients[i % gradients.length]}`}>
                      <span className="text-white text-[12px] font-bold">{project.title.charAt(0)}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <p className="text-[13px] font-medium text-slate-800 truncate">{project.title}</p>
                        {project.verified && <BadgeCheck size={12} className="text-brand-500 flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1"><MapPin size={9} /> {project.location || 'Nigeria'}</p>
                    </div>
                  </div>
                  <div className="sm:col-span-3">
                    <p className="text-[13px] font-semibold text-slate-800">{formatNaira(project.amountFunded)}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </span>
                  </div>
                  <div className="sm:col-span-2 flex items-center justify-end gap-2">
                    <span className="text-[11px] text-slate-400">{project.fundedDate}</span>
                    <button className="p-1 text-slate-300 hover:text-slate-500 rounded-md hover:bg-slate-100 cursor-pointer">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Portfolio Summary */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-white rounded-2xl border border-slate-100 p-5"
          >
            <h3 className="text-[14px] font-semibold text-slate-800 font-[Outfit] mb-4">Portfolio Summary</h3>
            <div className="space-y-3 mb-4">
              {[
                { label: 'Active',    value: String(fundedProjects.filter(p => p.status === 'active').length),    color: 'bg-emerald-500' },
                { label: 'Completed', value: String(fundedProjects.filter(p => p.status === 'completed').length), color: 'bg-brand-500'   },
                { label: 'Pending',   value: String(fundedProjects.filter(p => p.status === 'pending').length),   color: 'bg-amber-500'   },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-[12px] text-slate-600">{item.label}</span>
                  </div>
                  <span className="text-[13px] font-semibold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
            <div className="flex h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-500" style={{ width: `${Math.max(10, (fundedProjects.filter(p=>p.status==='active').length / Math.max(fundedProjects.length,1))*100)}%` }} />
              <div className="bg-brand-500"   style={{ width: `${Math.max(10, (fundedProjects.filter(p=>p.status==='completed').length / Math.max(fundedProjects.length,1))*100)}%` }} />
              <div className="bg-amber-500"   style={{ width: `${Math.max(10, (fundedProjects.filter(p=>p.status==='pending').length / Math.max(fundedProjects.length,1))*100)}%` }} />
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
            className="bg-white rounded-2xl border border-slate-100 p-5"
          >
            <h3 className="text-[14px] font-semibold text-slate-800 font-[Outfit] mb-4">Recent Activity</h3>
            <div className="space-y-3.5">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.color}`}>
                    <activity.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-slate-700 leading-snug">{activity.text}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Clock size={9} /> {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Discover CTA */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
            className="bg-gradient-to-br from-brand-500 to-emerald-600 rounded-2xl p-5 text-white"
          >
            <Compass size={22} className="text-white/80 mb-2" />
            <p className="text-[14px] font-semibold font-[Outfit] mb-1">Discover New Projects</p>
            <p className="text-[12px] text-brand-100 leading-relaxed mb-4">Browse verified projects from innovative entrepreneurs.</p>
            <Link to="/dashboard/funder/discover">
              <button className="w-full text-[12px] font-semibold text-brand-700 bg-white hover:bg-brand-50 rounded-lg py-2.5 transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                <Compass size={13} /> Explore Projects
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
