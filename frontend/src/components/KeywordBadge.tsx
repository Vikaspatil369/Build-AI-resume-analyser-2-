import React from 'react';

interface KeywordBadgeProps {
  keyword: string;
  status: 'Found' | 'Partial' | 'Missing';
  resumeFrequency: number;
  jdFrequency: number;
  importance?: 'High' | 'Medium' | 'Low';
  className?: string;
}

const KeywordBadge: React.FC<KeywordBadgeProps> = ({
  keyword,
  status,
  resumeFrequency,
  jdFrequency,
  importance,
  className = '',
}) => {
  let statusClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
  if (status === 'Partial') {
    statusClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (status === 'Missing') {
    statusClass = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }

  return (
    <div className={`flex flex-col gap-1 p-3 rounded-xl border glass-card hover:translate-y-[-1px] ${className}`}>
      <div className="flex justify-between items-start gap-2">
        <span className="font-bold text-sm text-slate-100 tracking-wide">{keyword}</span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusClass}`}>
          {status}
        </span>
      </div>
      
      <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
        <span>Freq in Resume: <strong className="text-slate-200">{resumeFrequency}</strong></span>
        <span>JD Freq: <strong className="text-slate-200">{jdFrequency}</strong></span>
      </div>

      {importance && (
        <div className="text-[10px] text-slate-500 font-medium mt-0.5">
          Priority: <span className={`font-semibold ${
            importance === 'High' ? 'text-rose-400' :
            importance === 'Medium' ? 'text-amber-400' :
            'text-slate-400'
          }`}>{importance}</span>
        </div>
      )}
    </div>
  );
};

export default KeywordBadge;
