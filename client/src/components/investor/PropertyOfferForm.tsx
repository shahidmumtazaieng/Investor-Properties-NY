import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

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
  description: string;
  condition: string;
  access: string;
}

interface OfferFormData {
  propertyId: string;
  offerAmount: number;
  earnestMoney: number;
  closingDate: string;
  financingType: 'cash' | 'conventional' | 'fha' | 'va' | 'hard_money' | 'other';
  contingencies: string[];
  additionalTerms: string;
  message: string;
}

const PropertyOfferForm: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: propertyId } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<OfferFormData>({
    propertyId: propertyId || '',
    offerAmount: 0,
    earnestMoney: 0,
    closingDate: '',
    financingType: 'cash',
    contingencies: [],
    additionalTerms: '',
    message: ''
  });

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.property) {
        setProperty(data.property);
        setFormData(prev => ({
          ...prev,
          propertyId: data.property.id,
          offerAmount: Math.round(data.property.price * 0.9), // Default to 90% of asking price
          earnestMoney: Math.round(data.property.price * 0.02) // Default to 2% of asking price
        }));
      }
    } catch (err) {
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'offerAmount' || name === 'earnestMoney' ? Number(value) : value
    }));
  };

  const handleContingencyChange = (contingency: string) => {
    setFormData(prev => {
      const contingencies = prev.contingencies.includes(contingency)
        ? prev.contingencies.filter(c => c !== contingency)
        : [...prev.contingencies, contingency];
      
      return {
        ...prev,
        contingencies
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/investor/offers', {
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
        setError(data.message || 'Failed to submit offer');
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

  const financingOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'conventional', label: 'Conventional Loan' },
    { value: 'fha', label: 'FHA Loan' },
    { value: 'va', label: 'VA Loan' },
    { value: 'hard_money', label: 'Hard Money Loan' },
    { value: 'other', label: 'Other' }
  ];

  const contingencyOptions = [
    'Inspection',
    'Appraisal',
    'Financing',
    'Title Search',
    'Sale of Current Home'
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or is no longer available.</p>
          <Button onClick={() => navigate('/properties')}>Browse Properties</Button>
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
          
          <h1 className="text-3xl font-bold text-gray-900">Make an Offer</h1>
          <p className="mt-2 text-gray-600">
            Submit an offer for {property.address}
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
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Offer Submitted!</h3>
                    <p className="mt-1 text-gray-500">
                      Your offer has been submitted successfully. The seller will review it and get back to you.
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
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Property Details</h2>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{property.address}</h3>
                            <p className="text-sm text-gray-500">{property.neighborhood}, {property.borough}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary-blue">${property.price.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">Asking Price</p>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Beds</p>
                            <p className="font-medium">{property.beds}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Baths</p>
                            <p className="font-medium">{property.baths}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Sqft</p>
                            <p className="font-medium">{property.sqft?.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Offer Details</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="offerAmount" className="block text-sm font-medium text-gray-700">
                            Offer Amount ($)
                          </label>
                          <Input
                            id="offerAmount"
                            name="offerAmount"
                            type="number"
                            required
                            min="1"
                            value={formData.offerAmount || ''}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label htmlFor="earnestMoney" className="block text-sm font-medium text-gray-700">
                            Earnest Money ($)
                          </label>
                          <Input
                            id="earnestMoney"
                            name="earnestMoney"
                            type="number"
                            required
                            min="1"
                            value={formData.earnestMoney || ''}
                            onChange={handleInputChange}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700">
                          Proposed Closing Date
                        </label>
                        <Input
                          id="closingDate"
                          name="closingDate"
                          type="date"
                          required
                          value={formData.closingDate}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="mt-4">
                        <label htmlFor="financingType" className="block text-sm font-medium text-gray-700">
                          Financing Type
                        </label>
                        <select
                          id="financingType"
                          name="financingType"
                          required
                          value={formData.financingType}
                          onChange={handleInputChange}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {financingOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Contingencies</h2>
                      <p className="text-sm text-gray-500 mb-3">
                        Select any contingencies you want to include in your offer:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {contingencyOptions.map((contingency) => (
                          <button
                            key={contingency}
                            type="button"
                            onClick={() => handleContingencyChange(contingency)}
                            className={`p-3 rounded-lg border transition-colors text-sm ${
                              formData.contingencies.includes(contingency)
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {contingency}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="additionalTerms" className="block text-sm font-medium text-gray-700">
                        Additional Terms
                      </label>
                      <textarea
                        id="additionalTerms"
                        name="additionalTerms"
                        rows={3}
                        value={formData.additionalTerms}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any additional terms you'd like to include..."
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                        Message to Seller
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Include any personal message or notes for the seller..."
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
                        {submitting ? 'Submitting...' : 'Submit Offer'}
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
                <h2 className="text-lg font-medium text-gray-900 mb-4">Offer Tips</h2>
                <ul className="space-y-3 text-sm text-gray-600">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                    <p className="ml-2">Research comparable sales in the area</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                    <p className="ml-2">Consider including fewer contingencies for a stronger offer</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                    <p className="ml-2">Be realistic with your offer amount</p>
                  </li>
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 text-green-500">✓</div>
                    <p className="ml-2">Include a personal message to connect with the seller</p>
                  </li>
                </ul>
              </div>
            </Card>
            
            <Card className="bg-white shadow mt-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Property Valuation</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Asking Price</span>
                    <span className="font-medium">${property.price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ARV</span>
                    <span className="font-medium">${property.arv?.toLocaleString() || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Profit</span>
                    <span className="font-medium text-green-600">${property.estimatedProfit?.toLocaleString() || 'N/A'}</span>
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

export default PropertyOfferForm;
