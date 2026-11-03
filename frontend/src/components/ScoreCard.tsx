import React from 'react';

interface ScoreCardProps {
  score: number;
  maxScore?: number;
  title: string;
  subtitle?: string;
  description?: string;
  className?: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  maxScore = 100,
  title,
  subtitle,
  description,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));
  
  // Dynamic color matching
  let textClass = 'text-rose-500';
  let strokeClass = 'stroke-rose-500';
  let bgClass = 'bg-rose-500/10 border-rose-500/20';
  
  if (percentage >= 50 && percentage < 70) {
    textClass = 'text-amber-500';
    strokeClass = 'stroke-amber-500';
    bgClass = 'bg-amber-500/10 border-amber-500/20';
  } else if (percentage >= 70 && percentage < 85) {
    textClass = 'text-brand-400';
    strokeClass = 'stroke-brand-500';
    bgClass = 'bg-brand-500/10 border-brand-500/20';
  } else if (percentage >= 85) {
    textClass = 'text-emerald-400';
    strokeClass = 'stroke-emerald-500';
    bgClass = 'bg-emerald-500/10 border-emerald-500/20';
  }

  // Circular calculations
  const radius = 50;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`glass-card rounded-2xl p-6 flex items-center gap-6 ${className}`}>
      {/* SVG Circular Score Gauge */}
      <div className="relative flex-shrink-0" style={{ width: radius * 2, height: radius * 2 }}>
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            className="stroke-slate-800"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Foreground progress ring */}
          <circle
            className={`${strokeClass} transition-all duration-1000 ease-out`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        {/* Core Value Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-black font-sans leading-none ${textClass}`}>{score}</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">/{maxScore}</span>
        </div>
      </div>

      <div className="flex-grow">
        <h3 className="text-lg font-bold text-slate-100 font-sans tracking-wide leading-snug">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 font-medium mt-0.5">{subtitle}</p>}
        {description && (
          <div className={`mt-2 py-1 px-2.5 rounded-lg border text-xs text-slate-300 font-sans leading-relaxed ${bgClass}`}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreCard;
