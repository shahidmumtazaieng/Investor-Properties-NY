import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from '../icons';
import Button from '../ui/Button';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  userType: 'common_investor' | 'institutional_investor' | 'seller' | 'admin';
  hasForeclosureSubscription?: boolean;
}

interface HeaderProps {
  user?: User | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Close menus when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      let endpoint = '/api/investors/logout';
      if (user?.userType === 'seller') {
        endpoint = '/api/partners/logout';
      } else if (user?.userType === 'institutional_investor') {
        endpoint = '/api/institutional/logout';
      }

      await fetch(endpoint, { method: 'POST' });
      
      if (onLogout) {
        onLogout();
      }
      
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getDashboardLink = () => {
    if (!user) return '/';
    
    switch (user.userType) {
      case 'common_investor':
        return '/dashboard/investor';
      case 'institutional_investor':
        return '/dashboard/institutional';
      case 'seller':
        return '/dashboard/seller';
      case 'admin':
        return '/dashboard/admin';
      default:
        return '/';
    }
  };

  const getNavItems = () => {
    if (user) {
      // Simplified navigation for authenticated users - only dashboard
      return [
        { name: 'Dashboard', href: getDashboardLink() },
      ];
    } else {
      // Navigation for public users
      return [
        { name: 'Home', href: '/' },
        { name: 'Properties', href: '/properties' },
        { name: 'Foreclosures', href: '/foreclosures' },
        { name: 'About', href: '/about' },
        { name: 'Sellers', href: '/auth/seller' },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-primary text-white p-3 rounded-xl group-hover:scale-105 transition-transform">
              <span className="text-xl font-bold">IP</span>
            </div>
            <div>
              <div className="text-xl font-bold text-primary-blue group-hover:text-accent-yellow transition-colors">
                Investor Properties NY
              </div>
              <div className="text-xs text-neutral-600 font-medium">Off-Market Real Estate</div>
            </div>
          </Link>

          {/* Desktop Navigation - Simplified */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`relative font-medium transition-colors hover:text-accent-yellow ${
                  location.pathname === item.href 
                    ? 'text-accent-yellow' 
                    : 'text-primary-blue'
                }`}
              >
                {item.name}
                {location.pathname === item.href && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-accent-yellow rounded-full"></div>
                )}
              </Link>
            ))}
          </nav>

          {/* User Menu / Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 text-primary-blue hover:text-accent-yellow focus:outline-none transition-colors group"
                >
                  <div className="bg-gradient-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-semibold group-hover:scale-105 transition-transform">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{user.firstName}</div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user.userType.replace('_', ' ')}
                    </div>
                  </div>
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 card-modern p-2 z-50 animate-scale-in">
                    <Link
                      to="/dashboard/profile"
                      className="block px-4 py-3 text-sm text-primary-blue hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      Profile Settings
                    </Link>
                    {user.userType === 'common_investor' && !user.hasForeclosureSubscription && (
                      <Link
                        to="/dashboard/subscription"
                        className="block px-4 py-3 text-sm text-accent-yellow hover:bg-gray-100 rounded-lg transition-colors font-medium"
                      >
                        Upgrade Subscription
                      </Link>
                    )}
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/auth/investor"
                  className="text-primary-blue hover:text-accent-yellow font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link to="/auth/investor">
                  <Button variant="primary">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-primary-blue hover:text-accent-yellow focus:outline-none p-2"
          >
            {isMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-slide-up">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block py-3 px-4 rounded-lg font-medium transition-colors ${
                    location.pathname === item.href 
                      ? 'text-accent-yellow bg-accent-yellow/10' 
                      : 'text-primary-blue hover:bg-gray-100'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile User Menu */}
            {user ? (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4 px-4">
                  <div className="bg-gradient-primary text-white w-12 h-12 rounded-full flex items-center justify-center font-semibold">
                    {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-primary-blue">{user.firstName} {user.lastName}</div>
                    <div className="text-sm text-gray-600 capitalize">{user.userType.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Link
                    to="/dashboard/profile"
                    className="block py-3 px-4 text-primary-blue hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Profile Settings
                  </Link>
                  {user.userType === 'common_investor' && !user.hasForeclosureSubscription && (
                    <Link
                      to="/dashboard/subscription"
                      className="block py-3 px-4 text-accent-yellow hover:bg-gray-100 rounded-lg transition-colors font-medium"
                    >
                      Upgrade Subscription
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left py-3 px-4 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <Link
                  to="/auth/investor"
                  className="block py-3 px-4 text-primary-blue hover:bg-gray-100 rounded-lg font-medium transition-colors text-center"
                >
                  Sign In
                </Link>
                <div className="mx-4">
                  <Link to="/auth/investor">
                    <Button variant="primary" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;