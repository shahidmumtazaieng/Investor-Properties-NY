import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type InvestorType = 'common' | 'institutional';
type AuthMode = 'signin' | 'signup';

// Common investor experience options
const investmentExperienceOptions = [
  'First Time Bidder',
  '1-2 Years Experience',
  '3-5 Years Experience',
  '5+ Years Experience'
];

// Common investor budget options
const investmentBudgetOptions = [
  'Under $100K',
  '$100K - $250K',
  '$250K - $500K',
  '$500K - $1M',
  '$1M+'
];

// Common investor preferred areas
const preferredAreas = [
  'Manhattan',
  'Brooklyn',
  'Queens',
  'Bronx',
  'Staten Island'
];

const InvestorAuth: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [investorType, setInvestorType] = useState<InvestorType>('common');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get plan from URL params for direct subscription flow
  const planFromUrl = searchParams.get('plan');

  // Common investor additional fields
  const [commonInvestorData, setCommonInvestorData] = useState({
    investmentExperience: '',
    investmentBudget: '',
    preferredAreas: [] as string[]
  });

  // Institutional investor additional fields
  const [institutionalInvestorData, setInstitutionalInvestorData] = useState({
    fullName: '',
    jobTitle: '',
    workPhone: '',
    personalPhone: '',
    institutionName: '',
    institutionalEmail: '',
    businessCard: null as File | null
  });

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleCommonInvestorChange = (field: string, value: string | string[]) => {
    setCommonInvestorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleInstitutionalInvestorChange = (field: string, value: string | File | null) => {
    setInstitutionalInvestorData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAreaChange = (area: string) => {
    setCommonInvestorData(prev => {
      const newAreas = prev.preferredAreas.includes(area)
        ? prev.preferredAreas.filter(a => a !== area)
        : [...prev.preferredAreas, area];
      
      return {
        ...prev,
        preferredAreas: newAreas
      };
    });
  };

  const handleBusinessCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a valid file (JPEG, PNG, or PDF)');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File size must be less than 5MB');
        return;
      }
      
      handleInstitutionalInvestorChange('businessCard', file);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const userType = investorType === 'common' ? 'common_investor' : 'institutional_investor';
      const result = await login({
        username: formData.username,
        password: formData.password,
        userType
      });

      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        // Redirect to dashboard based on investor type
        setTimeout(() => {
          if (investorType === 'common') {
            navigate('/dashboard/investor');
          } else {
            navigate('/dashboard/institutional');
          }
        }, 1500);
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    // Additional validation for common investors
    if (investorType === 'common' && authMode === 'signup') {
      if (!formData.firstName.trim()) {
        setError('First name is required');
        setLoading(false);
        return;
      }
      if (!formData.lastName.trim()) {
        setError('Last name is required');
        setLoading(false);
        return;
      }
      if (!formData.phone.trim()) {
        setError('Phone number is required');
        setLoading(false);
        return;
      }
      if (!commonInvestorData.investmentExperience) {
        setError('Please select your investment experience');
        setLoading(false);
        return;
      }
      if (!commonInvestorData.investmentBudget) {
        setError('Please select your investment budget');
        setLoading(false);
        return;
      }
      if (commonInvestorData.preferredAreas.length === 0) {
        setError('Please select at least one preferred area');
        setLoading(false);
        return;
      }
    }

    // Additional validation for institutional investors
    if (investorType === 'institutional' && authMode === 'signup') {
      if (!institutionalInvestorData.fullName.trim()) {
        setError('Full name is required');
        setLoading(false);
        return;
      }
      if (!institutionalInvestorData.jobTitle.trim()) {
        setError('Job title is required');
        setLoading(false);
        return;
      }
      if (!institutionalInvestorData.workPhone.trim()) {
        setError('Work phone number is required');
        setLoading(false);
        return;
      }
      if (!institutionalInvestorData.personalPhone.trim()) {
        setError('Personal phone number is required');
        setLoading(false);
        return;
      }
      if (!institutionalInvestorData.institutionName.trim()) {
        setError('Institution name is required');
        setLoading(false);
        return;
      }
      if (!institutionalInvestorData.institutionalEmail.trim()) {
        setError('Institutional email is required');
        setLoading(false);
        return;
      }
      // Note: Business card is optional
    }

    try {
      const userType = investorType === 'common' ? 'common_investor' : 'institutional_investor';
      
      // Prepare request data
      const requestData: any = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        userType,
        ...(planFromUrl && { subscriptionPlan: planFromUrl })
      };

      // Add common investor data
      if (investorType === 'common' && authMode === 'signup') {
        requestData.investmentExperience = commonInvestorData.investmentExperience;
        requestData.investmentBudget = commonInvestorData.investmentBudget;
        requestData.preferredAreas = commonInvestorData.preferredAreas;
      }

      // Add institutional investor data
      if (investorType === 'institutional' && authMode === 'signup') {
        requestData.institutionalData = {
          fullName: institutionalInvestorData.fullName,
          jobTitle: institutionalInvestorData.jobTitle,
          workPhone: institutionalInvestorData.workPhone,
          personalPhone: institutionalInvestorData.personalPhone,
          institutionName: institutionalInvestorData.institutionName,
          institutionalEmail: institutionalInvestorData.institutionalEmail
          // Note: Business card would need to be handled separately in a real implementation
        };
      }

      const result = await register(requestData);

      if (result.success) {
        setSuccess(result.message || 'Registration successful! Please check your email for verification.');
        // Clear form
        setFormData({
          username: '',
          password: '',
          confirmPassword: '',
          email: '',
          firstName: '',
          lastName: '',
          phone: '',
        });
        setCommonInvestorData({
          investmentExperience: '',
          investmentBudget: '',
          preferredAreas: []
        });
        setInstitutionalInvestorData({
          fullName: '',
          jobTitle: '',
          workPhone: '',
          personalPhone: '',
          institutionName: '',
          institutionalEmail: '',
          businessCard: null
        });
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {authMode === 'signin' ? 'Sign in to your account' : 'Create your investor account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {authMode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setAuthMode('signup')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setAuthMode('signin')}
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Legend for required fields */}
        {authMode === 'signup' && (
          <div className="text-sm text-gray-500 flex items-center justify-end">
            <span className="text-red-500 mr-1">*</span> Required field
          </div>
        )}

        {/* Investor Type Selection */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Investor Type</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setInvestorType('common')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                investorType === 'common'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">Common Investor</div>
              <div className="text-xs text-gray-500">Individual investors</div>
            </button>
            <button
              type="button"
              onClick={() => setInvestorType('institutional')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                investorType === 'institutional'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">Institutional</div>
              <div className="text-xs text-gray-500">Companies & funds</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={authMode === 'signin' ? handleSignIn : handleSignUp}>
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            {/* Institutional Investor Benefits (only shown for institutional investors during signup) */}
            {investorType === 'institutional' && authMode === 'signup' && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="text-md font-medium text-blue-800 mb-2">Institutional Investor Benefits</h4>
                <ul className="text-sm text-blue-700 list-disc pl-5 space-y-1">
                  <li>Priority access to high-value foreclosure auctions</li>
                  <li>Dedicated institutional support team</li>
                  <li>Bulk purchase opportunities</li>
                  <li>Custom market analysis and reports</li>
                  <li>Direct pipeline from courthouse steps</li>
                </ul>
              </div>
            )}

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Sign Up Additional Fields */}
            {authMode === 'signup' && (
              <>
                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Name - Only for common investors, institutional investors use separate fields */}
                {investorType === 'common' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Phone - Only for common investors, institutional investors use separate fields */}
                {investorType === 'common' && (
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* Common Investor Additional Fields */}
                {investorType === 'common' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Investment Experience <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={commonInvestorData.investmentExperience}
                        onChange={(e) => handleCommonInvestorChange('investmentExperience', e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select your experience level</option>
                        {investmentExperienceOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Investment Budget <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={commonInvestorData.investmentBudget}
                        onChange={(e) => handleCommonInvestorChange('investmentBudget', e.target.value)}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select your budget range</option>
                        {investmentBudgetOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Areas <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {preferredAreas.map(area => (
                          <div key={area} className="flex items-center">
                            <input
                              id={`area-${area}`}
                              type="checkbox"
                              checked={commonInvestorData.preferredAreas.includes(area)}
                              onChange={() => handleAreaChange(area)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`area-${area}`} className="ml-2 text-sm text-gray-700">
                              {area}
                            </label>
                          </div>
                        ))}
                      </div>
                      {commonInvestorData.preferredAreas.length === 0 && (
                        <p className="text-red-500 text-sm mt-1">Please select at least one preferred area</p>
                      )}
                    </div>
                  </>
                )}

                {/* Institutional Investor Additional Fields */}
                {investorType === 'institutional' && (
                  <>
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        value={institutionalInvestorData.fullName}
                        onChange={(e) => handleInstitutionalInvestorChange('fullName', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                        Job Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="jobTitle"
                        name="jobTitle"
                        type="text"
                        required
                        value={institutionalInvestorData.jobTitle}
                        onChange={(e) => handleInstitutionalInvestorChange('jobTitle', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="workPhone" className="block text-sm font-medium text-gray-700">
                          Work Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="workPhone"
                          name="workPhone"
                          type="tel"
                          required
                          value={institutionalInvestorData.workPhone}
                          onChange={(e) => handleInstitutionalInvestorChange('workPhone', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="personalPhone" className="block text-sm font-medium text-gray-700">
                          Personal Phone Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="personalPhone"
                          name="personalPhone"
                          type="tel"
                          required
                          value={institutionalInvestorData.personalPhone}
                          onChange={(e) => handleInstitutionalInvestorChange('personalPhone', e.target.value)}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700">
                        Institution Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="institutionName"
                        name="institutionName"
                        type="text"
                        required
                        value={institutionalInvestorData.institutionName}
                        onChange={(e) => handleInstitutionalInvestorChange('institutionName', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="institutionalEmail" className="block text-sm font-medium text-gray-700">
                        Institutional Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="institutionalEmail"
                        name="institutionalEmail"
                        type="email"
                        required
                        value={institutionalInvestorData.institutionalEmail}
                        onChange={(e) => handleInstitutionalInvestorChange('institutionalEmail', e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Business Card Attachment
                      </label>
                      <p className="text-xs text-gray-500 mb-2">
                        Upload your business card (JPEG, PNG, or PDF). Max file size: 5MB
                      </p>
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleBusinessCardChange}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                      {institutionalInvestorData.businessCard && (
                        <p className="mt-1 text-sm text-gray-600">
                          Selected: {institutionalInvestorData.businessCard.name}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Plan Information */}
          {planFromUrl && authMode === 'signup' && (
            <div className="bg-success-green/10 border border-success-green/20 rounded-lg p-4">
              <h4 className="font-medium text-success-green">Selected Plan</h4>
              <p className="text-sm text-success-green">
                {planFromUrl === 'monthly' ? 'Monthly Foreclosure Access - $99/month' : 'Yearly Foreclosure Access - $999/year'}
              </p>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-success-green/10 border border-success-green/20 rounded-lg p-4">
              <p className="text-sm text-success-green">{success}</p>
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-blue hover:bg-primary-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Create Account')}
            </button>
          </div>

          {/* Additional Links */}
          <div className="text-center space-y-2">
            <div>
              <button
                type="button"
                onClick={() => navigate('/auth/forgot-password?type=investor')}
                className="text-sm text-primary-blue hover:text-primary-blue-dark"
              >
                Forgot your password?
              </button>
            </div>
            <div>
              <button
                type="button"
                onClick={() => navigate('/auth/seller')}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Are you a seller? Join as a partner →
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestorAuth;