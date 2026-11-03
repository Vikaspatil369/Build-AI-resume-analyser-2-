import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, RefreshCw, AlertCircle, ShieldCheck } from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await register({ email, password, role });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-xl font-bold text-slate-100 font-sans tracking-wide">Create Account</h2>
        <p className="text-xs text-slate-400 font-semibold">Join the platform to analyze and optimize your resume.</p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-[13px] w-4 h-4 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              disabled={isSubmitting}
              className="glass-input w-full pl-10 text-sm"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-[13px] w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              className="glass-input w-full pl-10 text-sm"
              required
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-[13px] w-4 h-4 text-slate-500" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              className="glass-input w-full pl-10 text-sm"
              required
            />
          </div>
        </div>

        {/* Role Selection (Optional for testing) */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Account Role</label>
          <div className="relative">
            <ShieldCheck className="absolute left-3.5 top-[13px] w-4 h-4 text-slate-500" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isSubmitting}
              className="glass-input w-full pl-10 text-sm appearance-none cursor-pointer bg-slate-950"
            >
              <option value="USER">Standard User</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="glass-btn-primary w-full text-sm font-bold flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 font-semibold mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-400 font-bold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
