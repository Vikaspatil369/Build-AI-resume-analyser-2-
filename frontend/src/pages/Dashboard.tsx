import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { getDashboardSummary } from '../api/dashboard';
import ScoreCard from '../components/ScoreCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { 
  UploadCloud, Briefcase, History, Plus, ChevronRight, FileText, TrendingUp 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const response = await getDashboardSummary();
      return response.data;
    }
  });

  if (isLoading) {
    return <LoadingState message="Aggregating dashboard analytics..." />;
  }

  if (error) {
    const errorMsg = (error as any)?.response?.data?.message || (error as any)?.message || "Could not load dashboard statistics.";
    return <ErrorState onRetry={refetch} message={errorMsg} />;
  }

  const stats = data;

  const hasData = stats && stats.totalResumes > 0;

  // Chart data formatting
  const trendData = stats?.recentAnalyses
    ? [...stats.recentAnalyses].reverse().map(analysis => ({
        date: new Date(analysis.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        ATS: analysis.atsScore || 0,
        Match: analysis.jobMatchScore || 0,
        name: analysis.resumeName.length > 15 ? analysis.resumeName.substring(0, 15) + '...' : analysis.resumeName
      }))
    : [];

  return (
    <div className="flex flex-col gap-8">
      {/* Upper header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 font-sans tracking-wide">Dashboard</h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Real-time resume analytics and ATS match performance.</p>
        </div>

        <Link
          to="/resumes/upload"
          className="glass-btn-primary flex items-center gap-2 text-xs font-bold py-2.5 px-4 rounded-xl"
        >
          <Plus className="w-4 h-4" />
          Upload Resume
        </Link>
      </div>

      {!hasData ? (
        <EmptyState
          icon={UploadCloud}
          title="No Resumes Uploaded Yet"
          message="Upload your PDF or DOCX resume to analyze its ATS compliance, keyword relevance, and matching score."
          actionLabel="Upload First Resume"
          onAction={() => navigate('/resumes/upload')}
        />
      ) : (
        <>
          {/* Statistics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ScoreCard
              score={stats.totalResumes}
              maxScore={10}
              title="Total Resumes"
              subtitle="Versions uploaded"
              description="Maintain multiple resume variants tailored to different roles."
            />
            <ScoreCard
              score={Math.round(stats.averageAtsScore)}
              title="Average ATS Score"
              subtitle="Target is 80+"
              description="A higher score indicates better structure, keywords, and layout."
            />
            <ScoreCard
              score={stats.bestAtsScore}
              title="Best ATS Score"
              subtitle="Your highest score"
              description="Your top-performing resume version on keyword compliance."
            />
            <ScoreCard
              score={Math.round(stats.averageJobMatch)}
              title="Average Match"
              subtitle="Job descriptions compatibility"
              description="Semantic compatibility score against pasted descriptions."
            />
          </div>

          {/* Quick Actions & Trend charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions Panel */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col gap-4">
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider mb-2">Quick Actions</h3>
              
              <Link
                to="/resumes/upload"
                className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/20 hover:bg-slate-900/40 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-brand-500/10 p-2.5 rounded-lg text-brand-400 border border-brand-500/10">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">Upload New Resume</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Parse new PDF/DOCX file version.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>

              <Link
                to="/jobs"
                className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/20 hover:bg-slate-900/40 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-brand-500/10 p-2.5 rounded-lg text-brand-400 border border-brand-500/10">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">Run Job Match</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Compare resume with Job Description.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>

              <Link
                to="/history"
                className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950/20 hover:bg-slate-900/40 hover:border-slate-700 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-brand-500/10 p-2.5 rounded-lg text-brand-400 border border-brand-500/10">
                    <History className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-200">View History</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Look at all previous analyses results.</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </Link>
            </div>

            {/* Performance Trend Chart */}
            <div className="glass-panel rounded-2xl p-6 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-brand-400" />
                <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider">Performance Trends</h3>
              </div>
              
              <div className="h-60 w-full">
                {trendData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                    Not enough analysis data to plot trends.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAts" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0c90eb" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#0c90eb" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMatch" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }} 
                        labelStyle={{ fontWeight: 'bold', color: '#f1f5f9' }}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area type="monotone" name="ATS Score" dataKey="ATS" stroke="#0c90eb" strokeWidth={2} fillOpacity={1} fill="url(#colorAts)" />
                      <Area type="monotone" name="Job Match %" dataKey="Match" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMatch)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Recent Analyses Table */}
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-100 uppercase tracking-wider mb-4">Recent Analyses</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 uppercase font-bold">
                    <th className="pb-3 pl-4">Resume Version</th>
                    <th className="pb-3">Target Job</th>
                    <th className="pb-3">ATS Score</th>
                    <th className="pb-3">Job Match</th>
                    <th className="pb-3">Date performed</th>
                    <th className="pb-3 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAnalyses.map((analysis) => (
                    <tr key={analysis.id} className="border-b border-slate-900 hover:bg-slate-900/20 transition-all font-medium">
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="text-slate-200 block font-bold">{analysis.resumeName}</span>
                            <span className="text-[10px] text-slate-500 font-semibold uppercase">v{analysis.versionNumber}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-slate-300">
                        {analysis.jobTitle ? (
                          <div>
                            <span className="block font-bold">{analysis.jobTitle}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{analysis.jobCompany || 'Unknown Company'}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">Standalone Analysis</span>
                        )}
                      </td>
                      <td className="py-4 font-bold">
                        <span className={`px-2 py-0.5 rounded ${
                          (analysis.atsScore || 0) >= 80 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          (analysis.atsScore || 0) >= 60 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {analysis.atsScore || 0}/100
                        </span>
                      </td>
                      <td className="py-4 font-bold">
                        {analysis.jobMatchScore !== null ? (
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
                        {new Date(analysis.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <button
                          onClick={() => navigate(`/analysis/${analysis.id}`)}
                          className="glass-btn-secondary py-1 px-3.5 rounded-lg text-[10px] font-bold"
                        >
                          View Results
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
