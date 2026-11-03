import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { User as UserIcon, Shield, Key, Star, Info, Settings } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-100 font-sans tracking-wide">My Profile</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage details of your system session account.</p>
      </div>

      {/* Account Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="glass-panel rounded-2xl p-5 md:col-span-2 flex items-start gap-4">
          <div className="bg-brand-500/10 p-3.5 rounded-2xl border border-brand-500/15 text-brand-400 flex-shrink-0">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Account Email</span>
            <h3 className="text-base font-bold text-slate-200 mt-0.5">{user?.email}</h3>
            
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-3">Access Tier</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                user?.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
              }`}>
                {user?.role}
              </span>
              <span className="text-[10px] text-slate-400">
                {user?.role === 'ADMIN' ? 'System Administrator Access' : 'Standard Sandbox Account'}
              </span>
            </div>
          </div>
        </div>

        {/* Quota details */}
        <div className="glass-panel rounded-2xl p-5 md:col-span-1 flex flex-col justify-between">
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Daily Usage Quota</span>
            <h3 className="text-lg font-black text-slate-200 mt-0.5">Unlimited</h3>
            <p className="text-[10px] text-slate-500 leading-normal mt-1">
              Sandbox mode allows unrestricted parsing, AI analyses, and duplicates.
            </p>
          </div>
          
          <div className="mt-4 pt-3.5 border-t border-slate-900 flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
            <Star className="w-3.5 h-3.5 fill-current" />
            Developer Status Active
          </div>
        </div>
      </div>

      {/* Permissions Grid */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4 text-brand-400" />
          Access Permissions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-900 flex gap-3">
            <Key className="w-4.5 h-4.5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-slate-350">Upload & Parse</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                Upload resumes in PDF or Word format, converting them to clean JSON structures.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-900 flex gap-3">
            <Settings className="w-4.5 h-4.5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-slate-350">Compare & Score</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                Perform standalone analyses and map skill gaps against job requirements.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-900 flex gap-3">
            <Star className="w-4.5 h-4.5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-slate-350">Version Control</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                Duplicate, edit, and keep history of multiple customized resume versions.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-900 flex gap-3">
            <Info className="w-4.5 h-4.5 text-slate-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-xs text-slate-350">Admin dashboard</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                {user?.role === 'ADMIN' 
                  ? 'Access overall system usage, check user totals, and monitor active AI models.' 
                  : 'Access restricted. Administrator role required.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
