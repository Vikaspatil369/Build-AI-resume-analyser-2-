import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { listAllResumes, deleteResume, renameResume } from '../api/resumes';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { 
  FileText, Search, Plus, Trash2, Edit2, ChevronRight, FileSpreadsheet, Check, X 
} from 'lucide-react';

const ResumeList: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      const response = await listAllResumes();
      return response.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await deleteResume(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
    }
  });

  const renameMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      await renameResume(id, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resumes'] });
      setEditingId(null);
    }
  });

  if (isLoading) {
    return <LoadingState message="Retrieving your resumes..." />;
  }

  if (error) {
    return <ErrorState onRetry={refetch} message="Could not fetch resumes list." />;
  }

  const resumes = data || [];

  const filteredResumes = resumes.filter(resume => 
    resume.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? All versions and analyses will be deleted.`)) {
      deleteMutation.mutate(id);
    }
  };

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const handleSaveRename = (id: string) => {
    if (!newName.trim()) return;
    renameMutation.mutate({ id, name: newName.trim() });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100 font-sans tracking-wide">My Resumes</h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">Manage and organize your resume versions.</p>
        </div>

        <Link
          to="/resumes/upload"
          className="glass-btn-primary flex items-center gap-2 text-xs font-bold py-2.5 px-4"
        >
          <Plus className="w-4 h-4" />
          Upload Resume
        </Link>
      </div>

      {resumes.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Resumes Yet"
          message="You haven't uploaded any resumes yet. Upload a PDF or DOCX file to get started."
          actionLabel="Upload Resume"
          onAction={() => navigate('/resumes/upload')}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {/* Search bar Filter */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search resumes by file name..."
              className="glass-input w-full pl-10 text-xs py-2.5"
            />
          </div>

          {/* List display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredResumes.map((resume) => (
              <div
                key={resume.id}
                className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/10 flex flex-col justify-between hover:translate-y-[-1px] group"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-400 flex-shrink-0">
                      {resume.fileType === 'PDF' ? (
                        <FileText className="w-5 h-5 text-rose-400" />
                      ) : (
                        <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      {editingId === resume.id ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="glass-input py-1 px-2 text-xs w-[180px] md:w-[220px]"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveRename(resume.id)}
                            className="bg-emerald-500/20 text-emerald-300 p-1.5 border border-emerald-500/25 rounded hover:bg-emerald-500/30"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="bg-slate-850 text-slate-400 p-1.5 border border-slate-800 rounded hover:text-slate-300"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h4 
                            onClick={() => navigate(`/resumes/${resume.id}`)}
                            className="font-bold text-sm text-slate-200 cursor-pointer hover:text-brand-400 truncate max-w-[220px] md:max-w-[260px] tracking-wide"
                            title={resume.filename}
                          >
                            {resume.filename}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-1 uppercase">
                            <span>{resume.fileType} format</span>
                            <span>•</span>
                            <span>v{resume.latestVersionNumber} Latest</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-5 pt-3.5 border-t border-slate-900/60">
                  <span className="text-[10px] text-slate-500 font-semibold">
                    Added {new Date(resume.createdAt).toLocaleDateString()}
                  </span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartRename(resume.id, resume.filename)}
                      className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-850 border border-transparent hover:border-slate-800"
                      title="Rename"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id, resume.filename)}
                      className="p-2 text-rose-400 hover:text-rose-300 rounded-lg hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => navigate(`/resumes/${resume.id}`)}
                      className="p-2 text-brand-400 hover:text-brand-300 rounded-lg hover:bg-brand-500/5 border border-transparent hover:border-brand-500/10 flex items-center gap-0.5 text-[10px] font-bold"
                    >
                      Open
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeList;
