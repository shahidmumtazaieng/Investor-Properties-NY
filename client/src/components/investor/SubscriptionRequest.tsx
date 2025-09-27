import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';

interface SubscriptionFormData {
  planType: 'monthly' | 'yearly';
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  investmentExperience: string;
  investmentBudget: string;
  counties: string[];
  additionalRequirements: string;
}

const SubscriptionRequest: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<SubscriptionFormData>({
    planType: 'monthly',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    investmentExperience: '',
    investmentBudget: '',
    counties: [],
    additionalRequirements: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCountyChange = (county: string) => {
    setFormData(prev => {
      const counties = prev.counties.includes(county)
        ? prev.counties.filter(c => c !== county)
        : [...prev.counties, county];
      
      return {
        ...prev,
        counties
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/investor/subscription-request', {
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
        // Reset form except for user info
        setFormData(prev => ({
          planType: 'monthly',
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          email: user?.email || '',
          phone: '',
          investmentExperience: '',
          investmentBudget: '',
          counties: [],
          additionalRequirements: ''
        }));
      } else {
        setError(data.message || 'Failed to submit subscription request');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.userType !== 'common_investor') {
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

  const counties = [
    'Queens',
    'Brooklyn',
    'Manhattan',
    'Bronx',
    'Staten Island',
    'Nassau',
    'Suffolk',
    'Westchester'
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900">Foreclosure Subscription Request</h1>
          <p className="mt-2 text-gray-600">
            Request access to our foreclosure listings and bidding opportunities.
          </p>
        </div>

        <Card className="bg-white shadow">
          <div className="p-6">
            {success ? (
              <div className="text-center py-8">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-2 text-lg font-medium text-gray-900">Request Submitted!</h3>
                <p className="mt-1 text-gray-500">
                  Your subscription request has been submitted. Our team will review it and contact you shortly.
                </p>
                <div className="mt-6">
                  <Button 
                    variant="primary" 
                    onClick={() => navigate('/dashboard')}
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Subscription Plan</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, planType: 'monthly' }))}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        formData.planType === 'monthly'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">Monthly Plan</span>
                        <span className="font-bold">$99/month</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Weekly foreclosure listings with bidding opportunities
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, planType: 'yearly' }))}
                      className={`p-4 rounded-lg border-2 transition-colors text-left ${
                        formData.planType === 'yearly'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">Yearly Plan</span>
                        <span className="font-bold">$999/year</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Save $189 with our annual subscription
                      </p>
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Investment Information</h2>
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
                        <option value="beginner">Beginner (0-2 years)</option>
                        <option value="intermediate">Intermediate (2-5 years)</option>
                        <option value="experienced">Experienced (5+ years)</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="investmentBudget" className="block text-sm font-medium text-gray-700">
                        Investment Budget
                      </label>
                      <select
                        id="investmentBudget"
                        name="investmentBudget"
                        required
                        value={formData.investmentBudget}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select budget range</option>
                        <option value="under_100k">Under $100K</option>
                        <option value="100k_250k">$100K - $250K</option>
                        <option value="250k_500k">$250K - $500K</option>
                        <option value="500k_1m">$500K - $1M</option>
                        <option value="over_1m">Over $1M</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">Preferred Counties</h2>
                  <p className="text-sm text-gray-500 mb-3">
                    Select the counties you're interested in receiving foreclosure listings for:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {counties.map((county) => (
                      <button
                        key={county}
                        type="button"
                        onClick={() => handleCountyChange(county)}
                        className={`p-3 rounded-lg border transition-colors text-sm ${
                          formData.counties.includes(county)
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {county}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="additionalRequirements" className="block text-sm font-medium text-gray-700">
                    Additional Requirements or Notes
                  </label>
                  <textarea
                    id="additionalRequirements"
                    name="additionalRequirements"
                    rows={3}
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
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SubscriptionRequest;