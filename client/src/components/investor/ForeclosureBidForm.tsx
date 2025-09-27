import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

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
  yearBuilt: number;
  description: string;
  docketNumber: string;
  plaintiff: string;
  status: string;
}

interface BidFormData {
  foreclosureId: string;
  bidAmount: number;
  maxBidAmount: number;
  investmentExperience: string;
  preferredContactMethod: 'email' | 'phone';
  timeframe: string;
  additionalRequirements: string;
}

const ForeclosureBidForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: foreclosureId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [foreclosure, setForeclosure] = useState<ForeclosureListing | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<BidFormData>({
    foreclosureId: foreclosureId || '',
    bidAmount: 0,
    maxBidAmount: 0,
    investmentExperience: '',
    preferredContactMethod: 'email',
    timeframe: '',
    additionalRequirements: ''
  });

  useEffect(() => {
    if (foreclosureId) {
      fetchForeclosureDetails();
    }
  }, [foreclosureId]);

  const fetchForeclosureDetails = async () => {
    try {
      const response = await fetch(`/api/foreclosures/${foreclosureId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.listing) {
        setForeclosure(data.listing);
        setFormData(prev => ({
          ...prev,
          foreclosureId: data.listing.id,
          bidAmount: data.listing.startingBid || 0,
          maxBidAmount: Math.round((data.listing.startingBid || 0) * 1.2) // Default to 20% above starting bid
        }));
      }
    } catch (err) {
      setError('Failed to load foreclosure details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'bidAmount' || name === 'maxBidAmount' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const endpoint = user?.userType === 'institutional_investor' 
        ? '/api/institutional/foreclosure-bids'
        : '/api/investor/foreclosure-bids';
        
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to submit bid');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
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

  const experienceOptions = [
    'First Time Bidder',
    '1-2 Years Experience',
    '3-5 Years Experience',
    '5+ Years Experience'
  ];

  const timeframeOptions = [
    'Immediately',
    '1-2 Weeks',
    '1 Month',
    '1-3 Months',
    '3+ Months'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  if (!foreclosure) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Foreclosure Not Found</h2>
          <p className="text-gray-600 mb-6">The foreclosure listing you're looking for doesn't exist or is no longer available.</p>
          <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

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
          
          <h1 className="text-3xl font-bold text-gray-900">Place a Bid</h1>
          <p className="mt-2 text-gray-600">
            Submit a bid for {foreclosure.address}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white shadow">
              <div className="p-6">
                {success ? (
                  <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Bid Submitted!</h3>
                    <p className="mt-1 text-gray-500">
                      Your bid has been submitted successfully. We'll contact you with updates.
                    </p>
                    <div className="mt-6">
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/dashboard')}
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Foreclosure Details</h2>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{foreclosure.address}</h3>
                            <p className="text-sm text-gray-500">{foreclosure.county} County</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary-blue">${foreclosure.startingBid?.toLocaleString() || 'N/A'}</p>
                            <p className="text-sm text-gray-500">Starting Bid</p>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Auction Date</p>
                            <p className="font-medium">{new Date(foreclosure.auctionDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Beds</p>
                            <p className="font-medium">{foreclosure.beds || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Baths</p>
                            <p className="font-medium">{foreclosure.baths || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Sqft</p>
                            <p className="font-medium">{foreclosure.sqft?.toLocaleString() || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <p className="text-gray-500">Docket Number</p>
                          <p className="font-medium">{foreclosure.docketNumber || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Bid Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">
                            Your Bid Amount ($)
                          </label>
                          <Input
                            id="bidAmount"
                            name="bidAmount"
                            type="number"
                            required
                            min={foreclosure.startingBid || 0}
                            value={formData.bidAmount || ''}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Must be at least ${foreclosure.startingBid?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label htmlFor="maxBidAmount" className="block text-sm font-medium text-gray-700">
                            Maximum Bid Amount ($)
                          </label>
                          <Input
                            id="maxBidAmount"
                            name="maxBidAmount"
                            type="number"
                            required
                            min={formData.bidAmount || 0}
                            value={formData.maxBidAmount || ''}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Maximum you're willing to bid
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Your Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="investmentExperience" className="block text-sm font-medium text-gray-700">
                            Investment Experience
                          </label>
                          <select
                            id="investmentExperience"
                            name="investmentExperience"
                            required
                            value={formData.investmentExperience}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select experience level</option>
                            {experienceOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700">
                            Investment Timeframe
                          </label>
                          <select
                            id="timeframe"
                            name="timeframe"
                            required
                            value={formData.timeframe}
                            onChange={handleInputChange}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select timeframe</option>
                            {timeframeOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700">
                          Preferred Contact Method
                        </label>
                        <div className="mt-1 grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, preferredContactMethod: 'email' }))}
                            className={`p-3 rounded-lg border transition-colors ${
                              formData.preferredContactMethod === 'email'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            Email
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, preferredContactMethod: 'phone' }))}
                            className={`p-3 rounded-lg border transition-colors ${
                              formData.preferredContactMethod === 'phone'
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            Phone
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="additionalRequirements" className="block text-sm font-medium text-gray-700">
                        Additional Requirements or Notes
                      </label>
                      <textarea
                        id="additionalRequirements"
                        name="additionalRequirements"
                        rows={4}
                        value={formData.additionalRequirements}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any specific requirements or notes for our team..."
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    <div className="flex justify-end space-x-3">
                      <Button 
                        variant="outline" 
                        onClick={() => navigate(-1)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="primary" 
                        type="submit"
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting...' : 'Submit Bid'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="bg-white shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Bidding Tips</h2>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                    <p className="ml-2">Research comparable sales in the area</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                    <p className="ml-2">Set a maximum bid to avoid overbidding</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                    <p className="ml-2">Consider property condition and repair costs</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                    <p className="ml-2">Be prepared for additional costs (legal, inspection, etc.)</p>
                  </li>
                </ul>
              </div>
            </Card>
            
            <Card className="bg-white shadow mt-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Auction Information</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auction Date</span>
                    <span className="font-medium">{new Date(foreclosure.auctionDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starting Bid</span>
                    <span className="font-medium">${foreclosure.startingBid?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-medium">{foreclosure.propertyType || 'N/A'}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Auctions are typically held at the county courthouse. 
                      Please verify the exact location and time with the county.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForeclosureBidForm;