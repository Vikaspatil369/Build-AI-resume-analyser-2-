import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getResume, duplicateVersion } from '../api/resumes';
import { queueStandaloneAnalysis } from '../api/analysis';
import ResumeSectionCard from '../components/ResumeSectionCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { 
  Copy, Play, ArrowLeft, RefreshCw, GitBranch, Columns 
} from 'lucide-react';

const ResumeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [dupName, setDupName] = useState('');
  const [showDupModal, setShowDupModal] = useState<string | null>(null); // holds version ID to duplicate
  const [compareVersionId, setCompareVersionId] = useState<string>(''); // holds version ID to compare with selected

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['resumeDetail', id],
    queryFn: async () => {
      const response = await getResume(id!);
      return response.data;
    },
    enabled: !!id
  });

  const duplicateMutation = useMutation({
    mutationFn: async ({ versionId, name }: { versionId: string; name: string }) => {
      const response = await duplicateVersion(versionId, name);
      return response.data;
    },
    onSuccess: (newVer) => {
      queryClient.invalidateQueries({ queryKey: ['resumeDetail', id] });
      setShowDupModal(null);
      setDupName('');
      if (newVer) {
        setSelectedVersionId(newVer.id);
      }
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (versionId: string) => {
      const response = await queueStandaloneAnalysis(versionId);
      return response.data;
    },
    onSuccess: (analysis) => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      if (analysis) {
        navigate(`/analysis/${analysis.id}`);
      }
    }
  });

  if (isLoading) {
    return <LoadingState message="Fetching resume history and structures..." />;
  }

  if (error || !data) {
    return <ErrorState onRetry={refetch} message="Could not fetch resume details." />;
  }

  const resume = data;
  const versions = resume.versions || [];
  
  // Set default selected version to latest if not set
  const currentVersion = selectedVersionId 
    ? versions.find(v => v.id === selectedVersionId) 
    : versions[0];

  const compareVersion = compareVersionId
    ? versions.find(v => v.id === compareVersionId)
    : null;

  const handleDuplicate = (versionId: string) => {
    if (!dupName.trim()) return;
    duplicateMutation.mutate({ versionId, name: dupName.trim() });
  };

  const handleAnalyze = (versionId: string) => {
    analyzeMutation.mutate(versionId);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation header */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate('/resumes')}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-semibold self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Resumes
        </button>

        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-100 font-sans tracking-wide truncate max-w-[300px] md:max-w-[450px]">
                {resume.filename}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-900 border-slate-800 text-slate-400">
                {resume.fileType}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Select versions to view parsed text structure, run standalone analysis, or compare changes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAnalyze(currentVersion?.id || '')}
              disabled={analyzeMutation.isPending || !currentVersion}
              className="glass-btn-primary text-xs font-bold py-2.5 px-4 flex items-center gap-1.5 shadow"
            >
              {analyzeMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              Analyze Version
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left sidebar for version history, right panel for parsed structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Versions List & Actions */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Version Selector List */}
          <div className="glass-panel rounded-2xl p-5">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-brand-400" />
              Version History
            </h3>
            
            <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto">
              {versions.map((ver) => {
                const isSelected = currentVersion?.id === ver.id;
                const isCompared = compareVersionId === ver.id;
                return (
                  <div
                    key={ver.id}
                    onClick={() => {
                      setSelectedVersionId(ver.id);
                      if (compareVersionId === ver.id) setCompareVersionId('');
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-brand-500 bg-brand-500/5 shadow' 
                        : isCompared 
                        ? 'border-emerald-500 bg-emerald-500/5' 
                        : 'border-slate-800 hover:border-slate-700 bg-slate-900/10'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block truncate max-w-[150px]">
                          {ver.name}
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 block">
                          v{ver.versionNumber} • {new Date(ver.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => setShowDupModal(ver.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded border border-transparent hover:border-slate-700/50"
                          title="Duplicate version"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleAnalyze(ver.id)}
                          disabled={analyzeMutation.isPending}
                          className="p-1.5 text-brand-400 hover:text-brand-300 hover:bg-brand-500/5 rounded border border-transparent hover:border-brand-500/10"
                          title="Run ATS Analysis"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Version Comparison Selector */}
          {versions.length > 1 && (
            <div className="glass-panel rounded-2xl p-5">
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Columns className="w-4 h-4 text-emerald-400" />
                Compare Versions
              </h3>
              
              <p className="text-[11px] text-slate-500 leading-normal mb-4">
                Choose another version to see parsed structural comparison side-by-side.
              </p>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Selected</label>
                  <div className="py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-brand-400">
                    v{currentVersion?.versionNumber}: {currentVersion?.name}
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Compare With</label>
                  <select
                    value={compareVersionId}
                    onChange={(e) => setCompareVersionId(e.target.value)}
                    className="glass-input text-xs py-2 px-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  >
                    <option value="">-- Choose Version --</option>
                    {versions
                      .filter(v => v.id !== currentVersion?.id)
                      .map(v => (
                        <option key={v.id} value={v.id}>
                          v{v.versionNumber}: {v.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Parsed Section Viewer (Side-by-Side Comparison support) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {compareVersion ? (
            /* Comparison Side-by-Side view */
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <h3 className="text-base font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                  Comparing Parsed Structures
                </h3>
                <button
                  onClick={() => setCompareVersionId('')}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-300 underline"
                >
                  Exit Comparison
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="p-3 bg-brand-500/10 border border-brand-500/20 text-brand-300 rounded-xl mb-3 text-xs font-bold">
                    Active: {currentVersion?.name} (v{currentVersion?.versionNumber})
                  </div>
                  {currentVersion && <ResumeSectionCard resumeData={currentVersion.parsedContent} />}
                </div>

                <div>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl mb-3 text-xs font-bold">
                    Comparing: {compareVersion.name} (v{compareVersion.versionNumber})
                  </div>
                  <ResumeSectionCard resumeData={compareVersion.parsedContent} />
                </div>
              </div>
            </div>
          ) : (
            /* Standard single-version view */
            currentVersion && (
              <div className="flex flex-col gap-4">
                <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500">Currently selected structure</span>
                    <h3 className="text-sm font-bold text-slate-200 mt-0.5">{currentVersion.name}</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-bold bg-slate-950 px-2 py-0.5 border border-slate-900 rounded">
                    v{currentVersion.versionNumber}
                  </span>
                </div>
                
                <ResumeSectionCard resumeData={currentVersion.parsedContent} />
              </div>
            )
          )}
        </div>
      </div>

      {/* Duplicate Version Modal */}
      {showDupModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-[360px] rounded-2xl p-6 border border-slate-800 shadow-2xl animate-scale-up">
            <h3 className="text-base font-bold text-slate-100 mb-2">Duplicate Resume Version</h3>
            <p className="text-xs text-slate-400 leading-normal mb-4">
              Create a new copy of this resume version to customize it or run targeted optimizations.
            </p>

            <div className="flex flex-col gap-1.5 mb-5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">New Version Name</label>
              <input
                type="text"
                value={dupName}
                onChange={(e) => setDupName(e.target.value)}
                placeholder="e.g., Backend Optimized v2"
                className="glass-input text-xs py-2 px-3 w-full"
                required
              />
            </div>

            <div className="flex justify-end gap-2 text-xs font-semibold">
              <button
                onClick={() => {
                  setShowDupModal(null);
                  setDupName('');
                }}
                className="glass-btn-secondary py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDuplicate(showDupModal)}
                disabled={duplicateMutation.isPending || !dupName.trim()}
                className="glass-btn-primary py-2 px-4 rounded-lg flex items-center gap-1.5"
              >
                {duplicateMutation.isPending && <RefreshCw className="w-3 animate-spin" />}
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeDetail;
