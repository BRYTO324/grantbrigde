import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb, MapPin, Heart, Eye, Bookmark, BadgeCheck } from 'lucide-react';
import type { PitchCard } from '../../lib/store';

const stageColors: Record<string, string> = {
  idea: 'bg-blue-100 text-blue-700',
  mvp: 'bg-amber-100 text-amber-700',
  growth: 'bg-brand-100 text-brand-700',
  scale: 'bg-purple-100 text-purple-700',
};

const gradients = [
  'from-brand-400 to-emerald-500',
  'from-blue-400 to-cyan-500',
  'from-purple-400 to-pink-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-red-500',
  'from-teal-400 to-cyan-500',
  'from-indigo-400 to-blue-500',
  'from-emerald-400 to-green-500',
];

export function formatNaira(num: number) {
  if (num >= 1000000) return `₦${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `₦${(num / 1000).toFixed(0)}K`;
  return `₦${num}`;
}

interface PitchGridCardProps {
  pitch: PitchCard;
  index: number;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: () => void;
  onBookmark: () => void;
}

export default function PitchGridCard({ pitch, index, isLiked, isBookmarked, onLike, onBookmark }: PitchGridCardProps) {
  const progress = Math.round((pitch.currentFunding / pitch.fundingGoal) * 100);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1"
    >
      <Link to={`/dashboard/funder/project/${pitch.id}`} className="block">
      <div className={`h-32 bg-gradient-to-br ${gradients[index % gradients.length]} relative p-5`}>
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        <div className="relative flex items-start justify-between">
          <span className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg ${stageColors[pitch.stage]} backdrop-blur-sm`}>
            {pitch.stage.toUpperCase()}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBookmark(); }}
              className={`p-1.5 rounded-lg backdrop-blur-sm transition-all cursor-pointer ${isBookmarked ? 'bg-white text-amber-500' : 'bg-white/20 text-white hover:bg-white/30'}`}
            >
              <Bookmark size={14} fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 left-5">
          <Lightbulb size={28} className="text-white/80" />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">{pitch.category}</span>
          {pitch.verified && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-brand-600">
              <BadgeCheck size={12} className="text-brand-500" /> Verified
            </span>
          )}
        </div>

        <h3 className="text-base font-semibold text-slate-800 font-[Outfit] mb-2 line-clamp-1 group-hover:text-brand-600 transition-colors">
          {pitch.title}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4 line-clamp-2">
          {pitch.description}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700">{formatNaira(pitch.currentFunding)}</span>
            <span className="text-slate-400">of {formatNaira(pitch.fundingGoal)}</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, delay: index * 0.05, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full"
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{progress}% funded</p>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {pitch.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-500 rounded-md">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">{pitch.entrepreneurName.charAt(0)}</span>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-700">{pitch.entrepreneurName}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-0.5"><MapPin size={8} /> {pitch.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onLike(); }} className="flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500 transition-colors cursor-pointer">
              <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} className={isLiked ? 'text-rose-500' : ''} />
              <span>{pitch.likes + (isLiked ? 1 : 0)}</span>
            </button>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Eye size={14} /> {pitch.views}
            </span>
          </div>
        </div>
      </div>
      </Link>
    </motion.div>
  );
}
