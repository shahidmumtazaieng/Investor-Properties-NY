import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeProperties: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    // Check if user is admin
    if (user && user.userType !== 'admin') {
      navigate('/');
      return;
    }
    
    // Fetch dashboard stats
    fetchDashboardStats();
  }, [user, navigate]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to mock data
      setTimeout(() => {
        setStats({
          totalUsers: 124,
          pendingApprovals: 8,
          activeProperties: 42,
          totalRevenue: 12500
        });
        setLoading(false);
      }, 1000);
    }
  };

  if (!user || user.userType !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back, {user.firstName} {user.lastName}</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-white shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Pending Approvals</h3>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pendingApprovals}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-white shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Active Properties</h3>
                      <p className="text-2xl font-semibold text-gray-900">{stats.activeProperties}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-white shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                      <p className="text-2xl font-semibold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-white shadow">
                  <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button 
                        variant="primary" 
                        className="justify-center"
                        onClick={() => navigate('/admin/users')}
                      >
                        Manage Users
                      </Button>
                      <Button 
                        variant="primary" 
                        className="justify-center"
                        onClick={() => navigate('/admin/properties')}
                      >
                        Manage Properties
                      </Button>
                      <Button 
                        variant="primary" 
                        className="justify-center"
                        onClick={() => navigate('/admin/properties/approval')}
                      >
                        Property Approval
                      </Button>
                      <Button 
                        variant="primary" 
                        className="justify-center"
                        onClick={() => navigate('/admin/analytics')}
                      >
                        View Analytics
                      </Button>
                      <Button 
                        variant="primary" 
                        className="justify-center"
                        onClick={() => navigate('/admin/campaigns')}
                      >
                        Email Campaigns
                      </Button>
                      <Button 
                        variant="primary" 
                        className="justify-center"
                        onClick={() => navigate('/admin/security')}
                      >
                        Security Monitoring
                      </Button>
                      <Button 
                        variant="primary" 
                        className="justify-center"
                        onClick={() => navigate('/admin/foreclosures')}
                      >
                        Foreclosure Management
                      </Button>
                      <Button 
                        variant="primary" 
                        className="justify-center"
                        onClick={() => navigate('/admin/offers')}
                      >
                        Offer Management
                      </Button>
                      <Button 
                        variant="primary" 
                        className="justify-center"
                        onClick={() => navigate('/admin/foreclosure-bids')}
                      >
                        Foreclosure Bid Management
                      </Button>
                      <Button 
                        variant="primary" 
                        className="justify-center"
                        onClick={() => navigate('/admin/blogs')}
                      >
                        Blog Management
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <Card className="bg-white shadow">
                  <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
                    <ul className="space-y-4">
                      <li className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="bg-green-100 rounded-full p-2">
                              <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">New user registered</p>
                            <p className="text-sm text-gray-500">John Doe - 2 hours ago</p>
                          </div>
                        </div>
                      </li>
                      <li className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="bg-blue-100 rounded-full p-2">
                              <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Property approved</p>
                            <p className="text-sm text-gray-500">123 Brooklyn Ave - 5 hours ago</p>
                          </div>
                        </div>
                      </li>
                      <li className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="flex-shrink-0">
                            <div className="bg-yellow-100 rounded-full p-2">
                              <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">Pending approval</p>
                            <p className="text-sm text-gray-500">456 Queens Blvd - 1 day ago</p>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;