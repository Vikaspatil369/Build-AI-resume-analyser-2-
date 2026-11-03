import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message = 'Failed to load details. Please verify your connection and try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`w-full py-16 flex flex-col items-center justify-center text-center px-4 ${className}`}>
      <div className="bg-rose-500/10 p-3.5 rounded-2xl border border-rose-500/20 text-rose-400 mb-4 shadow-lg shadow-rose-500/5">
        <AlertCircle className="w-6 h-6" />
      </div>
      
      <h3 className="font-bold text-slate-100 text-base tracking-wide">{title}</h3>
      <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed">{message}</p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="glass-btn-secondary py-2 px-4 rounded-lg text-xs font-semibold mt-5 flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
