import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type InvestorType = 'common' | 'institutional';
type AuthMode = 'signin' | 'signup';

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

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '', // For institutional
    jobTitle: '', // For institutional
    workPhone: '', // For institutional
    personalPhone: '', // For institutional
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
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

    try {
      const userType = investorType === 'common' ? 'common_investor' : 'institutional_investor';
      const requestData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        userType,
        ...(investorType === 'institutional' && {
          company: formData.company,
          jobTitle: formData.jobTitle,
          workPhone: formData.workPhone,
          personalPhone: formData.personalPhone,
        }),
        ...(planFromUrl && { subscriptionPlan: planFromUrl })
      };

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
          company: '',
          jobTitle: '',
          workPhone: '',
          personalPhone: '',
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
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
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
                Password
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
                    Confirm Password
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
                    Email
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

                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
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
                      Last Name
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

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Institutional-specific fields */}
                {investorType === 'institutional' && (
                  <>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                        Company/Institution Name
                      </label>
                      <input
                        id="company"
                        name="company"
                        type="text"
                        required
                        value={formData.company}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">
                        Job Title
                      </label>
                      <input
                        id="jobTitle"
                        name="jobTitle"
                        type="text"
                        required
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
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
                onClick={() => navigate('/auth/forgot-password')}
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
