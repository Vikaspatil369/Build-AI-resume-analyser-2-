import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ShieldCheck } from 'lucide-react';

const AuthLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to dashboard if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center relative overflow-hidden px-4">
      {/* Decorative ambient background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[420px] mx-auto z-10 relative">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-brand-500/10 p-3 rounded-2xl border border-brand-500/20 text-brand-400 mb-3 shadow-lg">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-extrabold tracking-wider font-sans uppercase">
            AI Resume Analyzer
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Optimize your resume for ATS parsers.
          </p>
        </div>

        {/* Content Box */}
        <div className="glass-panel rounded-2xl p-8 border border-slate-800/80 shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
