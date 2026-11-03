import client from './client';
import type { ApiResponse } from '../types/api';
import type { DashboardStats } from '../types';

export const getDashboardSummary = async (): Promise<ApiResponse<DashboardStats>> => {
  const response = await client.get<ApiResponse<DashboardStats>>('/api/dashboard');
  return response.data;
};
