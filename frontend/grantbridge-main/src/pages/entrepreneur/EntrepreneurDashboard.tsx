import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  TrendingUp, Eye, Plus, Lightbulb, DollarSign, Users,
  ArrowUpRight, ArrowDownRight, Wallet, Clock, BadgeCheck,
  ChevronRight, MessageSquare, MoreHorizontal, Shield,
} from "lucide-react";
import { useAppStore } from "../../lib/store";
import { formatNaira } from "../../components/shared/PitchGridCard";
import Button from "../../components/ui/Button";
import { useDashboard, useMyProjects } from "../../lib/hooks";

const statusColors: Record<string, { bg: string; text: string; dot: string }> =
  {
    active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    "under review": {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
    },
    draft: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
    funded: { bg: "bg-brand-50", text: "text-brand-700", dot: "bg-brand-500" },
  };

export default function EntrepreneurDashboard() {
  const { user } = useAppStore();
  const isVerified = user?.verificationStatus === "verified";
  const isSubmitted = user?.verificationStatus === "submitted";

  const { data: dashStats, loading: dashLoading } = useDashboard();
  const { data: myProjects, loading: projectsLoading } = useMyProjects();

  // Map backend projects to display shape
  const myPitches = myProjects.slice(0, 3).map((p: any) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    location: p.country || p.city || "",
    currentFunding: parseFloat(p.amount_raised || "0"),
    fundingGoal: parseFloat(p.funding_goal || "0"),
    views: 0,
    status: p.status,
  }));

  const totalFunding = myPitches.reduce((sum: number, p: any) => sum + p.currentFunding, 0);
  const totalViews = 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Verification Banner */}
      {!isVerified && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isSubmitted
              ? "bg-amber-50 border border-amber-100"
              : "bg-red-50 border border-red-100"
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isSubmitted ? "bg-amber-100" : "bg-red-100"}`}
            >
              {isSubmitted ? (
                <Clock size={18} className="text-amber-600" />
              ) : (
                <Shield size={18} className="text-red-600" />
              )}
            </div>
            <div>
              <p
                className={`text-[13px] font-semibold ${isSubmitted ? "text-amber-800" : "text-red-800"}`}
              >
                {isSubmitted
                  ? "Verification In Progress"
                  : "Identity Verification Required"}
              </p>
              <p
                className={`text-[12px] ${isSubmitted ? "text-amber-600" : "text-red-600"}`}
              >
                {isSubmitted
                  ? "Your documents are being reviewed. This usually takes 24–48 hours."
                  : "Complete identity verification to publish projects and receive funding."}
              </p>
            </div>
          </div>
          {!isSubmitted && (
            <Link to="/dashboard/entrepreneur/welcome">
              <Button variant="primary" size="sm" icon={<Shield size={14} />}>
                Verify Now
              </Button>
            </Link>
          )}
        </motion.div>
      )}

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-gradient-to-r from-brand-500 via-brand-500 to-emerald-500 rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-brand-100 text-[13px] font-medium mb-1">
              Good morning,
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-white font-[Outfit] tracking-tight">
              {user?.fullName || "Entrepreneur"} 👋
            </h2>
            <p className="text-brand-100 text-[13px] mt-1.5 max-w-md leading-relaxed">
              {myPitches.length > 0
                ? `You have ${myPitches.length} active projects. Keep building!`
                : "Create your first project to start connecting with funders."}
            </p>
          </div>
          <Link to="/dashboard/entrepreneur/projects">
            <Button
              variant="secondary"
              size="md"
              icon={<Plus size={16} />}
              className="bg-white text-brand-600 hover:bg-brand-50 shadow-lg shadow-brand-700/20 flex-shrink-0"
            >
              New Project
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Projects", value: dashLoading ? "..." : String(dashStats?.projects_submitted || myPitches.length), icon: Lightbulb, trend: "", up: true, color: "bg-brand-50 text-brand-600" },
          { label: "Total Raised",    value: dashLoading ? "..." : formatNaira(parseFloat(dashStats?.total_raised || String(totalFunding))), icon: Wallet, trend: "", up: true, color: "bg-emerald-50 text-emerald-600" },
          { label: "Total Views",     value: String(totalViews), icon: Eye, trend: "", up: true, color: "bg-blue-50 text-blue-600" },
          { label: "Funder Inquiries", value: "—", icon: Users, trend: "", up: true, color: "bg-purple-50 text-purple-600" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04, duration: 0.35 }}
            className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 hover:shadow-lg hover:shadow-slate-100/80 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center`}
              >
                <stat.icon size={18} />
              </div>
              <span
                className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${stat.up ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"}`}
              >
                {stat.up ? (
                  <ArrowUpRight size={11} />
                ) : (
                  <ArrowDownRight size={11} />
                )}
                {stat.trend}
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-slate-900 font-[Outfit] leading-none">
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-400 mt-1.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100"
        >
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100">
            <div>
              <h3 className="text-[15px] font-semibold text-slate-800 font-[Outfit]">
                Recent Projects
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {myPitches.length} projects
              </p>
            </div>
            <Link
              to="/dashboard/entrepreneur/projects"
              className="text-[12px] font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {projectsLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-16 mx-5 my-2 bg-slate-100 rounded-xl animate-pulse" />
              ))
            ) : myPitches.length === 0 ? (
              <div className="p-10 text-center">
                <Lightbulb size={32} className="text-slate-300 mx-auto mb-3" />
                <p className="text-[14px] font-medium text-slate-600">No projects yet</p>
                <p className="text-[12px] text-slate-400 mt-1">Create your first project to get started</p>
              </div>
            ) : myPitches.map((pitch: any, i: number) => {
              const progress = pitch.fundingGoal > 0 ? Math.round((pitch.currentFunding / pitch.fundingGoal) * 100) : 0;
              const statusMap: Record<string, { bg: string; text: string; dot: string }> = {
                live:            { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
                partially_funded:{ bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
                pending_review:  { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500"   },
                draft:           { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400"   },
                fully_funded:    { bg: "bg-brand-50",   text: "text-brand-700",   dot: "bg-brand-500"   },
              };
              const sc = statusMap[pitch.status] || statusMap.draft;
              return (
                <div
                  key={pitch.id}
                  className="flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50/50 transition-colors group cursor-pointer"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${
                      i === 0
                        ? "from-brand-400 to-emerald-500"
                        : i === 1
                          ? "from-blue-400 to-cyan-500"
                          : "from-amber-400 to-orange-500"
                    }`}
                  >
                    <Lightbulb size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-slate-800 truncate group-hover:text-brand-600 transition-colors">
                      {pitch.title.split("—")[0].trim()}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {pitch.category} · {pitch.location}
                    </p>
                  </div>
                  <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-full ${sc.bg} ${sc.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                    {pitch.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}
                  </span>
                  <div className="hidden sm:block text-right">
                    <p className="text-[12px] font-semibold text-slate-700">
                      {formatNaira(pitch.currentFunding)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 justify-end">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {progress}%
                      </span>
                    </div>
                  </div>
                  <button className="p-1 text-slate-300 hover:text-slate-500 rounded-md hover:bg-slate-100 cursor-pointer">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="bg-white rounded-2xl border border-slate-100 p-5"
          >
            <h3 className="text-[14px] font-semibold text-slate-800 font-[Outfit] mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              {[
                {
                  text: 'Lagos Angel Network viewed "AfriWeave"',
                  time: "2h ago",
                  icon: Eye,
                  color: "text-blue-500 bg-blue-50",
                },
                {
                  text: "Funding inquiry from Venture Partners",
                  time: "5h ago",
                  icon: DollarSign,
                  color: "text-emerald-500 bg-emerald-50",
                },
                {
                  text: "New message from Sarah Williams",
                  time: "1d ago",
                  icon: MessageSquare,
                  color: "text-purple-500 bg-purple-50",
                },
                {
                  text: "Your pitch was approved",
                  time: "2d ago",
                  icon: BadgeCheck,
                  color: "text-brand-500 bg-brand-50",
                },
                {
                  text: '"AfriWeave" trending in Fashion',
                  time: "3d ago",
                  icon: TrendingUp,
                  color: "text-amber-500 bg-amber-50",
                },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.color}`}
                  >
                    <a.icon size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-slate-700 leading-snug">
                      {a.text}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Clock size={9} /> {a.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="bg-white rounded-2xl border border-slate-100 p-5"
          >
            <h3 className="text-[14px] font-semibold text-slate-800 font-[Outfit] mb-4">
              Upcoming
            </h3>
            <div className="space-y-3">
              {[
                {
                  title: "Pitch Review Call",
                  sub: "Lagos Angel Network",
                  time: "Tomorrow, 10:00 AM",
                  border: "border-l-brand-500",
                },
                {
                  title: "Document Submission",
                  sub: "Financial projections due",
                  time: "Jan 28, 2025",
                  border: "border-l-amber-500",
                },
                {
                  title: "Investor Meetup",
                  sub: "Virtual networking",
                  time: "Feb 02, 2025",
                  border: "border-l-blue-500",
                },
              ].map((ev, i) => (
                <div
                  key={i}
                  className={`border-l-[3px] ${ev.border} pl-3 py-1`}
                >
                  <p className="text-[12px] font-semibold text-slate-800">
                    {ev.title}
                  </p>
                  <p className="text-[11px] text-slate-400">{ev.sub}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                    <Clock size={9} /> {ev.time}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
