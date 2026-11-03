import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { listAllResumes, getResume } from '../api/resumes';
import { createJobDescription } from '../api/jobs';
import { queueMatchedAnalysis } from '../api/analysis';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Briefcase, ArrowRight, RefreshCw, FileText, AlertCircle } from 'lucide-react';

const JobAnalysis: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form State
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load user's resumes
  const { data: resumesResponse, isLoading: isLoadingResumes, error: resumesError } = useQuery({
    queryKey: ['resumesListForJob'],
    queryFn: async () => {
      const response = await listAllResumes();
      return response.data;
    }
  });

  // Load versions for selected resume
  const { data: versionsResponse, isLoading: isLoadingVersions } = useQuery({
    queryKey: ['resumeVersionsForJob', selectedResumeId],
    queryFn: async () => {
      const response = await getResume(selectedResumeId);
      return response.data.versions || [];
    },
    enabled: !!selectedResumeId
  });

  const resumes = resumesResponse || [];
  const versions = versionsResponse || [];

  // Auto select first resume if none selected
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  // Auto select version when resume changes
  useEffect(() => {
    if (versions.length > 0) {
      setSelectedVersionId(versions[0].id);
    } else {
      setSelectedVersionId('');
    }
  }, [versions]);

  // Combined mutation to submit job + match analysis
  const matchMutation = useMutation({
    mutationFn: async () => {
      if (!selectedVersionId || !jobTitle || !rawText) {
        throw new Error('Please select a resume version and fill in the job description.');
      }
      
      // Step 1: Save job description
      const jobResponse = await createJobDescription({
        title: jobTitle,
        company: company || undefined,
        rawText
      });

      if (!jobResponse.success || !jobResponse.data) {
        throw new Error(jobResponse.message || 'Failed to parse job description');
      }

      const jobId = jobResponse.data.id;

      // Step 2: Queue matched analysis
      const analysisResponse = await queueMatchedAnalysis(selectedVersionId, jobId);
      return analysisResponse.data;
    },
    onSuccess: (analysis) => {
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['analysisHistory'] });
      if (analysis) {
        navigate(`/analysis/${analysis.id}`);
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to match resume. Please try again.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    matchMutation.mutate();
  };

  if (isLoadingResumes) {
    return <LoadingState message="Connecting to your resume vaults..." />;
  }

  if (resumesError) {
    return <ErrorState message="Could not fetch resumes list." />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto w-full">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black text-slate-100 font-sans tracking-wide">Job Matching</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          Paste a target job description and map your resume version against it.
        </p>
      </div>

      {resumes.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center flex flex-col items-center">
          <FileText className="w-10 h-10 text-slate-500 mb-3" />
          <h3 className="font-bold text-slate-200 text-sm">No Resumes Available</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px] leading-relaxed">
            You must upload at least one resume before comparing it against a job description.
          </p>
          <button
            onClick={() => navigate('/resumes/upload')}
            className="glass-btn-primary py-2 px-5 rounded-lg text-xs font-semibold mt-5"
          >
            Upload Resume
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Select Resume and Version */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <FileText className="w-4 h-4 text-brand-400" />
              1. Select Resume Version
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select Resume</label>
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  className="glass-input text-xs py-2.5 px-3 bg-slate-950 border border-slate-800"
                  required
                >
                  <option value="">-- Choose Resume --</option>
                  {resumes.map(r => (
                    <option key={r.id} value={r.id}>{r.filename}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Select Version</label>
                <select
                  value={selectedVersionId}
                  onChange={(e) => setSelectedVersionId(e.target.value)}
                  disabled={!selectedResumeId || isLoadingVersions}
                  className="glass-input text-xs py-2.5 px-3 bg-slate-950 border border-slate-800"
                  required
                >
                  <option value="">-- Choose Version --</option>
                  {versions.map(v => (
                    <option key={v.id} value={v.id}>
                      v{v.versionNumber}: {v.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Paste Job Description Details */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Briefcase className="w-4 h-4 text-brand-400" />
              2. Target Job Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Engineer"
                  className="glass-input text-xs py-2.5"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Company Name (Optional)</label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Global Tech Solutions"
                  className="glass-input text-xs py-2.5"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mt-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Job Description Text</label>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the target job description requirements, responsibilities, and qualifications here..."
                rows={10}
                className="glass-input text-xs py-2.5 resize-none leading-relaxed"
                required
              />
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={matchMutation.isPending || !selectedVersionId || !jobTitle || !rawText}
            className="glass-btn-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow"
          >
            {matchMutation.isPending ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing AI Matching & Analysis...
              </>
            ) : (
              <>
                Compare and Analyze Match
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

export default JobAnalysis;
