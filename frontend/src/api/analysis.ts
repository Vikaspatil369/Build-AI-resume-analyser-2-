import client from './client';
import type { ApiResponse } from '../types/api';
import type { ResumeAnalysis } from '../types';

export const queueStandaloneAnalysis = async (versionId: string): Promise<ApiResponse<ResumeAnalysis>> => {
  const response = await client.post<ApiResponse<ResumeAnalysis>>(`/api/analysis/resume/${versionId}`);
  return response.data;
};

export const queueMatchedAnalysis = async (versionId: string, jobId: string): Promise<ApiResponse<ResumeAnalysis>> => {
  const response = await client.post<ApiResponse<ResumeAnalysis>>(`/api/analysis/resume/${versionId}/job/${jobId}`);
  return response.data;
};

export const getAnalysis = async (id: string): Promise<ApiResponse<ResumeAnalysis>> => {
  const response = await client.get<ApiResponse<ResumeAnalysis>>(`/api/analysis/${id}`);
  return response.data;
};

export const getAnalysisHistory = async (): Promise<ApiResponse<ResumeAnalysis[]>> => {
  const response = await client.get<ApiResponse<ResumeAnalysis[]>>('/api/analysis/history');
  return response.data;
};

export const getResumeAnalyses = async (resumeId: string): Promise<ApiResponse<ResumeAnalysis[]>> => {
  const response = await client.get<ApiResponse<ResumeAnalysis[]>>(`/api/analysis/resume-history/${resumeId}`);
  return response.data;
};

export const downloadAnalysisReport = async (id: string, filename = 'resume-analysis-report.pdf'): Promise<void> => {
  const response = await client.get(`/api/analysis/${id}/export`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
