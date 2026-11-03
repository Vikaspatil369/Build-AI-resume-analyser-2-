import client from './client';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest } from '../types/api';

export const login = async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
  const response = await client.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
  const response = await client.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
  return response.data;
};
