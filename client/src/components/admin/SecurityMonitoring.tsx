import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface SecurityEvent {
  id: string;
  type: 'login' | 'failed_login' | 'password_reset' | 'suspicious_activity';
  user: string;
  ip: string;
  location: string;
  timestamp: string;
  status: 'resolved' | 'pending' | 'investigating';
}

const SecurityMonitoring: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<SecurityEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Check if user is admin
    if (user && user.userType !== 'admin') {
      navigate('/');
      return;
    }
    
    // Fetch security events
    fetchSecurityEvents();
  }, [user, navigate]);

  const fetchSecurityEvents = async () => {
    try {
      const response = await fetch('/api/admin/security/events', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch security events');
      }
      
      const data = await response.json();
      setEvents(data);
      setFilteredEvents(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching security events:', error);
      // Fallback to mock data
      const mockEvents: SecurityEvent[] = [
        {
          id: '1',
          type: 'failed_login',
          user: 'johndoe',
          ip: '192.168.1.100',
          location: 'New York, NY',
          timestamp: '2023-04-15T14:30:00Z',
          status: 'pending'
        },
        {
          id: '2',
          type: 'login',
          user: 'adminuser',
          ip: '192.168.1.50',
          location: 'New York, NY',
          timestamp: '2023-04-15T12:15:00Z',
          status: 'resolved'
        },
        {
          id: '3',
          type: 'suspicious_activity',
          user: 'seller123',
          ip: '104.28.29.10',
          location: 'Unknown',
          timestamp: '2023-04-15T10:45:00Z',
          status: 'investigating'
        },
        {
          id: '4',
          type: 'password_reset',
          user: 'janedoe',
          ip: '192.168.1.75',
          location: 'Brooklyn, NY',
          timestamp: '2023-04-15T09:20:00Z',
          status: 'resolved'
        }
      ];
      
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = events;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(event => 
        event.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.ip.includes(searchTerm) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(event => event.type === typeFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(event => event.status === statusFilter);
    }
    
    setFilteredEvents(result);
  }, [searchTerm, typeFilter, statusFilter, events]);

  const handleEventAction = async (eventId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/security/events/${eventId}/resolve`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to perform action on security event');
      }
      
      const data = await response.json();
      if (data.success) {
        // Update the event status in the local state
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId ? { ...event, status: data.status } : event
          )
        );
        setFilteredEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === eventId ? { ...event, status: data.status } : event
          )
        );
        alert(`Action ${action} performed on event ${eventId}`);
      } else {
        alert(`Failed to perform action: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error performing action on security event:', error);
      alert('Network error. Please try again.');
    }
  };

  if (!user || user.userType !== 'admin') {
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security Monitoring</h1>
              <p className="mt-2 text-gray-600">Monitor and respond to security events</p>
            </div>
          </div>
        </div>

        {/* Security Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Failed Logins</h3>
                  <p className="text-2xl font-semibold text-gray-900">12</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Suspicious Activity</h3>
                  <p className="text-2xl font-semibold text-gray-900">3</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Resolved Issues</h3>
                  <p className="text-2xl font-semibold text-gray-900">24</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-white shadow">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Active Sessions</h3>
                  <p className="text-2xl font-semibold text-gray-900">42</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <Select
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'login', label: 'Login' },
                    { value: 'failed_login', label: 'Failed Login' },
                    { value: 'password_reset', label: 'Password Reset' },
                    { value: 'suspicious_activity', label: 'Suspicious Activity' }
                  ]}
                  value={typeFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTypeFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'resolved', label: 'Resolved' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'investigating', label: 'Investigating' }
                  ]}
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setTypeFilter('all');
                    setStatusFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
          </div>
        ) : (
          <Card className="bg-white shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP & Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 capitalize">
                            {event.type.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {event.user}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{event.ip}</div>
                          <div className="text-sm text-gray-500">{event.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(event.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${event.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                              event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEventAction(event.id, 'view')}
                            >
                              View
                            </Button>
                            {event.status !== 'resolved' && (
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => handleEventAction(event.id, 'resolve')}
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No security events found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SecurityMonitoring;