import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

type AuthMode = 'signin' | 'signup';

const SellerAuth: React.FC = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    phone: '',
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
      const result = await login({
        username: formData.username,
        password: formData.password,
        userType: 'seller'
      });

      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/dashboard');
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
      const requestData = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        phone: formData.phone,
        userType: 'seller' as const
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
          company: '',
          phone: '',
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
            {authMode === 'signin' ? 'Seller Portal Sign In' : 'Join as a Selling Partner'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {authMode === 'signin' ? (
              <>
                Don't have a seller account?{' '}
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

        {/* Benefits Section for Sign Up */}
        {authMode === 'signup' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Seller Benefits</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                List your properties to qualified investors
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Manage offers and communications
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Access to our investor network
              </li>
              <li className="flex items-center">
                <span className="text-green-600 mr-2">✓</span>
                Professional listing management tools
              </li>
            </ul>
          </div>
        )}

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
                    Email Address
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

                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    Company/Organization (Optional)
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
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

                {/* Terms and Conditions */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    By creating an account, you agree to our seller terms and conditions. 
                    All listings are subject to admin approval before going live.
                  </p>
                </div>
              </>
            )}
          </div>

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
              {loading ? 'Processing...' : (authMode === 'signin' ? 'Sign In' : 'Create Seller Account')}
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
                onClick={() => navigate('/auth/investor')}
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Are you an investor? Join as an investor →
              </button>
            </div>
          </div>
        </form>

        {/* Additional Information */}
        {authMode === 'signup' && (
          <div className="bg-accent-yellow/10 border border-accent-yellow/20 rounded-lg p-4">
            <h4 className="font-medium text-accent-yellow mb-2">Application Process</h4>
            <ol className="text-sm text-accent-yellow space-y-1 list-decimal list-inside">
              <li>Submit your seller application</li>
              <li>Verify your email and phone number</li>
              <li>Wait for admin approval (usually 24-48 hours)</li>
              <li>Start listing your properties</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerAuth;
