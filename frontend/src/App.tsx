import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeList from './pages/ResumeList';
import ResumeUpload from './pages/ResumeUpload';
import ResumeDetail from './pages/ResumeDetail';
import AnalysisResult from './pages/AnalysisResult';
import JobAnalysis from './pages/JobAnalysis';
import History from './pages/History';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

// Query Client setup for TanStack Query caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Guard component to enforce Admin authorization
const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Root navigator that routes home
const HomeRedirect: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Root Redirection */}
            <Route path="/" element={<HomeRedirect />} />

            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Protected SaaS Dashboard Routes */}
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/resumes" element={<ResumeList />} />
              <Route path="/resumes/upload" element={<ResumeUpload />} />
              <Route path="/resumes/:id" element={<ResumeDetail />} />
              <Route path="/analysis/:id" element={<AnalysisResult />} />
              <Route path="/jobs" element={<JobAnalysis />} />
              <Route path="/history" element={<History />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Protected Admin Stats */}
              <Route 
                path="/admin" 
                element={
                  <AdminGuard>
                    <AdminDashboard />
                  </AdminGuard>
                } 
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
