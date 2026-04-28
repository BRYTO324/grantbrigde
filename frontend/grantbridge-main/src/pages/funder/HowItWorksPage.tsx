import { motion } from 'framer-motion';
import {
  Search, Shield, FileText, Handshake, CheckCircle2,
  ArrowRight, HelpCircle, MessageSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const steps = [
  {
    step: '01',
    icon: Search,
    title: 'Discover Verified Projects',
    description: 'Browse our curated marketplace of verified business pitches. Use advanced filters to find projects that match your investment criteria — by category, location, funding range, and stage.',
    color: 'bg-brand-100 text-brand-600',
  },
  {
    step: '02',
    icon: FileText,
    title: 'Review Pitch Details',
    description: 'Access comprehensive pitch decks, financial projections, team information, and market analysis. Every project goes through our verification process before being listed.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    step: '03',
    icon: MessageSquare,
    title: 'Connect with Entrepreneurs',
    description: 'Reach out directly to entrepreneurs you\'re interested in. Schedule calls, request additional documentation, and ask questions through our secure messaging system.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    step: '04',
    icon: Shield,
    title: 'Due Diligence Support',
    description: 'Leverage our built-in due diligence tools including background checks, document verification, and financial audit summaries. Make informed decisions with confidence.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    step: '05',
    icon: Handshake,
    title: 'Fund & Partner',
    description: 'Once you\'ve found the right project, use our secure escrow system to make your investment. Legal templates and smart contracts ensure a smooth transaction for both parties.',
    color: 'bg-rose-100 text-rose-600',
  },
];

const faqs = [
  {
    q: 'How are projects verified?',
    a: 'Every project goes through a multi-step verification process including identity verification of the entrepreneur, business registration checks, and review of submitted documentation by our team.',
  },
  {
    q: 'What is the minimum investment amount?',
    a: 'There is no platform-mandated minimum. Each project sets its own funding terms. You can find projects across all funding ranges using our filters.',
  },
  {
    q: 'How is my investment protected?',
    a: 'We use a secure escrow system where funds are held until agreed-upon milestones are met. Legal agreements are generated automatically to protect both parties.',
  },
  {
    q: 'Can I invest in multiple projects?',
    a: 'Absolutely. Many funders diversify across multiple projects and categories. Your dashboard helps you track all your investments in one place.',
  },
  {
    q: 'What returns can I expect?',
    a: 'Returns vary by project type, stage, and industry. Each pitch includes projected returns and financial models. Past performance data is available for growth and scale-stage projects.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-50 to-white py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-100 border border-brand-200 rounded-full text-xs font-semibold text-brand-700 uppercase tracking-wider mb-6">
              <HelpCircle size={14} /> Funder Guide
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 font-[Outfit] tracking-tight leading-tight">
              How Funding Works on<br />
              <span className="text-brand-500">GrantBridge</span>
            </h1>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              From discovery to deal — here's everything you need to know about finding and funding the next big innovation on our platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="relative flex gap-6 pb-12 last:pb-0"
              >
                {/* Vertical line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-0 w-px bg-slate-200" />
                )}

                {/* Icon */}
                <div className={`w-12 h-12 ${step.color} rounded-2xl flex items-center justify-center flex-shrink-0 relative z-10`}>
                  <step.icon size={22} />
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Step {step.step}</span>
                  <h3 className="text-xl font-semibold text-slate-800 font-[Outfit] mt-1 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Outfit] tracking-tight">Frequently Asked Questions</h2>
            <p className="mt-2 text-sm text-slate-500">Everything you need to know about investing through GrantBridge.</p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                className="bg-white rounded-2xl border border-slate-100 p-6"
              >
                <h3 className="text-sm font-semibold text-slate-800 mb-2 flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-brand-500 mt-0.5 flex-shrink-0" />
                  {faq.q}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed pl-6">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-[Outfit] tracking-tight">Ready to Start Investing?</h2>
            <p className="mt-3 text-sm text-slate-500 max-w-lg mx-auto">Browse verified projects from innovative entrepreneurs across Nigeria and find your next investment opportunity.</p>
            <div className="mt-6">
              <Link to="/dashboard/funder/discover">
                <Button variant="primary" size="lg" icon={<ArrowRight size={18} />}>
                  Discover Projects
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
