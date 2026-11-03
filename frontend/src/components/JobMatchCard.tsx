import React from 'react';
import { Check, AlertCircle, X, Briefcase } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface JobMatchCardProps {
  matchScore: number;
  jobTitle: string;
  company?: string;
  matchedSkills: string[];
  partialSkills: string[];
  missingSkills: string[];
  className?: string;
}

const JobMatchCard: React.FC<JobMatchCardProps> = ({
  matchScore,
  jobTitle,
  company,
  matchedSkills = [],
  partialSkills = [],
  missingSkills = [],
  className = '',
}) => {
  return (
    <div className={`glass-card rounded-2xl p-6 ${className}`}>
      {/* Header Info */}
      <div className="flex justify-between items-start flex-wrap gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Job Compatibility</span>
          <h3 className="text-lg font-bold text-slate-100 mt-0.5 flex items-center gap-1.5">
            <Briefcase className="w-5 h-5 text-slate-400" />
            {jobTitle}
          </h3>
          {company && <p className="text-xs text-slate-400 font-semibold">{company}</p>}
        </div>
        
        <div className="text-right">
          <span className="text-3xl font-black text-brand-400 leading-none">{matchScore}%</span>
          <span className="text-[10px] text-slate-500 font-bold block uppercase mt-0.5">Match Score</span>
        </div>
      </div>

      {/* Progress Bar Gauge */}
      <div className="mb-6">
        <ProgressBar value={matchScore} />
      </div>

      {/* Skill Mapping Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Matched (Exact Match) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-1.5">
            <Check className="w-4 h-4 bg-emerald-500/10 p-0.5 rounded border border-emerald-500/20" />
            Matched Skills ({matchedSkills.length})
          </h4>
          {matchedSkills.length === 0 ? (
            <p className="text-xs text-slate-500 italic">None detected</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {matchedSkills.map((skill, index) => (
                <div key={index} className="text-xs text-slate-300 py-1 px-2 bg-slate-900/60 rounded border border-emerald-500/10 truncate">
                  ✓ {skill}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Partially Matched (Semantic Match) */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 bg-amber-500/10 p-0.5 rounded border border-amber-500/20" />
            Partially Matched ({partialSkills.length})
          </h4>
          {partialSkills.length === 0 ? (
            <p className="text-xs text-slate-500 italic">None detected</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {partialSkills.map((skill, index) => (
                <div key={index} className="text-xs text-slate-300 py-1 px-2 bg-slate-900/60 rounded border border-amber-500/10 truncate">
                  ⚠ {skill}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Missing Skills */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
            <X className="w-4 h-4 bg-rose-500/10 p-0.5 rounded border border-rose-500/20" />
            Missing Skills ({missingSkills.length})
          </h4>
          {missingSkills.length === 0 ? (
            <p className="text-xs text-slate-500 italic">None detected</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {missingSkills.map((skill, index) => (
                <div key={index} className="text-xs text-slate-300 py-1 px-2 bg-slate-900/60 rounded border border-rose-500/10 truncate">
                  ✗ {skill}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatchCard;
