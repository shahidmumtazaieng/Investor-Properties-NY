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
import InvestorDashboard from './components/investor/InvestorDashboard';
import InstitutionalDashboard from './components/investor/InstitutionalDashboard';
import SubscriptionRequest from './components/investor/SubscriptionRequest';
import PropertyOfferForm from './components/investor/PropertyOfferForm';
import ForeclosureBidForm from './components/investor/ForeclosureBidForm';
import OfferManagement from './components/admin/OfferManagement';
import ForeclosureBidManagement from './components/admin/ForeclosureBidManagement';

// Define a compatible user type for the Header component
interface HeaderUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  userType: 'common_investor' | 'institutional_investor' | 'seller' | 'admin';
  hasForeclosureSubscription?: boolean;
}

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

  // Convert AuthContext user to Header-compatible user
  const headerUser: HeaderUser | null = user ? {
    id: user.id,
    username: user.username || '',
    firstName: user.firstName || user.personName || '',
    lastName: user.lastName || '',
    userType: user.userType,
    hasForeclosureSubscription: user.hasForeclosureSubscription
  } : null;

  // Dashboard route handler
  const getDashboardRoute = () => {
    if (!user) return <Navigate to="/auth/investor" replace />;

    switch (user.userType) {
      case 'common_investor':
        return <InvestorDashboard />;
      case 'institutional_investor':
        return <InstitutionalDashboard />;
      case 'seller':
        return <Navigate to="/seller/dashboard" replace />;
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/properties" replace />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
        <Header user={headerUser} onLogout={logout} />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          <Route path="/foreclosures" element={<ForeclosurePage />} />

          {/* Authentication Routes */}
          <Route path="/auth/investor" element={user ? <Navigate to="/dashboard" replace /> : <InvestorAuth />} />
          <Route path="/auth/seller" element={user ? <Navigate to="/dashboard" replace /> : <SellerAuth />} />

          {/* Protected Routes - Dashboard */}
          <Route path="/dashboard" element={user ? getDashboardRoute() : <Navigate to="/auth/investor" replace />} />
          
          {/* Investor Specific Routes */}
          {user && (user.userType === 'common_investor' || user.userType === 'institutional_investor') && (
            <>
              <Route path="/investor/subscription" element={<SubscriptionRequest />} />
              <Route path="/investor/properties/:id/offer" element={<PropertyOfferForm />} />
              <Route path="/investor/foreclosures/:id/bid" element={<ForeclosureBidForm />} />
              <Route path="/institutional/properties/:id/offer" element={<PropertyOfferForm />} />
              <Route path="/institutional/foreclosures/:id/bid" element={<ForeclosureBidForm />} />
            </>
          )}

          {/* Admin Routes */}
          {user && user.userType === 'admin' && (
            <>
              <Route path="/admin/offers" element={<OfferManagement />} />
              <Route path="/admin/foreclosure-bids" element={<ForeclosureBidManagement />} />
            </>
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