import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface IssueCardProps {
  type: 'CRITICAL' | 'WARNING' | 'GOOD';
  title: string;
  suggestion: string;
  className?: string;
}

const IssueCard: React.FC<IssueCardProps> = ({
  type,
  title,
  suggestion,
  className = '',
}) => {
  let containerClass = 'bg-rose-500/10 border-rose-500/20 text-rose-300';
  let Icon = AlertCircle;
  let label = 'Critical Issue';

  if (type === 'WARNING') {
    containerClass = 'bg-amber-500/10 border-amber-500/20 text-amber-300';
    Icon = AlertTriangle;
    label = 'Warning';
  } else if (type === 'GOOD') {
    containerClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300';
    Icon = CheckCircle2;
    label = 'Good Practice';
  }

  return (
    <div className={`p-4 rounded-xl border flex gap-3.5 items-start ${containerClass} ${className}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-grow">
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider opacity-85">{label}</span>
        </div>
        <h4 className="font-bold text-sm text-slate-100 tracking-wide mt-0.5">{title}</h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{suggestion}</p>
      </div>
    </div>
  );
};

export default IssueCard;
