import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import LandingPage from './components/LandingPage';
import PropertiesPage from './components/PropertiesPage';
import ForeclosurePage from './components/ForeclosurePage';
import PropertyDetailsPage from './components/property/PropertyDetailsPage';
import InvestorAuth from './components/auth/InvestorAuth';
import SellerAuth from './components/auth/SellerAuth';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
        <div className="text-center animate-bounce-in">
          <div className="w-24 h-24 bg-glass-bg-strong backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-8 animate-float border border-glass-border">
            <span className="text-4xl font-bold text-white">IP</span>
          </div>
          <div className="text-2xl text-white animate-pulse font-semibold">Loading Modern Experience...</div>
        </div>
      </div>
    );
  }

  // Simplified dashboard route - redirect to properties for now since dashboard components don't exist
  const getDashboardRoute = () => {
    if (!user) return <Navigate to="/auth/investor" replace />;

    // For now, redirect all authenticated users to properties page
    // TODO: Implement proper dashboard components
    return <Navigate to="/properties" replace />;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <Header user={user} onLogout={logout} />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/foreclosures" element={<ForeclosurePage />} />

          {/* Authentication Routes */}
          <Route path="/auth/investor" element={user ? <Navigate to="/dashboard" replace /> : <InvestorAuth />} />
          <Route path="/auth/seller" element={user ? <Navigate to="/dashboard" replace /> : <SellerAuth />} />

          {/* Protected Routes - Simplified Dashboard */}
          {user ? (
            <>
              <Route path="/dashboard" element={getDashboardRoute()} />
              {/* TODO: Add dashboard routes when components are available */}
            </>
          ) : (
            <Route path="/dashboard/*" element={<Navigate to="/auth/investor" replace />} />
          )}

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;