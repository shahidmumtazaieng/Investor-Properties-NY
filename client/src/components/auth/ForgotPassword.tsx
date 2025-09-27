import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

type UserType = 'common' | 'institutional' | 'seller';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userType, setUserType] = useState<UserType>(() => {
    const type = searchParams.get('type');
    if (type === 'institutional' || type === 'seller') {
      return type;
    }
    return 'common';
  });
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic email validation
    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      // Map user type to backend expected values
      let backendUserType = '';
      switch (userType) {
        case 'common':
          backendUserType = 'common_investor';
          break;
        case 'institutional':
          backendUserType = 'institutional_investor';
          break;
        case 'seller':
          backendUserType = 'seller';
          break;
      }

      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          userType: backendUserType
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
      } else {
        setError(data.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (userType) {
      case 'institutional':
        return 'Institutional Investor Password Reset';
      case 'seller':
        return 'Seller Partner Password Reset';
      default:
        return 'Investor Password Reset';
    }
  };

  const getDescription = () => {
    switch (userType) {
      case 'institutional':
        return 'Enter your institutional investor account email address and we will send you instructions to reset your password.';
      case 'seller':
        return 'Enter your seller partner account email address and we will send you instructions to reset your password.';
      default:
        return 'Enter your investor account email address and we will send you instructions to reset your password.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {getTitle()}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {getDescription()}
          </p>
        </div>

        {/* User Type Selection */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Account Type</h3>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setUserType('common')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                userType === 'common'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">Common Investor</div>
            </button>
            <button
              type="button"
              onClick={() => setUserType('institutional')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                userType === 'institutional'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">Institutional</div>
            </button>
            <button
              type="button"
              onClick={() => setUserType('seller')}
              className={`p-3 rounded-lg border-2 transition-colors ${
                userType === 'seller'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-sm font-medium">Seller</div>
            </button>
          </div>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="your.email@example.com"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-blue hover:bg-primary-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
              </button>
            </div>
          </div>
        </form>

        {/* Back to Login */}
        <div className="text-center">
          <button
            onClick={() => {
              if (userType === 'seller') {
                navigate('/auth/seller');
              } else {
                navigate('/auth/investor');
              }
            }}
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;