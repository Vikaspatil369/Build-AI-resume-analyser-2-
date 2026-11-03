import React from 'react';

interface ProgressBarProps {
  value: number;
  max?: number;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  showText = false,
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  // Color selection based on percentage (Premium SaaS colors)
  let colorClass = 'from-rose-500 to-red-500 shadow-rose-500/20'; // < 50
  if (percentage >= 50 && percentage < 70) {
    colorClass = 'from-amber-500 to-orange-500 shadow-amber-500/20';
  } else if (percentage >= 70 && percentage < 85) {
    colorClass = 'from-blue-500 to-brand-500 shadow-brand-500/20';
  } else if (percentage >= 85) {
    colorClass = 'from-emerald-500 to-teal-500 shadow-emerald-500/20';
  }

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-3',
    lg: 'h-5',
  };

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm font-medium text-slate-400">Progress</span>
          <span className="text-sm font-bold text-slate-200">{percentage}%</span>
        </div>
      )}
      <div className="w-full bg-slate-800 rounded-full overflow-hidden p-[1px] border border-slate-700/50">
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-r ${colorClass} shadow-lg transition-all duration-1000 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
