import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  className = '',
}) => {
  return (
    <div className={`w-full py-16 flex flex-col items-center justify-center text-center ${className}`}>
      <div className="relative">
        {/* Decorative background glow */}
        <div className="absolute inset-0 bg-brand-500/10 blur-xl rounded-full scale-150 animate-pulse" />
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin relative z-10" />
      </div>
      <h4 className="font-bold text-slate-300 text-sm tracking-wide mt-4">{message}</h4>
      <p className="text-xs text-slate-500 mt-1 max-w-[200px] leading-relaxed">
        Connecting to resume analysis service.
      </p>
    </div>
  );
};

export default LoadingState;
