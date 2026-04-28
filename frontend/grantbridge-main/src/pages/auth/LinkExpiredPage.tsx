import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, RefreshCw, ArrowLeft } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/ui/Button';
import type { UserRole } from '../../lib/store';

export default function LinkExpiredPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};
  const userRole: UserRole = role === 'funder' ? 'funder' : 'entrepreneur';

  const handleResend = () => {
    navigate(`/verify-email/${role}`, { state });
  };

  return (
    <AuthLayout role={userRole} variant="error">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
          className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-red-100"
        >
          <motion.div animate={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Clock size={36} className="text-red-500" />
          </motion.div>
        </motion.div>

        <h1 className="text-[22px] font-bold text-slate-900 font-[Outfit] mb-2">Link Expired</h1>
        <p className="text-[13px] text-slate-500 leading-relaxed mb-6 max-w-sm mx-auto">
          The verification link has expired. Verification links are valid for 24 hours. Please request a new link to continue with your registration.
        </p>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 text-left">
          <p className="text-[12px] text-amber-700 leading-relaxed">
            <span className="font-semibold">Why did this happen?</span> Verification links expire after 24 hours for security reasons. Simply request a new one and it will be sent to your email immediately.
          </p>
        </div>

        <Button variant="primary" size="lg" fullWidth onClick={handleResend} icon={<RefreshCw size={17} />}>
          Resend Verification Link
        </Button>

        <div className="mt-4">
          <Link to={`/signup/${role}`} className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft size={14} /> Back to signup
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
