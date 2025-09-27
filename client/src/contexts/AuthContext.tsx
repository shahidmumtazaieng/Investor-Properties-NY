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
  hasForeclosureSubscription?: boolean;
  subscriptionPlan?: string;
  status?: string;
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
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
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
      const response = await fetch('/api/auth/status', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
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
      } else {
        endpoint = '/api/auth/investors/login';
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: loginData.username,
          password: loginData.password,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        return {
          success: true,
          message: data.message || 'Login successful',
          user: data.user
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
      
      const endpoint = registerData.userType === 'institutional_investor'
        ? '/api/auth/institutional/register'
        : '/api/auth/investors/register';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Don't auto-login for registrations that require verification/approval
        if (data.user && !data.requiresVerification && !data.requiresApproval) {
          setUser(data.user);
        }
        return {
          success: true,
          message: data.message || 'Registration successful',
          user: data.user
        };
      } else {
        return {
          success: false,
          message: data.message || 'Registration failed'
        };
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

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  // Add a timeout to ensure loading doesn't hang indefinitely
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, [loading]);

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    signup: register,
    register
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};