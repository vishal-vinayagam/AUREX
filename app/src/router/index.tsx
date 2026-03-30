/**
 * Router - AUREX Civic Issue Reporting System
 * 
 * Main routing configuration for the application.
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import TermsAndConditionsPage from '../pages/auth/TermsAndConditionsPage';

// User Pages
import HomePage from '../pages/user/HomePage';
import ReportPage from '../pages/user/ReportPage';
import TrackPage from '../pages/user/TrackPage';
import TrackDetailPage from '../pages/user/TrackDetailPage';
import CommunityPage from '../pages/user/CommunityPage';
import LawsPage from '../pages/user/LawsPage';
import LawDetailPage from '../pages/user/LawDetailPage';
import EmergencyPage from '../pages/user/EmergencyPage';
import ContactsPage from '../pages/user/ContactsPage';
import MessagesPage from '../pages/user/MessagesPage';
import SettingsPage from '../pages/user/SettingsPage';
import ProfilePage from '../pages/user/ProfilePage';

// Admin Pages
import AdminDashboard from '../pages/admin/DashboardPage';
import AdminReportsPage from '../pages/admin/ReportsPage';
import AdminReportDetailPage from '../pages/admin/ReportDetailPage';
import AdminCommunityPage from '../pages/admin/CommunityPage';
import AdminLawsPage from '../pages/admin/LawsPage';
import AdminContactsPage from '../pages/admin/ContactsPage';
import AdminUsersPage from '../pages/admin/UsersPage';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user?.role !== 'admin' && user?.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Public Route (redirect if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/terms-and-conditions"
            element={<TermsAndConditionsPage />}
          />
        </Route>

        {/* User Routes */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/track/:id" element={<TrackDetailPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/laws" element={<LawsPage />} />
          <Route path="/laws/:id" element={<LawDetailPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:userId" element={<MessagesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="reports/:id" element={<AdminReportDetailPage />} />
          <Route path="community" element={<AdminCommunityPage />} />
          <Route path="laws" element={<AdminLawsPage />} />
          <Route path="contacts" element={<AdminContactsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
        </Route>

        {/* 404 Fallback */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center">
              <h1 className="text-4xl font-bold mb-4">404</h1>
              <p className="text-muted-foreground mb-6">Page not found</p>
              <a href="/" className="text-primary hover:underline">
                Go back home
              </a>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}