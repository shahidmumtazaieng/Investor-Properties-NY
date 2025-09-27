import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Property {
  id: string;
  address: string;
  neighborhood: string;
  borough: string;
  propertyType: string;
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  status: string;
  views: number;
  offers: number;
  createdAt: string;
}

interface Offer {
  id: string;
  propertyId: string;
  propertyAddress: string;
  investorName: string;
  investorType: string;
  investorEmail: string;
  investorPhone: string;
  offerAmount: number;
  earnestMoney: number;
  closingDate: string;
  financingType: string;
  contingencies: string[];
  status: string;
  submittedAt: string;
  message: string;
}

interface Stats {
  totalListings: number;
  activeListings: number;
  draftListings: number;
  pendingReview: number;
  totalOffers: number;
  pendingOffers: number;
  acceptedOffers: number;
  totalViews: number;
  averageOfferAmount: number;
  averageDaysOnMarket: number;
  conversionRate: number;
}

const SellerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalListings: 0,
    activeListings: 0,
    draftListings: 0,
    pendingReview: 0,
    totalOffers: 0,
    pendingOffers: 0,
    acceptedOffers: 0,
    totalViews: 0,
    averageOfferAmount: 0,
    averageDaysOnMarket: 0,
    conversionRate: 0
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    // Check if user is seller
    if (user && user.userType !== 'seller') {
      navigate('/');
      return;
    }
    
    // Fetch dashboard data
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/seller/stats', {
        credentials: 'include'
      });
      const statsData = await statsResponse.json();
      if (statsData.stats) {
        setStats(statsData.stats);
      }

      // Fetch properties
      const propertiesResponse = await fetch('/api/seller/properties', {
        credentials: 'include'
      });
      const propertiesData = await propertiesResponse.json();
      if (propertiesData.properties) {
        setProperties(propertiesData.properties);
      }

      // Fetch offers
      const offersResponse = await fetch('/api/seller/offers', {
        credentials: 'include'
      });
      const offersData = await offersResponse.json();
      if (offersData.offers) {
        setOffers(offersData.offers);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (!user || user.userType !== 'seller') {
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="mt-2 text-gray-600">Welcome back, {user.firstName} {user.lastName}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                variant="primary" 
                onClick={() => navigate('/seller/properties')}
              >
                Add New Property
              </Button>
            </div>
          </div>
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Total Listings</h3>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalListings}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-white shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Active Listings</h3>
                      <p className="text-2xl font-semibold text-gray-900">{stats.activeListings}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="bg-white shadow">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-500">Pending Offers</h3>
                      <p className="text-2xl font-semibold text-gray-900">{stats.pendingOffers}</p>
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
                      <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
                      <p className="text-2xl font-semibold text-gray-900">{stats.totalViews}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Properties and Offers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Properties */}
              <div>
                <Card className="bg-white shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900">Your Properties</h2>
                      <span className="text-sm text-gray-500">{properties.length} properties</span>
                    </div>
                    <div className="space-y-4">
                      {properties.slice(0, 3).map((property) => (
                        <div key={property.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{property.address}</h3>
                              <p className="text-sm text-gray-500">{property.neighborhood}, {property.borough}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              property.status === 'active' ? 'bg-green-100 text-green-800' :
                              property.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {property.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="mt-2 flex justify-between text-sm">
                            <span className="font-medium">${property.price.toLocaleString()}</span>
                            <div className="flex space-x-4">
                              <span>{property.views} views</span>
                              <span>{property.offers} offers</span>
                            </div>
                          </div>
                          <div className="mt-3 flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/seller/properties/${property.id}`)}
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/seller/properties/${property.id}/edit`)}
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/seller/properties')}
                      >
                        View All Properties
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Offers */}
              <div>
                <Card className="bg-white shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-medium text-gray-900">Recent Offers</h2>
                      <span className="text-sm text-gray-500">{offers.length} offers</span>
                    </div>
                    <div className="space-y-4">
                      {offers.slice(0, 3).map((offer) => (
                        <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{offer.propertyAddress}</h3>
                              <p className="text-sm text-gray-500">From {offer.investorName}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              offer.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {offer.status}
                            </span>
                          </div>
                          <div className="mt-2 flex justify-between text-sm">
                            <span className="font-medium">${offer.offerAmount.toLocaleString()}</span>
                            <span>{new Date(offer.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="mt-3">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/seller/offers/${offer.id}`)}
                            >
                              View Offer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate('/seller/offers')}
                      >
                        View All Offers
                      </Button>
                    </div>
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

export default SellerDashboard;