import React from 'react';

interface SkillBadgeProps {
  skill: string;
  level?: 'STRONG' | 'MODERATE' | 'MISSING';
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  className?: string;
}

const SkillBadge: React.FC<SkillBadgeProps> = ({
  skill,
  level = 'STRONG',
  priority,
  className = '',
}) => {
  let badgeClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  
  if (level === 'MODERATE') {
    badgeClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (level === 'MISSING') {
    badgeClass = 'bg-slate-900 text-slate-400 border-slate-800';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold tracking-wide shadow-sm font-sans ${badgeClass} ${className}`}>
      {skill}
      {priority && (
        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase leading-none ${
          priority === 'HIGH' ? 'bg-red-500/20 text-red-300' :
          priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-300' :
          'bg-slate-800 text-slate-400'
        }`}>
          {priority}
        </span>
      )}
    </span>
  );
};

export default SkillBadge;
