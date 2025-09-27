import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';

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

const SellerOffers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [responseMessage, setResponseMessage] = useState('');
  const [responseAction, setResponseAction] = useState<'accept' | 'reject' | 'counter' | null>(null);

  useEffect(() => {
    // Check if user is seller
    if (user && user.userType !== 'seller') {
      navigate('/');
      return;
    }
    
    // Fetch offers
    fetchOffers();
  }, [user, navigate]);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seller/offers', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.offers) {
        setOffers(data.offers);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching offers:', error);
      setLoading(false);
    }
  };

  const handleRespondToOffer = async (offerId: string, action: 'accept' | 'reject' | 'counter') => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/seller/offers/${offerId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action, message: responseMessage }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Offer ${action}ed successfully!`);
        // Update the offer status in our local state
        setOffers(prev => prev.map(offer => 
          offer.id === offerId ? { ...offer, status: action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'counter' } : offer
        ));
        setSelectedOffer(null);
        setResponseAction(null);
        setResponseMessage('');
      } else {
        alert(data.message || 'Failed to respond to offer');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error responding to offer:', error);
      alert('Error responding to offer');
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
          <h1 className="text-3xl font-bold text-gray-900">Offer Management</h1>
          <p className="mt-2 text-gray-600">Review and respond to offers on your properties</p>
        </div>

        {selectedOffer ? (
          <Card className="bg-white shadow mb-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Offer Details</h2>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedOffer(null);
                    setResponseAction(null);
                    setResponseMessage('');
                  }}
                >
                  Back to Offers
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Property Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium">{selectedOffer.propertyAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Submitted:</span>
                      <span>{new Date(selectedOffer.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Investor Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{selectedOffer.investorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span>{selectedOffer.investorType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{selectedOffer.investorEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span>{selectedOffer.investorPhone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Offer Terms</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Offer Amount:</span>
                      <span className="font-medium text-lg text-green-600">${selectedOffer.offerAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Earnest Money:</span>
                      <span>${selectedOffer.earnestMoney.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Closing Date:</span>
                      <span>{new Date(selectedOffer.closingDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Financing:</span>
                      <span>{selectedOffer.financingType}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contingencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedOffer.contingencies.map((contingency, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {contingency}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Investor Message</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{selectedOffer.message}</p>
                </div>
              </div>

              {responseAction === null && (
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="success" 
                    onClick={() => setResponseAction('accept')}
                  >
                    Accept Offer
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setResponseAction('counter')}
                  >
                    Counter Offer
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setResponseAction('reject')}
                    className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
                  >
                    Reject Offer
                  </Button>
                </div>
              )}

              {responseAction && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {responseAction === 'accept' ? 'Accept Offer' : 
                     responseAction === 'counter' ? 'Counter Offer' : 'Reject Offer'}
                  </h3>
                  
                  {responseAction === 'counter' && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Counter Offer Amount</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
                        placeholder="Enter counter offer amount"
                      />
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {responseAction === 'reject' ? 'Rejection Reason' : 'Message to Investor'}
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue"
                      placeholder={responseAction === 'reject' ? 'Enter rejection reason' : 'Enter your message to the investor'}
                      value={responseMessage || ''}
                      onChange={(e) => setResponseMessage(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button 
                      variant="primary"
                      onClick={() => handleRespondToOffer(selectedOffer.id, responseAction)}
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : 
                       responseAction === 'accept' ? 'Accept Offer' : 
                       responseAction === 'counter' ? 'Send Counter Offer' : 'Reject Offer'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setResponseAction(null);
                        setResponseMessage('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card className="bg-white shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Offers on Your Properties</h2>
                <span className="text-sm text-gray-500">{offers.length} offers</span>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
                </div>
              ) : offers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Investor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Offer Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {offers.map((offer) => (
                        <tr key={offer.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{offer.propertyAddress}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{offer.investorName}</div>
                            <div className="text-sm text-gray-500">{offer.investorType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${offer.offerAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(offer.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                offer.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                                offer.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-blue-100 text-blue-800'}`}>
                              {offer.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOffer(offer)}
                            >
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No offers found on your properties.</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SellerOffers;