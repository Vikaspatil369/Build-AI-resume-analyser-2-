export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role?: string;
}

export interface JobDescriptionRequest {
  title: string;
  company?: string;
  rawText: string;
}
