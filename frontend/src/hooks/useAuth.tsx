import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';
import type { LoginRequest, RegisterRequest } from '../types/api';

interface AuthUser {
  email: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        // Corrupted session, clear
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      if (response.success && response.data) {
        const { token: jwtToken, email, role } = response.data;
        localStorage.setItem('token', jwtToken);
        
        const userData = { email, role };
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(jwtToken);
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setLoading(true);
    try {
      const response = await authApi.register(data);
      if (response.success && response.data) {
        const { token: jwtToken, email, role } = response.data;
        localStorage.setItem('token', jwtToken);
        
        const userData = { email, role };
        localStorage.setItem('user', JSON.stringify(userData));
        
        setToken(jwtToken);
        setUser(userData);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const isAuthenticated = !!token;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
