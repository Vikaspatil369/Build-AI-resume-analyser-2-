import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface RecommendationCardProps {
  section: string;
  suggestion: string;
  className?: string;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  section,
  suggestion,
  className = '',
}) => {
  return (
    <div className={`glass-card rounded-xl p-4 flex gap-3.5 items-start ${className}`}>
      <div className="bg-brand-500/10 p-2 rounded-lg border border-brand-500/20 text-brand-400 flex-shrink-0">
        <Sparkles className="w-4 h-4" />
      </div>
      
      <div className="flex-grow">
        <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Improve {section}</span>
        <h4 className="font-bold text-sm text-slate-100 tracking-wide mt-0.5 flex items-center gap-1.5">
          Actionable Suggestion
          <ArrowRight className="w-3 h-3 text-slate-500" />
        </h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{suggestion}</p>
      </div>
    </div>
  );
};

export default RecommendationCard;
