import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getAnalysis, downloadAnalysisReport } from '../api/analysis';
import ScoreCard from '../components/ScoreCard';
import ProgressBar from '../components/ProgressBar';
import JobMatchCard from '../components/JobMatchCard';
import KeywordBadge from '../components/KeywordBadge';
import IssueCard from '../components/IssueCard';
import RecommendationCard from '../components/RecommendationCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { 
  Briefcase, Award, CheckCircle2, AlertCircle, Sparkles, RefreshCw, ArrowLeft, FileEdit, Download, Loader2 
} from 'lucide-react';

const AnalysisResult: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'ats' | 'job' | 'suggestions'>('ats');
  const [downloading, setDownloading] = useState(false);

  const handleDownloadReport = async () => {
    if (!id || !data) return;
    try {
      setDownloading(true);
      const safeName = (data.resumeName || 'Resume').replace(/\.[^/.]+$/, '');
      await downloadAnalysisReport(id, `${safeName}_ATS_Audit.pdf`);
    } catch (err) {
      console.error('Failed to download PDF report:', err);
      alert('Unable to download PDF report. Please verify your connection and try again.');
    } finally {
      setDownloading(false);
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analysisResult', id],
    queryFn: async () => {
      const response = await getAnalysis(id!);
      return response.data;
    },
    // Poll the API if the status is PENDING or PROCESSING (TanStack Query refetchInterval)
    refetchInterval: (query) => {
      const analysis = query.state.data;
      if (analysis && (analysis.status === 'PENDING' || analysis.status === 'PROCESSING')) {
        return 3000; // poll every 3 seconds
      }
      return false; // stop polling once completed/failed
    },
    enabled: !!id
  });

  if (isLoading) {
    return <LoadingState message="Extracting metrics and running AI analysis..." />;
  }

  if (error || !data) {
    return <ErrorState onRetry={refetch} message="Could not load analysis details." />;
  }

  const analysis = data;

  if (analysis.status === 'PENDING' || analysis.status === 'PROCESSING') {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center text-center max-w-md mx-auto py-16">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-brand-500/10 blur-xl rounded-full scale-150 animate-pulse" />
          <RefreshCw className="w-10 h-10 text-brand-400 animate-spin relative z-10" />
        </div>
        <h3 className="font-bold text-slate-100 text-lg tracking-wide">Analysis is in progress</h3>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          The AI engine is currently mapping your resume against ATS structures, matching keywords, identifying skill gaps, and generating personalized recommendations. This takes about 10-15 seconds...
        </p>
        <span className="text-[10px] text-slate-500 font-bold uppercase mt-6 tracking-widest bg-slate-900 border border-slate-800 px-3 py-1 rounded-full">
          Status: {analysis.status}
        </span>
      </div>
    );
  }

  if (analysis.status === 'FAILED') {
    return (
      <ErrorState 
        onRetry={refetch} 
        title="Analysis Failed" 
        message={analysis.errorMessage || "The AI analyzer encountered an error. Please try running it again."} 
      />
    );
  }

  // Parse JSON node lists safely
  const sectionScores = Array.isArray(analysis.sectionScores) ? analysis.sectionScores : [];
  const keywords = Array.isArray(analysis.keywordAnalysis) ? analysis.keywordAnalysis : [];
  const skillGaps = Array.isArray(analysis.skillGap) ? analysis.skillGap : [];
  const formattingIssues = Array.isArray(analysis.formattingIssues) ? analysis.formattingIssues : [];
  const grammarIssues = Array.isArray(analysis.grammarAnalysis) ? analysis.grammarAnalysis : [];
  const improvements = Array.isArray(analysis.improvements) ? analysis.improvements : [];
  const roles = Array.isArray(analysis.roleRecommendations) ? analysis.roleRecommendations : [];

  // Filter skills for JobMatchCard
  const matchedSkills = skillGaps.filter(s => s.level === 'STRONG').map(s => s.skill);
  const partialSkills = skillGaps.filter(s => s.level === 'MODERATE').map(s => s.skill);
  const missingSkills = skillGaps.filter(s => s.level === 'MISSING').map(s => s.skill);

  return (
    <div className="flex flex-col gap-6">
      {/* Title Header */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-semibold self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </button>

        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-brand-400 tracking-wider">Analysis complete</span>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-100 font-sans tracking-wide">
                Analysis Results
              </h1>
              <span className="text-xs text-slate-500 font-bold bg-slate-900 border border-slate-800/80 px-2 py-0.5 rounded">
                v{analysis.versionNumber}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Resume: <strong className="text-slate-200">{analysis.resumeName}</strong> 
              {analysis.jobTitle && <> • Job: <strong className="text-slate-200">{analysis.jobTitle} ({analysis.jobCompany})</strong></>}
            </p>
          </div>

          <button
            onClick={handleDownloadReport}
            disabled={downloading || analysis.status !== 'COMPLETED'}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Report (PDF)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main ATS & Job Score Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ScoreCard
          score={analysis.atsScore || 0}
          title="Overall ATS Score"
          subtitle="Score range 0 - 100"
          description="Calculated based on keywords, structure, formatting, achievements, and contact links."
        />
        
        {analysis.jobMatchScore !== null ? (
          <ScoreCard
            score={analysis.jobMatchScore || 0}
            title="Job Match Compatibility"
            subtitle="Calculated against pasted description"
            description="Measures how well your skills, experience, and title align with this specific role."
          />
        ) : (
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center border-dashed border-slate-800">
            <h4 className="font-bold text-slate-300 text-sm tracking-wide flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-slate-500" />
              Not Matched Against a Job
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              This analysis was run stand-alone. Paste a job description to map skill gaps and check job compatibility.
            </p>
            <button
              onClick={() => navigate('/jobs')}
              className="glass-btn-secondary text-[11px] py-1.5 px-3.5 rounded-lg self-start mt-4 font-bold"
            >
              Match Against Job
            </button>
          </div>
        )}
      </div>

      {/* Layout Tabs navigation */}
      <div className="flex border-b border-slate-900 gap-1 overflow-x-auto">
        <button
          onClick={() => setActiveTab('ats')}
          className={`pb-3.5 px-4 text-xs font-bold border-b-2 uppercase tracking-wide transition-all whitespace-nowrap ${
            activeTab === 'ats' 
              ? 'border-brand-500 text-slate-100' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          ATS Checks & Layout
        </button>

        <button
          onClick={() => setActiveTab('job')}
          className={`pb-3.5 px-4 text-xs font-bold border-b-2 uppercase tracking-wide transition-all whitespace-nowrap ${
            activeTab === 'job' 
              ? 'border-brand-500 text-slate-100' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          Skills & Keywords
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`pb-3.5 px-4 text-xs font-bold border-b-2 uppercase tracking-wide transition-all whitespace-nowrap ${
            activeTab === 'suggestions' 
              ? 'border-brand-500 text-slate-100' 
              : 'border-transparent text-slate-500 hover:text-slate-300'
          }`}
        >
          AI Suggestions & Improvement
        </button>
      </div>

      {/* Tabs panels */}
      <div className="flex flex-col gap-6">
        {activeTab === 'ats' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ATS Score Categories list */}
            <div className="glass-panel rounded-2xl p-6 lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-2">Scoring Breakdown</h3>
              <div className="flex flex-col gap-4">
                {sectionScores.map((sec, index) => (
                  <div key={index} className="flex flex-col gap-1 border-b border-slate-900/60 pb-3 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-300 font-bold">{sec.category}</span>
                      <span className="text-brand-400 font-bold">{sec.score}/{sec.maxScore}</span>
                    </div>
                    <ProgressBar value={sec.score} max={sec.maxScore} size="sm" className="mt-1" />
                    <p className="text-[10px] text-slate-500 leading-normal mt-1">{sec.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Layout formatting and Contact Checks */}
            <div className="flex flex-col gap-6 lg:col-span-1">
              {/* Formatting Issues */}
              <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-brand-400" />
                  ATS Formatting Checks
                </h3>
                <div className="flex flex-col gap-3">
                  {formattingIssues.map((issue, index) => (
                    <IssueCard
                      key={index}
                      type={issue.type}
                      title={issue.title}
                      suggestion={issue.suggestion}
                    />
                  ))}
                </div>
              </div>

              {/* Role Suitability recommendations */}
              {roles.length > 0 && (
                <div className="glass-panel rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    Recommended Roles
                  </h3>
                  <div className="flex flex-col gap-3">
                    {roles.map((roleRec, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex justify-between items-center gap-3">
                        <div>
                          <span className="text-xs font-bold text-slate-200 block">{roleRec.role}</span>
                          <span className="text-[9px] text-slate-500 block leading-normal mt-0.5">{roleRec.reason}</span>
                        </div>
                        <span className="text-xs font-black text-brand-400 bg-brand-500/5 px-2 py-0.5 rounded border border-brand-500/10">
                          {roleRec.matchPercentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'job' && (
          <div className="flex flex-col gap-6">
            {/* Job Match Skills breakdown (Rendered only if matched) */}
            {analysis.jobMatchScore !== null && (
              <JobMatchCard
                matchScore={analysis.jobMatchScore || 0}
                jobTitle={analysis.jobTitle || 'Unknown Role'}
                company={analysis.jobCompany}
                matchedSkills={matchedSkills}
                partialSkills={partialSkills}
                missingSkills={missingSkills}
              />
            )}

            {/* Keyword frequency analysis */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4">
                Keyword Frequency Analyzer
              </h3>
              
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded-xl mb-6 text-xs flex items-start gap-2.5 max-w-2xl">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong>Notice on Optimization:</strong> Only add a keyword if it accurately represents your real experience. Avoid keyword stuffing, as human recruiters scan for contextual evidence during interviews.
                </p>
              </div>

              {keywords.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No keywords data generated.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {keywords.map((kw, index) => (
                    <KeywordBadge
                      key={index}
                      keyword={kw.keyword}
                      status={kw.status}
                      resumeFrequency={kw.resumeFrequency}
                      jdFrequency={kw.jdFrequency}
                      importance={kw.importance}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Improvement Suggestions list */}
            <div className="glass-panel rounded-2xl p-6 lg:col-span-2 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4.5 h-4.5 text-brand-400" />
                Actionable Resume Improvements
              </h3>

              <div className="p-3.5 bg-slate-950 border border-slate-900 rounded-xl text-xs text-slate-400 leading-relaxed mb-2">
                These suggestions are generated using AI-powered analysis of your experiences and formatting layout. 
                They focus on strengthening verbs, highlighting quantifiable accomplishments, and refining descriptions without adding fabricated statements.
              </div>

              {improvements.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No improvement suggestions found for this version.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {improvements.map((imp, idx) => (
                    <RecommendationCard
                      key={idx}
                      section={imp.section}
                      suggestion={imp.suggestion}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Grammar Check and Bullet improvements */}
            <div className="glass-panel rounded-2xl p-5 lg:col-span-1 flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <FileEdit className="w-4 h-4 text-brand-400" />
                Grammar & Verbs Checker
              </h3>
              
              {grammarIssues.length === 0 ? (
                <div className="py-6 flex flex-col items-center justify-center text-center text-xs text-slate-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/20 mb-2" />
                  No grammar or verb issues detected. Excellent spelling and professional language!
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {grammarIssues.map((gr, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-800 bg-slate-950/40 text-xs">
                      <div className="flex flex-col gap-1 pb-2 mb-2 border-b border-slate-900">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Original Bullet</span>
                        <p className="text-rose-400/90 italic">"{gr.original}"</p>
                      </div>

                      <div className="flex flex-col gap-1 pb-2 mb-2 border-b border-slate-900">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Suggested Correction</span>
                        <p className="text-emerald-400 font-bold">"{gr.suggested}"</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Analysis / Reason</span>
                        <p className="text-slate-300 leading-normal mt-0.5">{gr.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResult;
