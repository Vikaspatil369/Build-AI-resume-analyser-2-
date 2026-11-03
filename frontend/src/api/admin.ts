import client from './client';
import type { ApiResponse } from '../types/api';
import type { AdminStats } from '../types';

export const getSystemStatistics = async (): Promise<ApiResponse<AdminStats>> => {
  const response = await client.get<ApiResponse<AdminStats>>('/api/admin/statistics');
  return response.data;
};
