import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  userType: 'common_investor' | 'institutional_investor' | 'seller' | 'admin';
  username?: string;
  firstName?: string;
  lastName?: string;
  personName?: string;
  institutionName?: string;
  jobTitle?: string;
  workPhone?: string;
  personalPhone?: string;
  hasForeclosureSubscription?: boolean;
  subscriptionPlan?: string;
  status?: string;
  businessCardUrl?: string;
}

interface LoginData {
  username: string;
  password: string;
  userType: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  userType: string;
  company?: string;
  jobTitle?: string;
  workPhone?: string;
  personalPhone?: string;
  subscriptionPlan?: string;
  businessCard?: File;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<AuthResponse>;
  logout: () => void;
  signup: (data: RegisterData) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
      } else {
        // If token is invalid, remove it
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      // Remove invalid token
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (loginData: LoginData): Promise<AuthResponse> => {
    try {
      setLoading(true);
      
      let endpoint = '';
      if (loginData.userType === 'institutional_investor') {
        endpoint = '/api/auth/institutional/login';
      } else if (loginData.userType === 'admin') {
        endpoint = '/api/auth/admin/login';
      } else if (loginData.userType === 'seller') {
        endpoint = '/api/auth/partners/login';
      } else {
        endpoint = '/api/auth/investors/login';
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      });
      
      const data = await response.json();
      
      if (data.success && data.token) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return {
          success: true,
          message: data.message || 'Login successful',
          user: data.user,
          token: data.token
        };
      } else {
        return {
          success: false,
          message: data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (registerData: RegisterData): Promise<AuthResponse> => {
    try {
      setLoading(true);
      
      // For institutional investors with business card, we need to use FormData
      if (registerData.userType === 'institutional_investor' && registerData.businessCard) {
        const formDataObj = new FormData();
        
        // Add all the form data
        formDataObj.append('username', registerData.username);
        formDataObj.append('password', registerData.password);
        formDataObj.append('email', registerData.email);
        formDataObj.append('firstName', registerData.firstName);
        formDataObj.append('lastName', registerData.lastName);
        formDataObj.append('phone', registerData.phone || '');
        formDataObj.append('userType', registerData.userType);
        formDataObj.append('companyName', registerData.company || '');
        formDataObj.append('jobTitle', registerData.jobTitle || '');
        formDataObj.append('workPhone', registerData.workPhone || '');
        formDataObj.append('personalPhone', registerData.personalPhone || '');
        
        // Add the business card file
        formDataObj.append('businessCard', registerData.businessCard);
        
        // Add plan if available
        if (registerData.subscriptionPlan) {
          formDataObj.append('subscriptionPlan', registerData.subscriptionPlan);
        }
        
        const response = await fetch('/api/auth/institutional/register', {
          method: 'POST',
          body: formDataObj,
        });
        
        const data = await response.json();
        
        if (data.success && data.token) {
          // Store token in localStorage
          localStorage.setItem('token', data.token);
          setUser(data.user);
          return {
            success: true,
            message: data.message || 'Registration successful',
            user: data.user,
            token: data.token
          };
        } else {
          return {
            success: false,
            message: data.message || 'Registration failed'
          };
        }
      } else {
        // Regular registration for other user types
        let endpoint = '';
        if (registerData.userType === 'institutional_investor') {
          endpoint = '/api/auth/institutional/register';
        } else if (registerData.userType === 'seller') {
          endpoint = '/api/auth/partners/register';
        } else {
          endpoint = '/api/auth/investors/register';
        }
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registerData),
        });
        
        const data = await response.json();
        
        if (data.success && data.token) {
          // Store token in localStorage
          localStorage.setItem('token', data.token);
          setUser(data.user);
          return {
            success: true,
            message: data.message || 'Registration successful',
            user: data.user,
            token: data.token
          };
        } else {
          return {
            success: false,
            message: data.message || 'Registration failed'
          };
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    setUser(null);
  };

  // Alias for register
  const signup = register;

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};