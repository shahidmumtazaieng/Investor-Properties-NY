import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';

interface Property {
  id: string;
  address: string;
  neighborhood: string;
  borough: string;
  propertyType: string;
  price: string;
  seller: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const PropertyApproval: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Check if user is admin
    if (user && user.userType !== 'admin') {
      navigate('/');
      return;
    }
    
    // Fetch properties
    fetchProperties();
  }, [user, navigate]);

  const fetchProperties = async () => {
    try {
      // Simulate API call
      const mockProperties: Property[] = [
        {
          id: '1',
          address: '123 Brooklyn Ave',
          neighborhood: 'Park Slope',
          borough: 'Brooklyn',
          propertyType: 'Condo',
          price: '750000',
          seller: 'John Doe',
          status: 'pending',
          submittedAt: '2023-04-15'
        },
        {
          id: '2',
          address: '456 Queens Blvd',
          neighborhood: 'Long Island City',
          borough: 'Queens',
          propertyType: 'Single Family',
          price: '650000',
          seller: 'Jane Smith',
          status: 'pending',
          submittedAt: '2023-04-18'
        },
        {
          id: '3',
          address: '789 Manhattan St',
          neighborhood: 'Chelsea',
          borough: 'Manhattan',
          propertyType: 'Townhouse',
          price: '1200000',
          seller: 'Bob Johnson',
          status: 'approved',
          submittedAt: '2023-04-10'
        }
      ];
      
      setProperties(mockProperties);
      setFilteredProperties(mockProperties);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = properties;
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(property => 
        property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.seller.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(property => property.status === statusFilter);
    }
    
    setFilteredProperties(result);
  }, [searchTerm, statusFilter, properties]);

  const handlePropertyAction = (propertyId: string, action: 'approve' | 'reject') => {
    // Simulate property action
    console.log(`Property ${propertyId} ${action}d`);
    alert(`Property ${propertyId} ${action}d`);
    
    // Update the property status in the list
    setProperties(prev => prev.map(prop => 
      prop.id === propertyId 
        ? { ...prop, status: action === 'approve' ? 'approved' : 'rejected' } 
        : prop
    ));
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
              <h1 className="text-3xl font-bold text-gray-900">Property Approval</h1>
              <p className="mt-2 text-gray-600">Review and approve property listings</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white shadow mb-6">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <Input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm('');
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
                      Property
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map((property) => (
                      <tr key={property.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{property.address}</div>
                          <div className="text-sm text-gray-500">{property.propertyType} - ${property.price}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{property.neighborhood}</div>
                          <div className="text-sm text-gray-500">{property.borough}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {property.seller}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${property.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              property.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'}`}>
                            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(property.submittedAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {property.status === 'pending' && (
                              <>
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  onClick={() => handlePropertyAction(property.id, 'approve')}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handlePropertyAction(property.id, 'reject')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => console.log(`View details for property ${property.id}`)}
                            >
                              View
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                        No properties found matching your criteria
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

export default PropertyApproval;