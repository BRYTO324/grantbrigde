import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Building2, FileText, Upload, Shield, Camera,
  ArrowRight, ArrowLeft, CheckCircle2, ChevronDown,
  MapPin, Phone, Mail, Globe, Briefcase, Calendar,
  CreditCard, AlertCircle, Sparkles, X, Loader2
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

type Step = 1 | 2 | 3 | 4;

const idTypes = [
  { value: 'voters-card', label: "Voter's Card", desc: 'National voter registration card' },
  { value: 'international-passport', label: 'International Passport', desc: 'Valid Nigerian passport' },
  { value: 'drivers-license', label: "Driver's License", desc: 'Valid Nigerian driving license' },
  { value: 'national-id', label: 'National ID Card (NIN)', desc: 'National Identity Number card' },
];

export default function EntrepreneurOnboarding() {
  const { user, logout, completeOnboarding } = useAppStore();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Personal Info
  const [personal, setPersonal] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: '',
    address: '',
    city: '',
    state: '',
  });

  // Step 2: Business Details
  const [business, setBusiness] = useState({
    companyName: user?.company || '',
    industry: '',
    description: '',
    website: '',
    regNumber: '',
    yearFounded: '',
  });

  // Step 3: ID Verification
  const [idType, setIdType] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [idFrontName, setIdFrontName] = useState('');
  const [idBackName, setIdBackName] = useState('');
  const [selfieName, setSelfieName] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleLogout = () => { logout(); navigate('/'); };

  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!personal.fullName.trim()) e.fullName = 'Required';
    if (!personal.phone.trim()) e.phone = 'Required';
    if (!personal.dateOfBirth) e.dateOfBirth = 'Required';
    if (!personal.address.trim()) e.address = 'Required';
    if (!personal.state.trim()) e.state = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!business.companyName.trim()) e.companyName = 'Required';
    if (!business.industry) e.industry = 'Required';
    if (!business.description.trim()) e.description = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!idType) e.idType = 'Select an ID type';
    if (!idNumber.trim()) e.idNumber = 'Required';
    if (!idFrontName) e.idFront = 'Upload front of ID';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step === 3 && !validateStep3()) return;
    if (step < 4) setStep((step + 1) as Step);
  };

  const prevStep = () => {
    setErrors({});
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleFileUpload = (setter: (name: string) => void) => {
    // Simulate file selection
    const names = ['document_front.jpg', 'passport_scan.pdf', 'id_photo.png', 'license_scan.jpg'];
    setter(names[Math.floor(Math.random() * names.length)]);
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStep(4);
    }, 2000);
  };

  const handleGoToDashboard = () => {
    completeOnboarding();
    navigate('/dashboard/entrepreneur');
  };

  const steps = [
    { num: 1, label: 'Personal Info', icon: User },
    { num: 2, label: 'Business', icon: Building2 },
    { num: 3, label: 'ID Verification', icon: Shield },
    { num: 4, label: 'Complete', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-md shadow-brand-500/25">
              <span className="text-white font-bold text-lg font-[Outfit]">G</span>
            </div>
            <span className="text-[17px] font-bold text-slate-800 font-[Outfit] tracking-tight">GrantBridge</span>
          </Link>
          <button onClick={handleLogout} className="text-[13px] text-slate-500 hover:text-red-500 cursor-pointer transition-colors">Sign out</button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 font-[Outfit] tracking-tight">Complete Your Profile</h1>
          <p className="text-[13px] text-slate-500 mt-1.5">Verify your identity to start posting projects on GrantBridge</p>
        </motion.div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold transition-all border-2 ${
                  step > s.num ? 'bg-brand-500 border-brand-500 text-white'
                  : step === s.num ? 'bg-white border-brand-500 text-brand-600 shadow-md shadow-brand-100'
                  : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {step > s.num ? <CheckCircle2 size={18} /> : <s.icon size={16} />}
                </div>
                <span className={`text-[10px] font-medium mt-1.5 hidden sm:block ${step >= s.num ? 'text-slate-700' : 'text-slate-400'}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 sm:w-20 h-[2px] mx-1 sm:mx-2 rounded-full transition-all mt-[-16px] sm:mt-[-12px] ${step > s.num ? 'bg-brand-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center"><User size={18} className="text-brand-600" /></div>
                <div>
                  <h2 className="text-[16px] font-semibold text-slate-800 font-[Outfit]">Personal Information</h2>
                  <p className="text-[12px] text-slate-400">Tell us about yourself</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input label="Full Name (as on ID)" placeholder="Adaeze Okafor" icon={<User size={16} />} value={personal.fullName}
                    onChange={(e) => { setPersonal(p => ({...p, fullName: e.target.value})); setErrors({}); }} error={errors.fullName} />
                </div>
                <Input label="Email Address" type="email" value={personal.email} disabled icon={<Mail size={16} />} />
                <Input label="Phone Number" placeholder="+234 800 000 0000" icon={<Phone size={16} />} value={personal.phone}
                  onChange={(e) => { setPersonal(p => ({...p, phone: e.target.value})); setErrors({}); }} error={errors.phone} />
                <Input label="Date of Birth" type="date" icon={<Calendar size={16} />} value={personal.dateOfBirth}
                  onChange={(e) => { setPersonal(p => ({...p, dateOfBirth: e.target.value})); setErrors({}); }} error={errors.dateOfBirth} />
                <Input label="State of Residence" placeholder="e.g. Lagos" icon={<MapPin size={16} />} value={personal.state}
                  onChange={(e) => { setPersonal(p => ({...p, state: e.target.value})); setErrors({}); }} error={errors.state} />
                <div className="sm:col-span-2">
                  <Input label="Residential Address" placeholder="123 Main Street, Lekki" icon={<MapPin size={16} />} value={personal.address}
                    onChange={(e) => { setPersonal(p => ({...p, address: e.target.value})); setErrors({}); }} error={errors.address} />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button variant="primary" size="md" onClick={nextStep} icon={<ArrowRight size={16} />}>Continue</Button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Business Details */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><Building2 size={18} className="text-blue-600" /></div>
                <div>
                  <h2 className="text-[16px] font-semibold text-slate-800 font-[Outfit]">Business Details</h2>
                  <p className="text-[12px] text-slate-400">Tell us about your company or startup</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Company / Startup Name" placeholder="AfriWeave Ltd." icon={<Briefcase size={16} />} value={business.companyName}
                  onChange={(e) => { setBusiness(b => ({...b, companyName: e.target.value})); setErrors({}); }} error={errors.companyName} />
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Industry</label>
                  <div className="relative">
                    <select value={business.industry} onChange={(e) => { setBusiness(b => ({...b, industry: e.target.value})); setErrors({}); }}
                      className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none transition-all appearance-none cursor-pointer bg-white hover:border-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${errors.industry ? 'border-red-400' : 'border-slate-200'}`}>
                      <option value="">Select industry</option>
                      {['Fashion & Textile','HealthTech','AgriTech','EdTech','FinTech','Clean Energy','Construction','E-Commerce','Logistics','Other'].map(i => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                  {errors.industry && <p className="mt-1.5 text-xs text-red-500">{errors.industry}</p>}
                </div>
                <Input label="CAC Registration Number" placeholder="RC-1234567" icon={<FileText size={16} />} value={business.regNumber}
                  onChange={(e) => setBusiness(b => ({...b, regNumber: e.target.value}))} />
                <Input label="Year Founded" placeholder="2023" icon={<Calendar size={16} />} value={business.yearFounded}
                  onChange={(e) => setBusiness(b => ({...b, yearFounded: e.target.value}))} />
                <div className="sm:col-span-2">
                  <Input label="Website (optional)" placeholder="https://yourcompany.com" icon={<Globe size={16} />} value={business.website}
                    onChange={(e) => setBusiness(b => ({...b, website: e.target.value}))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Business Description</label>
                  <textarea placeholder="Briefly describe what your business does..." value={business.description}
                    onChange={(e) => { setBusiness(b => ({...b, description: e.target.value})); setErrors({}); }}
                    className={`w-full rounded-xl border px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all min-h-[100px] resize-none hover:border-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${errors.description ? 'border-red-400' : 'border-slate-200'}`} />
                  {errors.description && <p className="mt-1.5 text-xs text-red-500">{errors.description}</p>}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="ghost" size="md" onClick={prevStep} icon={<ArrowLeft size={16} />}>Back</Button>
                <Button variant="primary" size="md" onClick={nextStep} icon={<ArrowRight size={16} />}>Continue</Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: ID Verification */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><Shield size={18} className="text-purple-600" /></div>
                <div>
                  <h2 className="text-[16px] font-semibold text-slate-800 font-[Outfit]">Identity Verification</h2>
                  <p className="text-[12px] text-slate-400">Upload a valid government-issued ID</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 mb-6 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-[12px] text-amber-700 leading-relaxed">Your ID details must match the personal information you provided in Step 1. Verification typically takes 24–48 hours.</p>
              </div>

              {/* ID Type Selection */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select ID Type</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {idTypes.map((t) => (
                    <button key={t.value} onClick={() => { setIdType(t.value); setErrors({}); }}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        idType === t.value ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        idType === t.value ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-400'
                      }`}>
                        <CreditCard size={14} />
                      </div>
                      <div>
                        <p className={`text-[12px] font-semibold ${idType === t.value ? 'text-brand-700' : 'text-slate-700'}`}>{t.label}</p>
                        <p className="text-[10px] text-slate-400">{t.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
                {errors.idType && <p className="mt-1.5 text-xs text-red-500">{errors.idType}</p>}
              </div>

              {/* ID Number */}
              <div className="mb-5">
                <Input label="ID Number" placeholder="Enter your ID number" icon={<CreditCard size={16} />} value={idNumber}
                  onChange={(e) => { setIdNumber(e.target.value); setErrors({}); }} error={errors.idNumber} />
              </div>

              {/* File Uploads */}
              <div className="space-y-3 mb-5">
                <label className="block text-sm font-medium text-slate-700">Upload Documents</label>

                {/* Front of ID */}
                <div onClick={() => handleFileUpload(setIdFrontName)}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    idFrontName ? 'border-brand-300 bg-brand-50/30' : errors.idFront ? 'border-red-300 bg-red-50/30' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}>
                  {idFrontName ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} className="text-brand-500" />
                      <span className="text-[12px] font-medium text-brand-700">{idFrontName}</span>
                      <button onClick={(e) => { e.stopPropagation(); setIdFrontName(''); }} className="text-slate-400 hover:text-red-500 cursor-pointer"><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="text-slate-400 mx-auto mb-1.5" />
                      <p className="text-[12px] font-medium text-slate-600">Front of ID</p>
                      <p className="text-[10px] text-slate-400">Click to upload · JPG, PNG or PDF · Max 5MB</p>
                    </>
                  )}
                </div>
                {errors.idFront && <p className="text-xs text-red-500 -mt-1">{errors.idFront}</p>}

                {/* Back of ID */}
                <div onClick={() => handleFileUpload(setIdBackName)}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    idBackName ? 'border-brand-300 bg-brand-50/30' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}>
                  {idBackName ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} className="text-brand-500" />
                      <span className="text-[12px] font-medium text-brand-700">{idBackName}</span>
                      <button onClick={(e) => { e.stopPropagation(); setIdBackName(''); }} className="text-slate-400 hover:text-red-500 cursor-pointer"><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="text-slate-400 mx-auto mb-1.5" />
                      <p className="text-[12px] font-medium text-slate-600">Back of ID <span className="text-slate-400">(optional)</span></p>
                      <p className="text-[10px] text-slate-400">Click to upload · JPG, PNG or PDF · Max 5MB</p>
                    </>
                  )}
                </div>

                {/* Selfie */}
                <div onClick={() => handleFileUpload(setSelfieName)}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    selfieName ? 'border-brand-300 bg-brand-50/30' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}>
                  {selfieName ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 size={16} className="text-brand-500" />
                      <span className="text-[12px] font-medium text-brand-700">{selfieName}</span>
                      <button onClick={(e) => { e.stopPropagation(); setSelfieName(''); }} className="text-slate-400 hover:text-red-500 cursor-pointer"><X size={14} /></button>
                    </div>
                  ) : (
                    <>
                      <Camera size={20} className="text-slate-400 mx-auto mb-1.5" />
                      <p className="text-[12px] font-medium text-slate-600">Selfie with ID <span className="text-slate-400">(optional)</span></p>
                      <p className="text-[10px] text-slate-400">Hold your ID next to your face · Clear lighting</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="ghost" size="md" onClick={prevStep} icon={<ArrowLeft size={16} />}>Back</Button>
                <Button variant="primary" size="md" onClick={handleSubmit} disabled={submitting}
                  icon={submitting ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}>
                  {submitting ? 'Submitting...' : 'Submit for Verification'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Success */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl border border-slate-100 p-8 sm:p-10 text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10, stiffness: 150, delay: 0.1 }}
                className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-5 border-2 border-brand-100 relative">
                <CheckCircle2 size={40} className="text-brand-500" />
                {[...Array(6)].map((_, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: [0,1,0], scale: [0,1,0.5], x: [0, (i%2===0?1:-1)*(25+i*6)], y: [0, -(15+i*8)] }}
                    transition={{ duration: 0.7, delay: 0.3+i*0.07 }}
                    className="absolute w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: ['#22c55e','#4ade80','#86efac','#fbbf24','#60a5fa','#a78bfa'][i] }} />
                ))}
              </motion.div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 rounded-full mb-3">
                <Sparkles size={12} className="text-brand-500" />
                <span className="text-[11px] font-semibold text-brand-700">Documents Submitted</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 font-[Outfit] mb-2">Verification In Progress</h2>
              <p className="text-[13px] text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
                Your documents have been submitted for review. Our team will verify your identity within <span className="font-semibold text-slate-700">24–48 hours</span>. You'll receive an email once your account is verified.
              </p>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 max-w-sm mx-auto">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-slate-700">What happens next?</p>
                    <p className="text-[11px] text-slate-400 leading-snug">You can explore the dashboard while we review your documents. Some features require verification.</p>
                  </div>
                </div>
              </div>

              <Button variant="primary" size="lg" onClick={handleGoToDashboard} icon={<ArrowRight size={17} />}>
                Go to Dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
