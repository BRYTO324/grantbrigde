import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Heart, Share2, Bookmark, BadgeCheck, MapPin,
  Calendar, Eye, Users, ChevronLeft, ChevronRight, Play,
  DollarSign, Target, TrendingUp, Clock, Globe, Mail,
  Linkedin, ExternalLink, Building2, Award,
  PieChart, Briefcase, CheckCircle2, Copy, X,
  ShieldCheck, CreditCard, ArrowRight,
  Sparkles, Lock
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { formatNaira } from '../../components/shared/PitchGridCard';
import Button from '../../components/ui/Button';

const stageLabels: Record<string, string> = { idea: 'Idea Stage', mvp: 'MVP Stage', growth: 'Growth Stage', scale: 'Scale Stage' };
const stageColors: Record<string, string> = { idea: 'bg-blue-100 text-blue-700 border-blue-200', mvp: 'bg-amber-100 text-amber-700 border-amber-200', growth: 'bg-brand-100 text-brand-700 border-brand-200', scale: 'bg-purple-100 text-purple-700 border-purple-200' };

type FundStep = 'closed' | 'amount' | 'payment' | 'confirmation';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pitches } = useAppStore();
  const pitch = pitches.find((p) => p.id === id);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Funding flow state
  const [fundStep, setFundStep] = useState<FundStep>('closed');
  const [fundAmount, setFundAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaItems = [
    { type: 'video' as const, src: '/images/pitch-1.jpg', label: 'Pitch Video' },
    { type: 'image' as const, src: '/images/pitch-1.jpg', label: 'Workshop' },
    { type: 'image' as const, src: '/images/pitch-2.jpg', label: 'Production' },
    { type: 'image' as const, src: '/images/pitch-3.jpg', label: 'Products' },
  ];

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % mediaItems.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + mediaItems.length) % mediaItems.length);

  useEffect(() => { window.scrollTo(0, 0); }, [id]);

  if (!pitch) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-slate-700 font-[Outfit]">Project not found</p>
          <button onClick={() => navigate(-1)} className="mt-3 text-sm text-brand-600 hover:underline cursor-pointer">Go back</button>
        </div>
      </div>
    );
  }

  const progress = Math.round((pitch.currentFunding / pitch.fundingGoal) * 100);
  const remaining = pitch.fundingGoal - pitch.currentFunding;
  const backers = Math.floor(pitch.likes * 0.4);

  const fundBreakdown = [
    { label: 'Product Development', percent: 35, color: 'bg-brand-500' },
    { label: 'Marketing & Sales', percent: 25, color: 'bg-blue-500' },
    { label: 'Operations & Logistics', percent: 20, color: 'bg-amber-500' },
    { label: 'Team & Hiring', percent: 12, color: 'bg-purple-500' },
    { label: 'Legal & Compliance', percent: 8, color: 'bg-rose-500' },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSelectAmount = (amount: string) => {
    setFundAmount(amount.replace(/[^0-9]/g, ''));
  };

  const handleProceedToPayment = () => {
    if (!fundAmount || Number(fundAmount) < 1000) return;
    setFundStep('payment');
  };

  const handleFlutterwavePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setFundStep('confirmation');
    }, 3000);
  };

  const handleCloseFlow = () => {
    setFundStep('closed');
    setFundAmount('');
    setIsProcessing(false);
  };

  const formatInputAmount = (val: string) => {
    const num = Number(val);
    if (!val || isNaN(num)) return '';
    return num.toLocaleString();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#f7f8fa]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-5 lg:py-8">

        {/* Back */}
        <motion.button initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} onClick={() => navigate(-1)} className="flex items-center gap-2 text-[13px] font-medium text-slate-500 hover:text-slate-700 mb-5 cursor-pointer transition-colors">
          <ArrowLeft size={16} /> Back to Discover
        </motion.button>

        {/* ===== CAROUSEL + FUNDING SIDEBAR ===== */}
        <div className="grid lg:grid-cols-5 gap-6 mb-8">

          {/* Carousel */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="lg:col-span-3">
            <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-[16/9.5] group">
              <AnimatePresence mode="wait">
                <motion.div key={currentSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
                  <img src={mediaItems[currentSlide].src} alt={mediaItems[currentSlide].label} className="w-full h-full object-cover" />
                  {mediaItems[currentSlide].type === 'video' && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                        <Play size={24} className="text-slate-800 ml-1" fill="currentColor" />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
              <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"><ChevronLeft size={18} className="text-slate-700" /></button>
              <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer"><ChevronRight size={18} className="text-slate-700" /></button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {mediaItems.map((_, i) => (<button key={i} onClick={() => setCurrentSlide(i)} className={`h-1.5 rounded-full transition-all cursor-pointer ${i === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />))}
              </div>
              <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">{currentSlide + 1} / {mediaItems.length}</div>
            </div>
            {/* Thumbnails */}
            <div className="flex gap-2 mt-3">
              {mediaItems.map((item, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} className={`relative flex-1 aspect-[16/10] rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${i === currentSlide ? 'border-brand-500 ring-1 ring-brand-200' : 'border-transparent opacity-60 hover:opacity-90'}`}>
                  <img src={item.src} alt={item.label} className="w-full h-full object-cover" />
                  {item.type === 'video' && (<div className="absolute inset-0 bg-black/30 flex items-center justify-center"><Play size={14} className="text-white" fill="currentColor" /></div>)}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Funding Sidebar */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 sticky top-20">
              <div className="mb-5">
                <div className="flex items-baseline justify-between mb-2">
                  <p className="text-2xl font-bold text-slate-900 font-[Outfit]">{formatNaira(pitch.currentFunding)}</p>
                  <p className="text-[12px] text-slate-400">of {formatNaira(pitch.fundingGoal)}</p>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(progress, 100)}%` }} transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }} className="h-full bg-gradient-to-r from-brand-400 to-brand-500 rounded-full" />
                </div>
                <p className="text-[12px] font-semibold text-brand-600">{progress}% funded</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-5">
                {[
                  { label: 'Backers', value: backers.toString(), icon: Users },
                  { label: 'Days Left', value: '28', icon: Clock },
                  { label: 'Remaining', value: formatNaira(remaining), icon: Target },
                ].map((s) => (
                  <div key={s.label} className="text-center bg-slate-50 rounded-xl py-3 px-2">
                    <s.icon size={15} className="text-slate-400 mx-auto mb-1" />
                    <p className="text-[14px] font-bold text-slate-800 font-[Outfit]">{s.value}</p>
                    <p className="text-[10px] text-slate-400">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 mb-5">
                <Button variant="primary" size="lg" fullWidth icon={<DollarSign size={17} />} onClick={() => setFundStep('amount')}>Fund This Project</Button>
                <Button variant="outline" size="md" fullWidth icon={<Share2 size={16} />} onClick={() => setShowShareModal(true)}>Share Project</Button>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button onClick={() => setIsLiked(!isLiked)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer ${isLiked ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                  <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} /> {isLiked ? 'Liked' : 'Like'}
                </button>
                <button onClick={() => setIsSaved(!isSaved)} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-medium transition-all cursor-pointer ${isSaved ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                  <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} /> {isSaved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ===== PROJECT DETAILS ===== */}
        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">

            {/* Title & About */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {pitch.verified && (<span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-brand-50 text-brand-700 rounded-full border border-brand-100"><BadgeCheck size={12} /> Verified</span>)}
                <span className="px-2.5 py-1 text-[11px] font-semibold bg-brand-50 text-brand-600 rounded-full">{pitch.category}</span>
                <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-full flex items-center gap-1"><MapPin size={10} /> {pitch.location}</span>
                <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${stageColors[pitch.stage]}`}>{stageLabels[pitch.stage]}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-[Outfit] tracking-tight mb-2">{pitch.title}</h1>
              <div className="flex items-center gap-4 text-[12px] text-slate-400 mb-5">
                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(pitch.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><Eye size={12} /> {pitch.views.toLocaleString()} views</span>
                <span className="flex items-center gap-1"><Heart size={12} /> {pitch.likes} likes</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-5">
                {pitch.tags.map((tag) => (<span key={tag} className="px-3 py-1 text-[11px] font-medium bg-slate-50 text-slate-600 rounded-lg border border-slate-100">{tag}</span>))}
              </div>
              <h2 className="text-[15px] font-semibold text-slate-800 font-[Outfit] mb-3">About This Project</h2>
              <div className="text-[13px] text-slate-600 leading-relaxed space-y-3">
                <p>{pitch.description}</p>
                <p>Our mission is to create lasting impact by bridging the gap between innovation and capital. We've built a strong foundation with early traction and a clear path to scale. The team brings deep domain expertise and a track record of execution in the {pitch.category.toLowerCase()} space.</p>
                <p>With this funding round, we plan to expand our operations across Nigeria, strengthen our technology infrastructure, and enter new markets. Our unit economics are proven and we're ready to accelerate growth significantly.</p>
              </div>
            </motion.div>

            {/* Fund Breakdown */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-5">
                <PieChart size={18} className="text-brand-500" />
                <h2 className="text-[15px] font-semibold text-slate-800 font-[Outfit]">Use of Funds</h2>
              </div>
              <div className="flex h-4 rounded-full overflow-hidden mb-5">
                {fundBreakdown.map((item, i) => (
                  <motion.div key={item.label} initial={{ width: 0 }} animate={{ width: `${item.percent}%` }} transition={{ duration: 0.8, delay: 0.4 + i * 0.08, ease: 'easeOut' }} className={`${item.color} ${i === 0 ? 'rounded-l-full' : ''} ${i === fundBreakdown.length - 1 ? 'rounded-r-full' : ''}`} />
                ))}
              </div>
              <div className="space-y-3">
                {fundBreakdown.map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5"><div className={`w-3 h-3 rounded-full ${item.color}`} /><span className="text-[13px] text-slate-700">{item.label}</span></div>
                    <div className="flex items-center gap-3"><span className="text-[13px] font-semibold text-slate-800">{formatNaira(pitch.fundingGoal * item.percent / 100)}</span><span className="text-[11px] text-slate-400 w-8 text-right">{item.percent}%</span></div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Key Metrics */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <h2 className="text-[15px] font-semibold text-slate-800 font-[Outfit] mb-4">Key Metrics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Monthly Revenue', value: formatNaira(pitch.currentFunding * 0.08), icon: TrendingUp, color: 'bg-brand-50 text-brand-600' },
                  { label: 'Customers', value: `${Math.floor(pitch.views * 0.3)}+`, icon: Users, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Growth Rate', value: '24% MoM', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Team Size', value: `${Math.floor(pitch.likes / 50) + 5}`, icon: Users, color: 'bg-purple-50 text-purple-600' },
                ].map((m) => (
                  <div key={m.label} className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100/80">
                    <div className={`w-9 h-9 ${m.color} rounded-lg flex items-center justify-center mx-auto mb-2`}><m.icon size={16} /></div>
                    <p className="text-[14px] font-bold text-slate-800 font-[Outfit]">{m.value}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Entrepreneur */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.4 }} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <h2 className="text-[15px] font-semibold text-slate-800 font-[Outfit] mb-4">About the Entrepreneur</h2>
              <div className="flex items-center gap-3 mb-4">
                <img src="/images/entrepreneur-portrait.jpg" alt={pitch.entrepreneurName} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-brand-100" />
                <div>
                  <div className="flex items-center gap-1.5"><p className="text-[14px] font-semibold text-slate-800">{pitch.entrepreneurName}</p>{pitch.verified && <BadgeCheck size={14} className="text-brand-500" />}</div>
                  <p className="text-[12px] text-slate-500">Founder & CEO</p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin size={10} /> {pitch.location}, Nigeria</p>
                </div>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed mb-4">Passionate entrepreneur with 8+ years of experience in {pitch.category.toLowerCase()}. Previously led product teams at two successful startups. Committed to creating sustainable impact through innovation.</p>
              <div className="space-y-2.5 mb-4">
                {[
                  { icon: Building2, label: 'Company', value: pitch.companyName },
                  { icon: Briefcase, label: 'Industry', value: pitch.category },
                  { icon: Award, label: 'Experience', value: '8+ years' },
                  { icon: Globe, label: 'Website', value: `${pitch.companyName.toLowerCase().replace(/\s+/g, '')}.com` },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2 text-[12px] text-slate-400"><item.icon size={13} /> {item.label}</div>
                    <span className="text-[12px] font-medium text-slate-700">{item.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-brand-50 text-brand-600 rounded-xl text-[12px] font-medium hover:bg-brand-100 transition-colors cursor-pointer"><Mail size={13} /> Message</button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 text-slate-600 rounded-xl text-[12px] font-medium hover:bg-slate-100 transition-colors cursor-pointer"><Linkedin size={13} /> LinkedIn</button>
              </div>
            </motion.div>

            {/* Trust */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <h2 className="text-[15px] font-semibold text-slate-800 font-[Outfit] mb-4">Verification & Trust</h2>
              <div className="space-y-3">
                {[
                  { label: 'Identity Verified', desc: 'Government ID verified', done: true },
                  { label: 'Business Registered', desc: 'CAC registration confirmed', done: true },
                  { label: 'Pitch Deck Reviewed', desc: 'Reviewed by expert panel', done: true },
                  { label: 'Financial Audit', desc: 'Third-party financial review', done: pitch.stage !== 'idea' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2.5">
                    {item.done ? <CheckCircle2 size={16} className="text-brand-500 mt-0.5 flex-shrink-0" /> : <Clock size={16} className="text-slate-300 mt-0.5 flex-shrink-0" />}
                    <div><p className={`text-[12px] font-medium ${item.done ? 'text-slate-700' : 'text-slate-400'}`}>{item.label}</p><p className="text-[11px] text-slate-400">{item.desc}</p></div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Similar */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6">
              <h2 className="text-[15px] font-semibold text-slate-800 font-[Outfit] mb-4">Similar Projects</h2>
              <div className="space-y-3">
                {pitches.filter((p) => p.id !== pitch.id && p.category === pitch.category).slice(0, 3).map((p) => (
                  <Link key={p.id} to={`/dashboard/funder/project/${p.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center flex-shrink-0"><span className="text-white text-[11px] font-bold">{p.entrepreneurName.charAt(0)}</span></div>
                    <div className="flex-1 min-w-0"><p className="text-[12px] font-medium text-slate-700 truncate group-hover:text-brand-600 transition-colors">{p.title.split('—')[0].trim()}</p><p className="text-[10px] text-slate-400">{formatNaira(p.currentFunding)} raised</p></div>
                    <ExternalLink size={12} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ===== SHARE MODAL ===== */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <button onClick={() => setShowShareModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"><X size={18} /></button>
              <h3 className="text-[16px] font-semibold text-slate-800 font-[Outfit] mb-4">Share Project</h3>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl p-2.5 mb-4">
                <input type="text" readOnly value={`grantbridge.com/project/${pitch.id}`} className="flex-1 bg-transparent text-[12px] text-slate-600 outline-none" />
                <button onClick={handleCopyLink} className="px-3 py-1.5 bg-brand-500 text-white text-[11px] font-semibold rounded-lg hover:bg-brand-600 transition-colors cursor-pointer flex items-center gap-1"><Copy size={11} /> {copied ? 'Copied!' : 'Copy'}</button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {['Twitter', 'LinkedIn', 'WhatsApp'].map((p) => (<button key={p} className="py-2.5 bg-slate-50 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer">{p}</button>))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== FUNDING FLOW MODAL (3 Steps) ===== */}
      <AnimatePresence>
        {fundStep !== 'closed' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={isProcessing ? undefined : handleCloseFlow} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 24 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              {/* Step indicator */}
              <div className="px-6 pt-5 pb-0">
                <div className="flex items-center gap-1 mb-1">
                  {['amount', 'payment', 'confirmation'].map((s, i) => {
                    const stepNames: FundStep[] = ['amount', 'payment', 'confirmation'];
                    const currentIdx = stepNames.indexOf(fundStep);
                    return (
                      <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= currentIdx ? 'bg-brand-500' : 'bg-slate-200'}`} />
                    );
                  })}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-4">
                  <span className={fundStep === 'amount' ? 'text-brand-600 font-semibold' : ''}>Amount</span>
                  <span className={fundStep === 'payment' ? 'text-brand-600 font-semibold' : ''}>Payment</span>
                  <span className={fundStep === 'confirmation' ? 'text-brand-600 font-semibold' : ''}>Confirmation</span>
                </div>
              </div>

              {!isProcessing && fundStep !== 'confirmation' && (
                <button onClick={handleCloseFlow} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer z-10"><X size={18} /></button>
              )}

              <AnimatePresence mode="wait">
                {/* STEP 1: Select Amount */}
                {fundStep === 'amount' && (
                  <motion.div key="step-amount" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }} className="px-6 pb-6">
                    <div className="text-center mb-5">
                      <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-brand-100">
                        <DollarSign size={24} className="text-brand-500" />
                      </div>
                      <h3 className="text-[17px] font-bold text-slate-800 font-[Outfit]">Select Funding Amount</h3>
                      <p className="text-[12px] text-slate-400 mt-1">{pitch.title.split('—')[0].trim()} · {formatNaira(remaining)} remaining</p>
                    </div>

                    {/* Amount input */}
                    <div className="mb-4">
                      <label className="block text-[12px] font-medium text-slate-700 mb-1.5">Enter Amount (₦)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-slate-400">₦</span>
                        <input
                          type="text"
                          placeholder="0"
                          value={formatInputAmount(fundAmount)}
                          onChange={(e) => setFundAmount(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full pl-9 pr-4 py-3.5 text-[18px] font-bold text-slate-800 border-2 border-slate-200 rounded-xl outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all text-center font-[Outfit]"
                        />
                      </div>
                      {fundAmount && Number(fundAmount) < 1000 && (
                        <p className="text-[11px] text-red-500 mt-1.5">Minimum funding amount is ₦1,000</p>
                      )}
                    </div>

                    {/* Quick amounts */}
                    <div className="grid grid-cols-4 gap-2 mb-5">
                      {[
                        { label: '₦100K', value: '100000' },
                        { label: '₦500K', value: '500000' },
                        { label: '₦1M', value: '1000000' },
                        { label: '₦5M', value: '5000000' },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleSelectAmount(opt.value)}
                          className={`py-2.5 rounded-xl text-[12px] font-semibold transition-all cursor-pointer border ${
                            fundAmount === opt.value
                              ? 'bg-brand-50 text-brand-600 border-brand-200'
                              : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Summary */}
                    {fundAmount && Number(fundAmount) >= 1000 && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-slate-50 rounded-xl p-4 mb-5 space-y-2">
                        <div className="flex justify-between text-[12px]"><span className="text-slate-500">Investment Amount</span><span className="font-semibold text-slate-700">{formatNaira(Number(fundAmount))}</span></div>
                        <div className="flex justify-between text-[12px]"><span className="text-slate-500">Processing Fee (1.5%)</span><span className="font-semibold text-slate-700">{formatNaira(Number(fundAmount) * 0.015)}</span></div>
                        <div className="border-t border-slate-200 pt-2 flex justify-between text-[13px]"><span className="font-semibold text-slate-700">Total</span><span className="font-bold text-slate-900">{formatNaira(Number(fundAmount) * 1.015)}</span></div>
                      </motion.div>
                    )}

                    <Button variant="primary" size="lg" fullWidth icon={<ArrowRight size={17} />} onClick={handleProceedToPayment} disabled={!fundAmount || Number(fundAmount) < 1000}>
                      Proceed to Payment
                    </Button>
                    <p className="text-[10px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1"><Lock size={9} /> Secured by GrantBridge Escrow</p>
                  </motion.div>
                )}

                {/* STEP 2: Flutterwave Payment */}
                {fundStep === 'payment' && (
                  <motion.div key="step-payment" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }} className="px-6 pb-6">
                    {!isProcessing ? (
                      <>
                        {/* Flutterwave-style payment UI */}
                        <div className="text-center mb-5">
                          <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-orange-100">
                            <CreditCard size={24} className="text-orange-500" />
                          </div>
                          <h3 className="text-[17px] font-bold text-slate-800 font-[Outfit]">Payment</h3>
                          <p className="text-[12px] text-slate-400 mt-1">Complete your payment via Flutterwave</p>
                        </div>

                        {/* Payment summary card */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 mb-5 text-white">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-[10px] font-bold">FW</span>
                              </div>
                              <span className="text-[13px] font-semibold text-white/90">Flutterwave</span>
                            </div>
                            <ShieldCheck size={16} className="text-green-400" />
                          </div>
                          <p className="text-[11px] text-white/50 mb-1">Amount to pay</p>
                          <p className="text-[28px] font-bold font-[Outfit]">{formatNaira(Number(fundAmount) * 1.015)}</p>
                          <p className="text-[11px] text-white/50 mt-2">To: {pitch.companyName} via GrantBridge Escrow</p>
                        </div>

                        {/* Payment methods */}
                        <p className="text-[12px] font-semibold text-slate-700 mb-3">Select Payment Method</p>
                        <div className="space-y-2 mb-5">
                          {[
                            { label: 'Card Payment', desc: 'Visa, Mastercard, Verve', icon: CreditCard, selected: true },
                            { label: 'Bank Transfer', desc: 'Pay via bank transfer', icon: Building2, selected: false },
                            { label: 'USSD', desc: 'Pay with USSD code', icon: Briefcase, selected: false },
                          ].map((method) => (
                            <label key={method.label} className={`flex items-center gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all ${method.selected ? 'border-brand-400 bg-brand-50/50' : 'border-slate-100 hover:border-slate-200'}`}>
                              <input type="radio" name="paymethod" defaultChecked={method.selected} className="w-4 h-4 text-brand-500 border-slate-300 focus:ring-brand-500" />
                              <method.icon size={18} className={method.selected ? 'text-brand-600' : 'text-slate-400'} />
                              <div>
                                <p className="text-[13px] font-medium text-slate-800">{method.label}</p>
                                <p className="text-[10px] text-slate-400">{method.desc}</p>
                              </div>
                            </label>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <button onClick={() => setFundStep('amount')} className="px-4 py-3 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer">Back</button>
                          <Button variant="primary" size="lg" fullWidth icon={<Lock size={15} />} onClick={handleFlutterwavePay} className="flex-1">
                            Pay {formatNaira(Number(fundAmount) * 1.015)}
                          </Button>
                        </div>
                        <p className="text-[10px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
                          <ShieldCheck size={9} /> 256-bit SSL encrypted · PCI DSS compliant
                        </p>
                      </>
                    ) : (
                      /* Processing state */
                      <div className="py-10 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                          className="w-16 h-16 border-4 border-slate-200 border-t-brand-500 rounded-full mx-auto mb-5"
                        />
                        <h3 className="text-[17px] font-bold text-slate-800 font-[Outfit] mb-2">Processing Payment</h3>
                        <p className="text-[13px] text-slate-500 mb-1">Please wait while we process your payment...</p>
                        <p className="text-[11px] text-slate-400">Do not close this window</p>
                        <div className="mt-6 flex items-center justify-center gap-2">
                          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-[9px] font-bold">FW</span>
                          </div>
                          <span className="text-[12px] text-slate-500">Powered by Flutterwave</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* STEP 3: Confirmation */}
                {fundStep === 'confirmation' && (
                  <motion.div key="step-confirm" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="px-6 pb-6">
                    <div className="text-center py-4">
                      {/* Success animation */}
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 150, delay: 0.1 }}
                        className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-brand-100 relative"
                      >
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 8, stiffness: 200, delay: 0.3 }}>
                          <CheckCircle2 size={40} className="text-brand-500" />
                        </motion.div>
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5], x: [0, (i % 2 === 0 ? 1 : -1) * (25 + i * 7)], y: [0, -(15 + i * 8)] }}
                            transition={{ duration: 0.7, delay: 0.4 + i * 0.06 }}
                            className="absolute w-2 h-2 rounded-full"
                            style={{ backgroundColor: ['#22c55e', '#4ade80', '#86efac', '#fbbf24', '#60a5fa', '#a78bfa'][i] }}
                          />
                        ))}
                      </motion.div>

                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full mb-3">
                          <Sparkles size={12} className="text-brand-500" />
                          <span className="text-[11px] font-semibold text-brand-700">Payment Successful</span>
                        </div>

                        <h3 className="text-[20px] font-bold text-slate-900 font-[Outfit] mb-2">Thank You!</h3>
                        <p className="text-[13px] text-slate-500 leading-relaxed mb-5 max-w-xs mx-auto">
                          Your investment of <span className="font-semibold text-slate-800">{formatNaira(Number(fundAmount))}</span> in <span className="font-semibold text-slate-800">{pitch.title.split('—')[0].trim()}</span> has been confirmed.
                        </p>

                        {/* Receipt */}
                        <div className="bg-slate-50 rounded-xl p-4 mb-5 text-left space-y-2">
                          <div className="flex justify-between text-[12px]"><span className="text-slate-500">Transaction ID</span><span className="font-mono font-semibold text-slate-700">TXN-{Date.now().toString(36).toUpperCase()}</span></div>
                          <div className="flex justify-between text-[12px]"><span className="text-slate-500">Amount</span><span className="font-semibold text-slate-700">{formatNaira(Number(fundAmount))}</span></div>
                          <div className="flex justify-between text-[12px]"><span className="text-slate-500">Fee</span><span className="font-semibold text-slate-700">{formatNaira(Number(fundAmount) * 0.015)}</span></div>
                          <div className="flex justify-between text-[12px]"><span className="text-slate-500">Total Paid</span><span className="font-bold text-slate-900">{formatNaira(Number(fundAmount) * 1.015)}</span></div>
                          <div className="border-t border-slate-200 pt-2 flex justify-between text-[12px]"><span className="text-slate-500">Status</span><span className="font-semibold text-brand-600 flex items-center gap-1"><CheckCircle2 size={11} /> Completed</span></div>
                          <div className="flex justify-between text-[12px]"><span className="text-slate-500">Date</span><span className="font-semibold text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
                        </div>

                        <div className="space-y-2">
                          <Button variant="primary" size="lg" fullWidth onClick={handleCloseFlow}>
                            Back to Project
                          </Button>
                          <button onClick={() => { handleCloseFlow(); navigate('/dashboard/funder/discover'); }} className="w-full py-2.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
                            Discover More Projects
                          </button>
                        </div>

                        <p className="text-[10px] text-slate-400 mt-4">A confirmation email has been sent to your registered address.</p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
