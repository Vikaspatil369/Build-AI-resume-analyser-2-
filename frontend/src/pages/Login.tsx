import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, RefreshCw, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-xl font-bold text-slate-100 font-sans tracking-wide">Welcome Back</h2>
        <p className="text-xs text-slate-400 font-semibold">Sign in to your account to analyze your resume.</p>
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

        {/* Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="glass-btn-primary w-full text-sm font-bold flex items-center justify-center gap-2 mt-2"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <div className="text-center text-xs text-slate-500 font-semibold mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-brand-400 font-bold hover:underline">
          Create Account
        </Link>
      </div>
    </div>
  );
};

export default Login;
