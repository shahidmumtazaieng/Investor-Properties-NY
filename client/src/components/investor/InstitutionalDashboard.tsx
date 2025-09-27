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
  arv: number;
  estimatedProfit: number;
  images: string[];
  status: string;
  createdAt: string;
}

interface Offer {
  id: string;
  propertyId: string;
  propertyAddress: string;
  offerAmount: number;
  earnestMoney: number;
  closingDate: string;
  financingType: string;
  contingencies: string[];
  status: string;
  submittedAt: string;
  message: string;
}

interface ForeclosureListing {
  id: string;
  address: string;
  county: string;
  auctionDate: string;
  startingBid: number;
  propertyType: string;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  status: string;
  isActive: boolean;
}

const InstitutionalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [foreclosureListings, setForeclosureListings] = useState<ForeclosureListing[]>([]);
  const [activeTab, setActiveTab] = useState<'properties' | 'offers' | 'foreclosures' | 'profile'>('properties');

  useEffect(() => {
    // Check if user is institutional investor
    if (user && user.userType !== 'institutional_investor') {
      navigate('/');
      return;
    }
    
    // Fetch dashboard data
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch properties
      const propertiesResponse = await fetch('/api/institutional/properties', {
        credentials: 'include'
      });
      const propertiesData = await propertiesResponse.json();
      if (propertiesData.properties) {
        setProperties(propertiesData.properties);
      }

      // Fetch offers
      const offersResponse = await fetch('/api/institutional/offers', {
        credentials: 'include'
      });
      const offersData = await offersResponse.json();
      if (offersData.offers) {
        setOffers(offersData.offers);
      }

      // Fetch foreclosure listings if user has subscription
      if (user?.hasForeclosureSubscription) {
        const foreclosureResponse = await fetch('/api/institutional/foreclosures', {
          credentials: 'include'
        });
        const foreclosureData = await foreclosureResponse.json();
        if (foreclosureData.listings) {
          setForeclosureListings(foreclosureData.listings);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const handlePropertyOffer = (propertyId: string) => {
    navigate(`/institutional/properties/${propertyId}/offer`);
  };

  const handleForeclosureBid = (foreclosureId: string) => {
    navigate(`/institutional/foreclosures/${foreclosureId}/bid`);
  };

  const handleDownloadForeclosure = (foreclosureId: string) => {
    // TODO: Implement download functionality
    console.log('Download foreclosure listing:', foreclosureId);
  };

  if (!user || user.userType !== 'institutional_investor') {
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
              <h1 className="text-3xl font-bold text-gray-900">Institutional Investor Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Welcome back, {user.personName} ({user.institutionName})
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                variant="primary" 
                onClick={() => navigate('/properties')}
              >
                Browse Properties
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
            {/* Navigation Tabs */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'properties'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Properties
                </button>
                <button
                  onClick={() => setActiveTab('offers')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'offers'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Offers ({offers.length})
                </button>
                <button
                  onClick={() => setActiveTab('foreclosures')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'foreclosures'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Foreclosure Listings
                  {user.hasForeclosureSubscription && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                      Access
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile & Settings
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div>
              {/* Properties Tab */}
              {activeTab === 'properties' && (
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <Card key={property.id} className="bg-white shadow">
                        <div className="p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">{property.address}</h3>
                              <p className="text-sm text-gray-500">{property.neighborhood}, {property.borough}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              property.status === 'available' ? 'bg-green-100 text-green-800' :
                              property.status === 'under_contract' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {property.status.replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="mt-4">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">${property.price.toLocaleString()}</span>
                              <span className="text-gray-500">{property.beds} bd / {property.baths} ba</span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              {property.sqft} sqft
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => handlePropertyOffer(property.id)}
                              className="w-full"
                            >
                              Make Offer
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  
                  {properties.length === 0 && (
                    <Card className="bg-white shadow">
                      <div className="p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No properties found</h3>
                        <p className="mt-1 text-gray-500">Start browsing properties to make offers.</p>
                        <div className="mt-6">
                          <Button 
                            variant="primary" 
                            onClick={() => navigate('/properties')}
                          >
                            Browse Properties
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Offers Tab */}
              {activeTab === 'offers' && (
                <div>
                  <Card className="bg-white shadow">
                    <div className="p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">My Offers</h2>
                      {offers.length > 0 ? (
                        <div className="space-y-4">
                          {offers.map((offer) => (
                            <div key={offer.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between">
                                <div>
                                  <h3 className="font-medium text-gray-900">{offer.propertyAddress}</h3>
                                  <p className="text-sm text-gray-500">Submitted on {new Date(offer.submittedAt).toLocaleDateString()}</p>
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
                                <span className="font-medium">Offer: ${offer.offerAmount.toLocaleString()}</span>
                                <span>Financing: {offer.financingType}</span>
                              </div>
                              <div className="mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => navigate(`/institutional/offers/${offer.id}`)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <h3 className="mt-2 text-lg font-medium text-gray-900">No offers yet</h3>
                          <p className="mt-1 text-gray-500">Make offers on properties to see them here.</p>
                          <div className="mt-6">
                            <Button 
                              variant="primary" 
                              onClick={() => navigate('/properties')}
                            >
                              Browse Properties
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Foreclosures Tab */}
              {activeTab === 'foreclosures' && (
                <div>
                  {user.hasForeclosureSubscription ? (
                    <div>
                      <div className="mb-6">
                        <Card className="bg-white shadow">
                          <div className="p-6">
                            <div className="flex justify-between items-center">
                              <div>
                                <h2 className="text-lg font-medium text-gray-900">Foreclosure Subscription</h2>
                                <p className="text-gray-600">
                                  You have access to foreclosure listings. Your subscription is active.
                                </p>
                              </div>
                              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                Active
                              </span>
                            </div>
                          </div>
                        </Card>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        {foreclosureListings.map((listing) => (
                          <Card key={listing.id} className="bg-white shadow">
                            <div className="p-6">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="text-lg font-medium text-gray-900">{listing.address}</h3>
                                  <p className="text-sm text-gray-500">{listing.county} County</p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  listing.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                  listing.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {listing.status}
                                </span>
                              </div>
                              
                              <div className="mt-4">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">Starting Bid: ${listing.startingBid?.toLocaleString() || 'N/A'}</span>
                                  <span className="text-gray-500">{listing.beds} bd / {listing.baths} ba</span>
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                  Auction Date: {new Date(listing.auctionDate).toLocaleDateString()}
                                </div>
                                <div className="mt-2 text-sm text-gray-500">
                                  Property Type: {listing.propertyType}
                                </div>
                              </div>
                              
                              <div className="mt-4 flex space-x-3">
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  onClick={() => handleForeclosureBid(listing.id)}
                                >
                                  Place Bid
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDownloadForeclosure(listing.id)}
                                >
                                  Download PDF
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Card className="bg-white shadow">
                      <div className="p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No Foreclosure Access</h3>
                        <p className="mt-1 text-gray-500">
                          Contact admin to get foreclosure access for your institution.
                        </p>
                        <div className="mt-6">
                          <Button 
                            variant="primary" 
                            onClick={() => navigate('/contact')}
                          >
                            Contact Admin
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card className="bg-white shadow">
                      <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Institution Profile</h2>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                              <div className="mt-1 text-sm text-gray-900">{user.personName}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Job Title</label>
                              <div className="mt-1 text-sm text-gray-900">{user.jobTitle}</div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Institution Name</label>
                            <div className="mt-1 text-sm text-gray-900">{user.institutionName}</div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Work Phone</label>
                              <div className="mt-1 text-sm text-gray-900">{user.workPhone}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Personal Phone</label>
                              <div className="mt-1 text-sm text-gray-900">{user.personalPhone}</div>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="mt-1 text-sm text-gray-900">{user.email}</div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Username</label>
                            <div className="mt-1 text-sm text-gray-900">{user.username}</div>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <Button 
                            variant="outline" 
                            onClick={() => navigate('/institutional/profile/edit')}
                          >
                            Edit Profile
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <div>
                    <Card className="bg-white shadow">
                      <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Status</h2>
                        {user.hasForeclosureSubscription ? (
                          <div>
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Active</p>
                                <p className="text-sm text-gray-500">Foreclosure Access</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => navigate('/institutional/subscription/manage')}
                              >
                                Manage Subscription
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">Inactive</p>
                                <p className="text-sm text-gray-500">No Foreclosure Access</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => navigate('/contact')}
                              >
                                Request Access
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                    
                    <Card className="bg-white shadow mt-6">
                      <div className="p-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
                        <div className="space-y-3">
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => navigate('/institutional/settings/security')}
                          >
                            Security Settings
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full justify-start"
                            onClick={() => navigate('/institutional/settings/notifications')}
                          >
                            Notification Preferences
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstitutionalDashboard;