import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface Offer {
  id: string;
  propertyId: string;
  propertyAddress: string;
  offerAmount: number;
  earnestMoney: number;
  closingDate: string;
  financingType: string;
  contingencies: string[];
  additionalTerms: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  submittedAt: string;
  updatedAt: string;
}

const OfferDetails: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: offerId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [offer, setOffer] = useState<Offer | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (offerId) {
      fetchOfferDetails();
    }
  }, [offerId]);

  const fetchOfferDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/investor/offers/${offerId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.offer) {
        setOffer(data.offer);
      } else {
        setError(data.message || 'Failed to load offer details');
      }
    } catch (err) {
      setError('Failed to load offer details');
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.userType !== 'common_investor' && user.userType !== 'institutional_investor')) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Offer Not Found</h2>
          <p className="text-gray-600 mb-6">The offer you're looking for doesn't exist or is no longer available.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'accepted':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Accepted</span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'countered':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Countered</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            ← Back
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Offer Details</h1>
              <p className="mt-2 text-gray-600">
                Details for your offer on {offer.propertyAddress}
              </p>
            </div>
            <div>
              {getStatusBadge(offer.status)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Offer Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Property Details</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900">{offer.propertyAddress}</h4>
                      <div className="mt-2 flex justify-between">
                        <span className="text-sm text-gray-500">Offer Amount</span>
                        <span className="font-medium">{formatCurrency(offer.offerAmount)}</span>
                      </div>
                      <div className="mt-1 flex justify-between">
                        <span className="text-sm text-gray-500">Earnest Money</span>
                        <span className="font-medium">{formatCurrency(offer.earnestMoney)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Offer Terms</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Closing Date</label>
                        <div className="mt-1 text-sm text-gray-900">{formatDate(offer.closingDate)}</div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Financing Type</label>
                        <div className="mt-1 text-sm text-gray-900">{offer.financingType}</div>
                      </div>
                    </div>
                  </div>

                  {offer.contingencies && offer.contingencies.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Contingencies</h3>
                      <div className="flex flex-wrap gap-2">
                        {offer.contingencies.map((contingency, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                          >
                            {contingency}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {offer.additionalTerms && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Additional Terms</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{offer.additionalTerms}</p>
                      </div>
                    </div>
                  )}

                  {offer.message && (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Message to Seller</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{offer.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="bg-white shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Offer Status</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Submitted</span>
                    <span>{formatDate(offer.submittedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span>{formatDate(offer.updatedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span>{getStatusBadge(offer.status)}</span>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white shadow mt-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h2>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                    <p className="ml-2">Your offer has been submitted to the seller</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                    <p className="ml-2">The seller will review your offer and respond</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                    <p className="ml-2">Check back here for updates on your offer status</p>
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferDetails;