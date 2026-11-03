import React from 'react';
import { HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = HelpCircle,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div className={`w-full py-16 flex flex-col items-center justify-center text-center px-4 ${className}`}>
      <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-slate-500 mb-4 hover:text-slate-400">
        <Icon className="w-8 h-8" />
      </div>
      
      <h3 className="font-bold text-slate-200 text-base tracking-wide">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed">{message}</p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="glass-btn-primary py-2 px-5 rounded-lg text-xs font-semibold mt-6 shadow-md"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
