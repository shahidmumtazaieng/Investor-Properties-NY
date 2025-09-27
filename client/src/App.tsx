import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import LandingPage from './components/LandingPage';
import PropertiesPage from './components/PropertiesPage';
import ForeclosurePage from './components/ForeclosurePage';
import AboutPage from './components/AboutPage';
import BlogPage from './components/BlogPage';
import ContactPage from './components/ContactPage';
import FaqPage from './components/FaqPage';
import InvestorAuth from './components/auth/InvestorAuth';
import SellerAuth from './components/auth/SellerAuth';
import ChatBot from './components/ChatBot';
// Admin components
import AdminAuth from './components/admin/AdminAuth';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import PropertyApproval from './components/admin/PropertyApproval';
import PropertyManagement from './components/admin/PropertyManagement';
import Analytics from './components/admin/Analytics';
import EmailCampaigns from './components/admin/EmailCampaigns';
import SecurityMonitoring from './components/admin/SecurityMonitoring';
import ForeclosureManagement from './components/admin/ForeclosureManagement';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);

  // Create a compatible user object for Header component
  const headerUser = user ? {
    ...user,
    // Ensure username is always a string for Header component
    username: user.username || '',
    // Ensure firstName and lastName are always strings for Header component
    firstName: user.firstName || '',
    lastName: user.lastName || ''
  } : null;

  // Simplified dashboard route - redirect to properties for now since dashboard components don't exist
  const getDashboardRoute = () => {
    if (!user) return <Navigate to="/auth/investor" replace />;

    // For now, redirect all authenticated users to properties page
    // TODO: Implement proper dashboard components
    return <Navigate to="/properties" replace />;
  };

  // WhatsApp link for the phone number (212) 555-0123
  const whatsappLink = "https://wa.me/12125550123";

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header user={headerUser} onLogout={logout} />
        
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/properties" element={<PropertiesPage />} />
            <Route path="/foreclosures" element={<ForeclosurePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/faq" element={<FaqPage />} />

            {/* Authentication Routes */}
            <Route path="/auth/investor" element={user ? <Navigate to="/dashboard" replace /> : <InvestorAuth />} />
            <Route path="/auth/seller" element={user ? <Navigate to="/dashboard" replace /> : <SellerAuth />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminAuth />} />
            <Route path="/admin/dashboard" element={user?.userType === 'admin' ? <AdminDashboard /> : <Navigate to="/admin/login" replace />} />
            <Route path="/admin/users" element={user?.userType === 'admin' ? <UserManagement /> : <Navigate to="/admin/login" replace />} />
            <Route path="/admin/properties" element={user?.userType === 'admin' ? <PropertyManagement /> : <Navigate to="/admin/login" replace />} />
            <Route path="/admin/properties/approval" element={user?.userType === 'admin' ? <PropertyApproval /> : <Navigate to="/admin/login" replace />} />
            <Route path="/admin/analytics" element={user?.userType === 'admin' ? <Analytics /> : <Navigate to="/admin/login" replace />} />
            <Route path="/admin/campaigns" element={user?.userType === 'admin' ? <EmailCampaigns /> : <Navigate to="/admin/login" replace />} />
            <Route path="/admin/security" element={user?.userType === 'admin' ? <SecurityMonitoring /> : <Navigate to="/admin/login" replace />} />
            <Route path="/admin/foreclosures" element={user?.userType === 'admin' ? <ForeclosureManagement /> : <Navigate to="/admin/login" replace />} />

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
        </main>
        
        <Footer />
        
        {/* Fixed WhatsApp Button */}
        <a 
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg hover:bg-green-600 transition-all duration-300 z-40"
        >
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.480-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
        
        {/* Fixed ChatBot Button */}
        <button
          onClick={() => setIsChatBotOpen(true)}
          className="fixed bottom-6 right-24 w-14 h-14 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        >
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
        
        {/* ChatBot Popup */}
        <ChatBot 
          isOpen={isChatBotOpen} 
          onClose={() => setIsChatBotOpen(false)} 
        />
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