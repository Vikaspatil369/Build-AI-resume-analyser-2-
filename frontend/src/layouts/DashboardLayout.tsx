import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  LayoutDashboard, FileText, Briefcase, History, User, Lock, LogOut, Menu, X, ShieldCheck 
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { isAuthenticated, loading, user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Resumes', path: '/resumes', icon: FileText },
    { name: 'Job Matching', path: '/jobs', icon: Briefcase },
    { name: 'Analysis History', path: '/history', icon: History },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  if (isAdmin) {
    menuItems.push({ name: 'Admin Stats', path: '/admin', icon: Lock });
  }

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row relative">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex-shrink-0 hidden md:flex flex-col z-20">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-2.5">
          <div className="bg-brand-500/10 p-2 rounded-xl border border-brand-500/20 text-brand-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-sm tracking-widest uppercase">ATS Analyzer</span>
        </div>

        {/* User Info Card */}
        <div className="p-4 mx-4 mt-4 rounded-xl border border-slate-800 bg-slate-950/45 text-xs flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 font-bold uppercase text-[9px]">Account</span>
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
              isAdmin ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
            }`}>
              {user?.role}
            </span>
          </div>
          <span className="text-slate-200 font-bold truncate max-w-[200px]" title={user?.email}>
            {user?.email}
          </span>
        </div>

        {/* Nav Links */}
        <nav className="flex-grow p-4 flex flex-col gap-1 mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  active 
                    ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md shadow-brand-500/10' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-brand-400" />
          <span className="font-extrabold text-xs tracking-widest uppercase">ATS Analyzer</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-400 hover:text-slate-100 p-1 bg-slate-850 border border-slate-850 rounded"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[57px] bg-slate-950/95 backdrop-blur-md z-20 flex flex-col animate-fade-in">
          {/* User profile details */}
          <div className="p-6 border-b border-slate-900 flex justify-between items-center">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-500">Active Profile</span>
              <span className="text-sm font-bold text-slate-100">{user?.email}</span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isAdmin ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
            }`}>
              {user?.role}
            </span>
          </div>

          {/* Navigation link list */}
          <nav className="flex-grow p-6 flex flex-col gap-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-bold transition-all ${
                    active 
                      ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer actions */}
          <div className="p-6 border-t border-slate-900">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-sm font-bold text-rose-400 hover:bg-rose-500/20 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Panel Content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto max-w-full md:max-w-[calc(100vw-256px)] min-h-[calc(100vh-57px)] md:min-h-screen flex flex-col relative">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
