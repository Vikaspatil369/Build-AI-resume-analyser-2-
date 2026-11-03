import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { uploadResume } from '../api/resumes';
import { queueStandaloneAnalysis } from '../api/analysis';
import UploadZone from '../components/UploadZone';
import { FileText, ArrowLeft } from 'lucide-react';

const ResumeUpload: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const response = await uploadResume(file);
      const resume = response.data;
      if (resume && resume.latestVersionId) {
        try {
          const analysisRes = await queueStandaloneAnalysis(resume.latestVersionId);
          return { resume, analysisId: analysisRes.data?.id };
        } catch (analysisErr) {
          console.warn('Auto-analysis start skipped:', analysisErr);
        }
      }
      return { resume, analysisId: null };
    },
    onSuccess: ({ resume, analysisId }) => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      queryClient.invalidateQueries({ queryKey: ['analysisHistory'] });
      if (analysisId) {
        navigate(`/analysis/${analysisId}`);
      } else if (resume && resume.id) {
        navigate(`/resumes/${resume.id}`);
      } else {
        navigate('/resumes');
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || err.message || 'Failed to upload and parse resume. Please try again.');
    }
  });

  const handleFileSelect = (file: File) => {
    setError(null);
    mutate(file);
  };

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto w-full">
      {/* Navigation and Title */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 text-xs font-semibold self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <div>
          <h1 className="text-2xl font-black text-slate-100 font-sans tracking-wide">Upload Resume</h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Parse your resume to extract structured skills and experiences.</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/10 flex gap-4 items-start">
        <div className="bg-brand-500/10 p-2 rounded-xl text-brand-400 border border-brand-500/15 flex-shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-slate-200">How it works</h4>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Our AI engine extracts personal details, skills, experiences, and academic history from your PDF/DOCX resume, converting it into a clean ATS-friendly profile.
          </p>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <UploadZone
        onFileSelect={handleFileSelect}
        isUploading={isPending}
        error={error}
      />
    </div>
  );
};

export default ResumeUpload;
