import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { getAnalysisHistory, downloadAnalysisReport } from '../api/analysis';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { FileText, Search, History as HistoryIcon, Briefcase, Download, Loader2 } from 'lucide-react';

const History: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string, resumeName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloadingId(id);
      const safeName = (resumeName || 'Resume').replace(/\.[^/.]+$/, '');
      await downloadAnalysisReport(id, `${safeName}_ATS_Audit.pdf`);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      alert('Could not download PDF report.');
    } finally {
      setDownloadingId(null);
    }
  };

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['analysisHistory'],
    queryFn: async () => {
      const response = await getAnalysisHistory();
      return response.data;
    }
  });

  if (isLoading) {
    return <LoadingState message="Retrieving your past analysis records..." />;
  }

  if (error) {
    return <ErrorState onRetry={refetch} message="Could not fetch analysis history." />;
  }

  const history = data || [];

  const filteredHistory = history.filter(analysis => 
    analysis.resumeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (analysis.jobTitle && analysis.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-100 font-sans tracking-wide">Analysis History</h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">View and inspect your historical ATS scoring and match details.</p>
      </div>

      {history.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No History Found"
          message="You haven't run any resume analyses yet. Upload a resume and trigger analysis to populate records."
          actionLabel="Go to Dashboard"
          onAction={() => navigate('/dashboard')}
        />
      ) : (
        <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
          {/* Search bar */}
          <div className="relative max-w-md w-full mb-2">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by resume name or job title..."
              className="glass-input w-full pl-10 text-xs py-2.5"
            />
          </div>

          {/* Table display */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500 uppercase font-bold">
                  <th className="pb-3 pl-4">Resume Version</th>
                  <th className="pb-3">Target Job</th>
                  <th className="pb-3">ATS Score</th>
                  <th className="pb-3">Job Match</th>
                  <th className="pb-3">Analysis Date</th>
                  <th className="pb-3 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((analysis) => (
                  <tr key={analysis.id} className="border-b border-slate-900 hover:bg-slate-900/20 transition-all font-medium">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <div>
                          <span className="text-slate-200 block font-bold truncate max-w-[180px]" title={analysis.resumeName}>
                            {analysis.resumeName}
                          </span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase mt-0.5 block">
                            v{analysis.versionNumber} • ID: {analysis.id.substring(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">
                      {analysis.jobTitle ? (
                        <div className="flex items-start gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                          <div>
                            <span className="block font-bold">{analysis.jobTitle}</span>
                            <span className="text-[9px] text-slate-500 font-semibold">{analysis.jobCompany || 'Unknown Company'}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Standalone Analysis</span>
                      )}
                    </td>
                    <td className="py-4 font-bold">
                      {analysis.status === 'COMPLETED' ? (
                        <span className={`px-2 py-0.5 rounded ${
                          (analysis.atsScore || 0) >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          (analysis.atsScore || 0) >= 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {analysis.atsScore}/100
                        </span>
                      ) : analysis.status === 'FAILED' ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase text-[9px] font-bold">
                          Failed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 border border-slate-800 uppercase text-[9px] font-bold animate-pulse">
                          Processing
                        </span>
                      )}
                    </td>
                    <td className="py-4 font-bold">
                      {analysis.status === 'COMPLETED' && analysis.jobMatchScore !== null ? (
                        <span className={`px-2 py-0.5 rounded ${
                          (analysis.jobMatchScore || 0) >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          (analysis.jobMatchScore || 0) >= 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {analysis.jobMatchScore}%
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-4 text-slate-400">
                      {new Date(analysis.createdAt).toLocaleDateString()} at {new Date(analysis.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 pr-4 text-right font-bold">
                      <div className="flex items-center justify-end gap-2">
                        {analysis.status === 'COMPLETED' && (
                          <button
                            onClick={(e) => handleDownload(analysis.id, analysis.resumeName, e)}
                            disabled={downloadingId === analysis.id}
                            title="Download PDF Audit Report"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition cursor-pointer disabled:opacity-50"
                          >
                            {downloadingId === analysis.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/analysis/${analysis.id}`)}
                          className="glass-btn-secondary py-1 px-3 rounded-lg text-[10px]"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
