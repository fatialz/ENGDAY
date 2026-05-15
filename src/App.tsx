/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { authService } from './services/authService';
import { useAppStore } from './store/useAppStore';

// Layouts
import { DashboardLayout } from './components/layout/DashboardLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { Dashboard } from './pages/Dashboard';
import { StudentData } from './pages/StudentData';
import { ViolationInput } from './pages/ViolationInput';
import { ViolationHistory } from './pages/ViolationHistory';
import { ViolationCategories } from './pages/ViolationCategories';
import { UserManagement } from './pages/UserManagement';
import { Reports } from './pages/Reports';
import { ToastContainer } from './components/ui/Toast';

function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'PJ' | 'ADMIN' }) {
  const { user, isLoading } = useAppStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'PJ') {
    return <Navigate to="/app" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

export default function App() {
  const { setLoading } = useAppStore();

  useEffect(() => {
    authService.init();
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/app" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/app/students" element={<ProtectedRoute><StudentData /></ProtectedRoute>} />
        <Route path="/app/violations" element={<ProtectedRoute><ViolationInput /></ProtectedRoute>} />
        <Route path="/app/history" element={<ProtectedRoute><ViolationHistory /></ProtectedRoute>} />
        <Route path="/app/categories" element={<ProtectedRoute><ViolationCategories /></ProtectedRoute>} />
        <Route path="/app/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/app/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
