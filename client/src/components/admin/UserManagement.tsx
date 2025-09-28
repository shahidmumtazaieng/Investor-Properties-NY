import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'common_investor' | 'institutional_investor' | 'seller' | 'admin';
  status: 'active' | 'pending' | 'suspended';
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Check if user is admin
    if (user && user.userType !== 'admin') {
      navigate('/');
      return;
    }
    
    // Fetch users
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const usersData = await response.json();
      
      setUsers(usersData);
      setFilteredUsers(usersData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = users;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply user type filter
    if (userTypeFilter !== 'all') {
      result = result.filter(user => user.userType === userTypeFilter);
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, userTypeFilter, statusFilter, users]);

  const handleUserAction = async (userId: string, action: string) => {
    try {
      let response;
      
      switch (action) {
        case 'view':
          // For view action, we could open a modal or navigate to user details page
          console.log(`View user ${userId}`);
          alert(`View details for user ${userId}`);
          break;
        case 'approve':
          // In a real implementation, this would update the user status
          response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ status: 'active' })
          });
          
          if (!response.ok) {
            throw new Error('Failed to approve user');
          }
          
          alert(`User ${userId} approved successfully`);
          // Refresh the user list
          fetchUsers();
          break;
        case 'edit':
          // For edit action, we could open an edit modal
          console.log(`Edit user ${userId}`);
          alert(`Edit user ${userId}`);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this user?')) {
            response = await fetch(`/api/admin/users/${userId}`, {
              method: 'DELETE',
              credentials: 'include'
            });
            
            if (!response.ok) {
              throw new Error('Failed to delete user');
            }
            
            alert(`User ${userId} deleted successfully`);
            // Refresh the user list
            fetchUsers();
          }
          break;
        default:
          console.log(`Action ${action} performed on user ${userId}`);
          break;
      }
    } catch (error: any) {
      console.error(`Error performing action ${action} on user ${userId}:`, error);
      alert(`Failed to perform action: ${error.message || error}`);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (newAdmin.password !== newAdmin.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    if (newAdmin.password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    try {
      const response = await fetch('/api/admin/users/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newAdmin,
          status: 'active'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create admin user');
      }
      
      const result = await response.json();
      alert(result.message);
      
      // Close modal and reset form
      setShowCreateAdminModal(false);
      setNewAdmin({
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: ''
      });
      
      // Refresh user list
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating admin user:', error);
      alert(`Failed to create admin user: ${error.message || error}`);
    }
  };

  const handleNewAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAdmin({
      ...newAdmin,
      [e.target.name]: e.target.value
    });
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
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-2 text-gray-600">Manage all users in the system</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button variant="primary" onClick={() => setShowCreateAdminModal(true)}>
                Add New Admin
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Type</label>
                <Select
                  options={[
                    { value: 'all', label: 'All Types' },
                    { value: 'common_investor', label: 'Common Investor' },
                    { value: 'institutional_investor', label: 'Institutional Investor' },
                    { value: 'seller', label: 'Seller' },
                    { value: 'admin', label: 'Admin' }
                  ]}
                  value={userTypeFilter}
                  onChange={(e) => setUserTypeFilter(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  options={[
                    { value: 'all', label: 'All Statuses' },
                    { value: 'active', label: 'Active' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'suspended', label: 'Suspended' }
                  ]}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
                    setUserTypeFilter('all');
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
                      User
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName} {user.lastName}
                              </div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">
                            {user.userType.replace('_', ' ')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                              user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'view')}
                            >
                              View
                            </Button>
                            {user.status === 'pending' && (
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => handleUserAction(user.id, 'approve')}
                              >
                                Approve
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'edit')}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleUserAction(user.id, 'delete')}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Create Admin Modal */}
      {showCreateAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Create New Admin User</h3>
            </div>
            <form onSubmit={handleCreateAdmin}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <Input
                    type="text"
                    name="username"
                    value={newAdmin.username}
                    onChange={handleNewAdminChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <Input
                    type="email"
                    name="email"
                    value={newAdmin.email}
                    onChange={handleNewAdminChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <Input
                    type="text"
                    name="firstName"
                    value={newAdmin.firstName}
                    onChange={handleNewAdminChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <Input
                    type="text"
                    name="lastName"
                    value={newAdmin.lastName}
                    onChange={handleNewAdminChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Input
                    type="password"
                    name="password"
                    value={newAdmin.password}
                    onChange={handleNewAdminChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={newAdmin.confirmPassword}
                    onChange={handleNewAdminChange}
                    required
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateAdminModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit"
                >
                  Create Admin
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;