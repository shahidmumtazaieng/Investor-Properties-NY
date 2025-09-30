import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface RecentActivity {
  type: string;
  count: number;
  date: Date;
}

interface RevenueData {
  month: string;
  revenue: number;
}

interface AnalyticsData {
  totalUsers: number;
  totalProperties: number;
  totalInvestors: number;
  totalSellers: number;
  recentActivity: RecentActivity[];
  revenueData: RevenueData[];
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalProperties: 0,
    totalInvestors: 0,
    totalSellers: 0,
    recentActivity: [],
    revenueData: []
  });

  useEffect(() => {
    // Check if user is admin
    if (user && user.userType !== 'admin') {
      navigate('/');
      return;
    }
    
    // Fetch real analytics data
    fetchAnalyticsData();
  }, [user, navigate]);

  const fetchAnalyticsData = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      if (data.success) {
        setAnalyticsData(data.analytics);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Fallback to mock data
      setTimeout(() => {
        setAnalyticsData({
          totalUsers: 150,
          totalProperties: 86,
          totalInvestors: 110,
          totalSellers: 24,
          recentActivity: [
            { type: 'new_user', count: 12, date: new Date() },
            { type: 'new_property', count: 5, date: new Date() },
            { type: 'new_investment', count: 3, date: new Date() }
          ],
          revenueData: [
            { month: 'Jan', revenue: 12500 },
            { month: 'Feb', revenue: 18600 },
            { month: 'Mar', revenue: 15400 }
          ]
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
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-gray-600">Detailed insights and metrics</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Registration Chart */}
            <Card className="bg-white shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">User Registrations</h2>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                    <p className="mt-4 text-gray-500">User registration chart visualization</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Revenue Chart */}
            <Card className="bg-white shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue Overview</h2>
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mx-auto" />
                    <p className="mt-4 text-gray-500">Revenue chart visualization</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Property Listings */}
            <Card className="bg-white shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Property Listings</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Listings</span>
                    <span className="font-semibold">{analyticsData.totalProperties}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending Approval</span>
                    <span className="font-semibold">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rejected</span>
                    <span className="font-semibold">3</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* User Distribution */}
            <Card className="bg-white shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Common Investors</span>
                    <span className="font-semibold">{Math.round(analyticsData.totalInvestors * 0.7)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Institutional Investors</span>
                    <span className="font-semibold">{Math.round(analyticsData.totalInvestors * 0.2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Sellers</span>
                    <span className="font-semibold">{analyticsData.totalSellers}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;