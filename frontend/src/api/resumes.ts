import client from './client';
import type { ApiResponse } from '../types/api';
import type { Resume, ResumeVersion } from '../types';

export const listAllResumes = async (): Promise<ApiResponse<Resume[]>> => {
  const response = await client.get<ApiResponse<Resume[]>>('/api/resumes');
  return response.data;
};

export const getResume = async (id: string): Promise<ApiResponse<Resume>> => {
  const response = await client.get<ApiResponse<Resume>>(`/api/resumes/${id}`);
  return response.data;
};

export const uploadResume = async (file: File): Promise<ApiResponse<Resume>> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await client.post<ApiResponse<Resume>>('/api/resumes', formData);
  return response.data;
};

export const deleteResume = async (id: string): Promise<ApiResponse<void>> => {
  const response = await client.delete<ApiResponse<void>>(`/api/resumes/${id}`);
  return response.data;
};

export const renameResume = async (id: string, name: string): Promise<ApiResponse<Resume>> => {
  const response = await client.put<ApiResponse<Resume>>(`/api/resumes/${id}/rename`, { name });
  return response.data;
};

export const getVersion = async (versionId: string): Promise<ApiResponse<ResumeVersion>> => {
  const response = await client.get<ApiResponse<ResumeVersion>>(`/api/resumes/versions/${versionId}`);
  return response.data;
};

export const duplicateVersion = async (versionId: string, name: string): Promise<ApiResponse<ResumeVersion>> => {
  const response = await client.post<ApiResponse<ResumeVersion>>(`/api/resumes/versions/${versionId}/duplicate`, { name });
  return response.data;
};
