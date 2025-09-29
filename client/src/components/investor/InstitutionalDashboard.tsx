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

interface ForeclosureBid {
  id: string;
  propertyId: string;
  propertyAddress: string;
  bidAmount: string;
  auctionDate: string;
  status: string;
  notes: string;
  createdAt: string;
}

const InstitutionalDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [foreclosureListings, setForeclosureListings] = useState<ForeclosureListing[]>([]);
  const [foreclosureBids, setForeclosureBids] = useState<ForeclosureBid[]>([]);
  const [activeTab, setActiveTab] = useState<'properties' | 'offers' | 'foreclosures' | 'bids' | 'profile'>('properties');

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

      // Fetch foreclosure listings (institutional investors have free access)
      const foreclosureResponse = await fetch('/api/institutional/foreclosures', {
        credentials: 'include'
      });
      const foreclosureData = await foreclosureResponse.json();
      if (Array.isArray(foreclosureData)) {
        setForeclosureListings(foreclosureData);
      }

      // Fetch foreclosure bids
      const bidsResponse = await fetch('/api/institutional/foreclosure-bids', {
        credentials: 'include'
      });
      const bidsData = await bidsResponse.json();
      if (bidsData.bids) {
        setForeclosureBids(bidsData.bids);
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
              <h1 className="text-3xl font-bold text-gray-900">
                Institutional Investor Dashboard
              </h1>
              <p className="mt-2 text-gray-600">
                Welcome back, {user.firstName} {user.lastName}
              </p>
            </div>
            <div className="mt-4 flex md:mt-0">
              <Button variant="outline" onClick={logout}>
                Sign out
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
            <div className="border-b border-gray-200 mb-8">
              <nav className="-mb-px flex space-x-8 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'properties'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Properties
                </button>
                <button
                  onClick={() => setActiveTab('offers')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'offers'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Offers
                </button>
                <button
                  onClick={() => setActiveTab('foreclosures')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'foreclosures'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Foreclosure Listings
                </button>
                <button
                  onClick={() => setActiveTab('bids')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'bids'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  My Bids
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'profile'
                      ? 'border-primary-blue text-primary-blue'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Profile
                </button>
              </nav>
            </div>

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Available Properties</h2>
                </div>
                
                {properties.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <Card key={property.id} className="bg-white shadow">
                        <div className="p-6">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{property.address}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {property.status}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>{property.neighborhood}, {property.borough}</p>
                            <p className="mt-1">{property.beds} bed, {property.baths} bath, {property.sqft} sqft</p>
                          </div>
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-900">
                              ${property.price.toLocaleString()}
                            </span>
                            <Button 
                              variant="primary" 
                              size="sm"
                              onClick={() => handlePropertyOffer(property.id)}
                            >
                              Make Offer
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white shadow">
                    <div className="p-8 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No properties available</h3>
                      <p className="mt-1 text-gray-500">
                        There are currently no properties available. Check back later.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Offers Tab */}
            {activeTab === 'offers' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Property Offers</h2>
                </div>
                
                {offers.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {offers.map((offer) => (
                      <Card key={offer.id} className="bg-white shadow">
                        <div className="p-6">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{offer.propertyAddress}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              {offer.status}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <div className="flex justify-between mt-1">
                              <span>Offer Amount:</span>
                              <span className="font-medium">${offer.offerAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Financing:</span>
                              <span>{offer.financingType}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Submitted:</span>
                              <span>{new Date(offer.submittedAt).toLocaleDateString()}</span>
                            </div>
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
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white shadow">
                    <div className="p-8 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No offers submitted</h3>
                      <p className="mt-1 text-gray-500">
                        You haven't submitted any property offers yet.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Foreclosures Tab */}
            {activeTab === 'foreclosures' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Foreclosure Listings</h2>
                </div>
                
                {foreclosureListings.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {foreclosureListings.map((listing) => (
                      <Card key={listing.id} className="bg-white shadow">
                        <div className="p-6">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{listing.address}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              {listing.status}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <p>{listing.county} County</p>
                            <p className="mt-1">{listing.beds} bed, {listing.baths} bath, {listing.sqft} sqft</p>
                            <p className="mt-1">Auction Date: {new Date(listing.auctionDate).toLocaleDateString()}</p>
                          </div>
                          <div className="mt-4">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-500">Starting Bid:</span>
                              <span className="text-lg font-bold text-gray-900">
                                ${listing.startingBid.toLocaleString()}
                              </span>
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
                ) : (
                  <Card className="bg-white shadow">
                    <div className="p-8 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No foreclosure listings available</h3>
                      <p className="mt-1 text-gray-500">
                        There are currently no foreclosure listings available. Check back later.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* Bids Tab */}
            {activeTab === 'bids' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">My Foreclosure Bids</h2>
                </div>
                
                {foreclosureBids.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {foreclosureBids.map((bid) => (
                      <Card key={bid.id} className="bg-white shadow">
                        <div className="p-6">
                          <div className="flex justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{bid.propertyAddress}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {bid.status}
                            </span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            <div className="flex justify-between mt-1">
                              <span>Bid Amount:</span>
                              <span className="font-medium">${parseInt(bid.bidAmount).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Auction Date:</span>
                              <span>{new Date(bid.auctionDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between mt-1">
                              <span>Submitted:</span>
                              <span>{new Date(bid.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {bid.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-xs text-gray-500">{bid.notes}</p>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-white shadow">
                    <div className="p-8 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <h3 className="mt-2 text-lg font-medium text-gray-900">No bids submitted</h3>
                      <p className="mt-1 text-gray-500">
                        You haven't submitted any foreclosure bids yet.
                      </p>
                      <div className="mt-6">
                        <Button 
                          variant="primary" 
                          onClick={() => setActiveTab('foreclosures')}
                        >
                          View Foreclosure Listings
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
                      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Full Name</label>
                          <p className="mt-1 text-sm text-gray-900">{user.firstName} {user.lastName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email</label>
                          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Institution</label>
                          <p className="mt-1 text-sm text-gray-900">{user.institutionName}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Job Title</label>
                          <p className="mt-1 text-sm text-gray-900">{user.jobTitle}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Work Phone</label>
                          <p className="mt-1 text-sm text-gray-900">{user.workPhone}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Personal Phone</label>
                          <p className="mt-1 text-sm text-gray-900">{user.personalPhone}</p>
                        </div>
                      </div>
                      
                      <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription Status</h3>
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.hasForeclosureSubscription 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.hasForeclosureSubscription ? 'Active' : 'Pending Activation'}
                          </span>
                          <span className="ml-3 text-sm text-gray-500">
                            {user.hasForeclosureSubscription 
                              ? 'Full access to foreclosure listings' 
                              : 'Contact admin to activate foreclosure access'}
                          </span>
                        </div>
                      </div>
                      
                      {/* Business Card Section */}
                      {user.businessCardUrl && (
                        <div className="mt-8">
                          <h3 className="text-lg font-medium text-gray-900 mb-4">Business Card</h3>
                          <div className="border border-gray-200 rounded-lg p-4">
                            <p className="text-sm text-gray-500 mb-2">Your business card for verification:</p>
                            <div className="flex items-center space-x-4">
                              <a 
                                href={user.businessCardUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                View Business Card
                              </a>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Submitted
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
                
                <div>
                  <Card className="bg-white shadow">
                    <div className="p-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h2>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-center">
                          Edit Profile
                        </Button>
                        <Button variant="outline" className="w-full justify-center">
                          Change Password
                        </Button>
                        <Button variant="outline" className="w-full justify-center">
                          Subscription Settings
                        </Button>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InstitutionalDashboard;