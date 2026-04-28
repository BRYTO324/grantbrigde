import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Lightbulb, Eye, Heart, MapPin,
  MoreHorizontal, LayoutGrid, List, Edit, Trash2, ExternalLink
} from 'lucide-react';
import { formatNaira } from '../../components/shared/PitchGridCard';
import Button from '../../components/ui/Button';
import { useMyProjects } from '../../lib/hooks';

const statusColors: Record<string, { bg: string; text: string; dot: string }> = {
  active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  'under review': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  draft: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400' },
  funded: { bg: 'bg-brand-50', text: 'text-brand-700', dot: 'bg-brand-500' },
};

const stageLabels: Record<string, string> = { idea: 'Idea', mvp: 'MVP', growth: 'Growth', scale: 'Scale' };

const gradients = [
  'from-brand-400 to-emerald-500', 'from-blue-400 to-cyan-500',
  'from-purple-400 to-pink-500', 'from-amber-400 to-orange-500',
  'from-rose-400 to-red-500', 'from-teal-400 to-cyan-500',
];

export default function MyProjectsPage() {
  const { data: rawProjects, loading } = useMyProjects();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState('All');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  // Map backend shape to display shape
  const myPitches = rawProjects.map((p: any) => ({
    id: p.id,
    title: p.title,
    category: p.category,
    location: p.country || p.city || '',
    description: p.description || '',
    currentFunding: parseFloat(p.amount_raised || '0'),
    fundingGoal: parseFloat(p.funding_goal || '0'),
    status: p.status,
    stage: 'mvp',
    views: 0,
    likes: 0,
    slug: p.slug,
  }));

  const statusDisplayMap: Record<string, string> = {
    live: 'active', partially_funded: 'active',
    pending_review: 'under review', draft: 'draft',
    fully_funded: 'funded', completed: 'funded',
  };

  const filtered = myPitches.filter((p: any) => {
    const displayStatus = statusDisplayMap[p.status] || p.status;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || displayStatus === filterStatus.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 font-[Outfit] tracking-tight">My Projects</h1>
          <p className="text-[13px] text-slate-500 mt-1">
            {loading ? 'Loading...' : `${myPitches.length} projects · ${myPitches.filter((p: any) => ['live','partially_funded'].includes(p.status)).length} active`}
          </p>
        </div>
        <Button variant="primary" size="md" icon={<Plus size={16} />}>Create New Project</Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['All', 'Active', 'Under Review', 'Draft', 'Funded'].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-4 py-2 text-[12px] font-medium rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  filterStatus === s ? 'bg-brand-500 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}>{s}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-52 pl-9 pr-4 py-2 text-[12px] border border-slate-200 rounded-lg bg-slate-50 placeholder:text-slate-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" />
            </div>
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}><LayoutGrid size={14} /></button>
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}`}><List size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <Lightbulb size={32} className="text-slate-300 mx-auto mb-3" />
          <p className="text-[14px] font-medium text-slate-600">No projects found</p>
          <p className="text-[12px] text-slate-400 mt-1 mb-4">Try adjusting your filters or create a new project</p>
          <Button variant="primary" size="sm" icon={<Plus size={14} />}>Create Project</Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((pitch: any, i: number) => {
              const status = statusDisplayMap[pitch.status] || pitch.status;
              const sc = statusColors[status] || statusColors.draft;
              const progress = pitch.fundingGoal > 0 ? Math.round((pitch.currentFunding / pitch.fundingGoal) * 100) : 0;
              return (
                <motion.div key={pitch.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                  className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-0.5 group">
                  <div className={`h-28 bg-gradient-to-br ${gradients[idx % gradients.length]} relative p-4`}>
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '14px 14px' }} />
                    <div className="relative flex items-start justify-between">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-full ${sc.bg} ${sc.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                      <div className="relative">
                        <button onClick={() => setOpenMenu(openMenu === pitch.id ? null : pitch.id)}
                          className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white cursor-pointer"><MoreHorizontal size={14} /></button>
                        {openMenu === pitch.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-1 w-36 z-10">
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-slate-600 hover:bg-slate-50 cursor-pointer"><Edit size={12} /> Edit Project</button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-slate-600 hover:bg-slate-50 cursor-pointer"><ExternalLink size={12} /> View Public</button>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 cursor-pointer"><Trash2 size={12} /> Delete</button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-4"><Lightbulb size={24} className="text-white/70" /></div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">{pitch.category}</span>
                      <span className="text-[10px] text-slate-400">{stageLabels[pitch.stage]}</span>
                    </div>
                    <h3 className="text-[13px] font-semibold text-slate-800 font-[Outfit] mb-1.5 line-clamp-1 group-hover:text-brand-600 transition-colors">{pitch.title}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed mb-3 line-clamp-2">{pitch.description}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="font-medium text-slate-700">{formatNaira(pitch.currentFunding)}</span>
                        <span className="text-slate-400">of {formatNaira(pitch.fundingGoal)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 0.8, delay: i * 0.05 }}
                          className="h-full bg-brand-500 rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1"><Eye size={12} /> {pitch.views}</span>
                        <span className="flex items-center gap-1"><Heart size={12} /> {pitch.likes}</span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-slate-400"><MapPin size={10} /> {pitch.location}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50">
          {filtered.map((pitch: any, i: number) => {
            const status = statusDisplayMap[pitch.status] || pitch.status;
            const sc = statusColors[status] || statusColors.draft;
            const progress = pitch.fundingGoal > 0 ? Math.round((pitch.currentFunding / pitch.fundingGoal) * 100) : 0;
            return (
              <motion.div key={pitch.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors group cursor-pointer">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${gradients[idx % gradients.length]}`}>
                  <Lightbulb size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-800 truncate group-hover:text-brand-600 transition-colors">{pitch.title}</p>
                  <p className="text-[11px] text-slate-400">{pitch.category} · {pitch.location}</p>
                </div>
                <span className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-full ${sc.bg} ${sc.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
                <div className="hidden md:block text-right w-32">
                  <div className="flex items-center gap-1.5 justify-end">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-brand-500 rounded-full" style={{ width: `${progress}%` }} /></div>
                    <span className="text-[10px] text-slate-400 w-7 text-right">{progress}%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{formatNaira(pitch.currentFunding)}</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 hidden lg:flex">
                  <span className="flex items-center gap-1"><Eye size={11} /> {pitch.views}</span>
                  <span className="flex items-center gap-1"><Heart size={11} /> {pitch.likes}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
