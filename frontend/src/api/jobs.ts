import client from './client';
import type { ApiResponse, JobDescriptionRequest } from '../types/api';
import type { JobDescription } from '../types';

export const createJobDescription = async (data: JobDescriptionRequest): Promise<ApiResponse<JobDescription>> => {
  const response = await client.post<ApiResponse<JobDescription>>('/api/jobs', data);
  return response.data;
};

export const listAllJobDescriptions = async (): Promise<ApiResponse<JobDescription[]>> => {
  const response = await client.get<ApiResponse<JobDescription[]>>('/api/jobs');
  return response.data;
};

export const getJobDescription = async (id: string): Promise<ApiResponse<JobDescription>> => {
  const response = await client.get<ApiResponse<JobDescription>>(`/api/jobs/${id}`);
  return response.data;
};

export const deleteJobDescription = async (id: string): Promise<ApiResponse<void>> => {
  const response = await client.delete<ApiResponse<void>>(`/api/jobs/${id}`);
  return response.data;
};
