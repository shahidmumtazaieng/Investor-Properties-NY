import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';

interface Property {
  id: string;
  address: string;
  neighborhood: string;
  borough: string;
  propertyType: string;
  beds: number;
  baths: number;
  sqft: number;
  price: number;
  description: string;
  status: string;
  views: number;
  offers: number;
  createdAt: string;
  images: string[];
  features: string[];
}

const SellerProperties: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [propertyForm, setPropertyForm] = useState<Omit<Property, 'id' | 'status' | 'views' | 'offers' | 'createdAt' | 'images'>>({
    address: '',
    neighborhood: '',
    borough: '',
    propertyType: '',
    beds: 0,
    baths: 0,
    sqft: 0,
    price: 0,
    description: '',
    features: []
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    // Check if user is seller
    if (user && user.userType !== 'seller') {
      navigate('/');
      return;
    }
    
    // Fetch properties
    fetchProperties();
  }, [user, navigate]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seller/properties', {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.properties) {
        setProperties(data.properties);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setLoading(false);
    }
  };

  const handlePropertyFormChange = (field: keyof typeof propertyForm, value: any) => {
    setPropertyForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim() && !propertyForm.features.includes(newFeature.trim())) {
      handlePropertyFormChange('features', [...propertyForm.features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (feature: string) => {
    handlePropertyFormChange('features', propertyForm.features.filter(f => f !== feature));
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const response = await fetch('/api/seller/properties', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(propertyForm),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Property submitted for review!');
        // Reset form
        setPropertyForm({
          address: '',
          neighborhood: '',
          borough: '',
          propertyType: '',
          beds: 0,
          baths: 0,
          sqft: 0,
          price: 0,
          description: '',
          features: []
        });
        setActiveTab('list');
        fetchProperties(); // Refresh the property list
      } else {
        alert(data.message || 'Failed to submit property');
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error submitting property:', error);
      alert('Error submitting property');
      setLoading(false);
    }
  };

  if (!user || user.userType !== 'seller') {
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
              <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
              <p className="mt-2 text-gray-600">Manage your property listings</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                variant="primary" 
                onClick={() => setActiveTab('create')}
              >
                Add New Property
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Properties
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'create'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Add Property
            </button>
          </nav>
        </div>

        {/* Property List */}
        {activeTab === 'list' && (
          <Card className="bg-white shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Your Properties</h2>
                <span className="text-sm text-gray-500">{properties.length} properties</span>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
                </div>
              ) : properties.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specs
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Analytics
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {properties.map((property) => (
                        <tr key={property.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{property.address}</div>
                            <div className="text-sm text-gray-500">{property.propertyType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{property.neighborhood}</div>
                            <div className="text-sm text-gray-500">{property.borough}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {property.beds} bed, {property.baths} bath, {property.sqft} sqft
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${property.price.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${property.status === 'active' ? 'bg-green-100 text-green-800' : 
                                property.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {property.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{property.views} views</div>
                            <div>{property.offers} offers</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/seller/properties/${property.id}`)}
                              >
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => navigate(`/seller/properties/${property.id}/edit`)}
                              >
                                Edit
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No properties found. Add your first property using the button above.</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Add Property Form */}
        {activeTab === 'create' && (
          <Card className="bg-white shadow mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Add New Property</h2>
              <form onSubmit={handleSubmitProperty}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <Input
                      type="text"
                      required
                      value={propertyForm.address}
                      onChange={(e) => handlePropertyFormChange('address', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Neighborhood *</label>
                    <Input
                      type="text"
                      required
                      value={propertyForm.neighborhood}
                      onChange={(e) => handlePropertyFormChange('neighborhood', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Borough *</label>
                    <Select
                      options={[
                        { value: '', label: 'Select Borough' },
                        { value: 'Manhattan', label: 'Manhattan' },
                        { value: 'Brooklyn', label: 'Brooklyn' },
                        { value: 'Queens', label: 'Queens' },
                        { value: 'Bronx', label: 'Bronx' },
                        { value: 'Staten Island', label: 'Staten Island' }
                      ]}
                      value={propertyForm.borough}
                      onChange={(e) => handlePropertyFormChange('borough', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                    <Select
                      options={[
                        { value: '', label: 'Select Type' },
                        { value: 'Single Family', label: 'Single Family' },
                        { value: 'Condo', label: 'Condo' },
                        { value: 'Townhouse', label: 'Townhouse' },
                        { value: 'Multi-Family', label: 'Multi-Family' },
                        { value: 'Commercial', label: 'Commercial' }
                      ]}
                      value={propertyForm.propertyType}
                      onChange={(e) => handlePropertyFormChange('propertyType', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <Input
                      type="number"
                      min="0"
                      value={propertyForm.beds}
                      onChange={(e) => handlePropertyFormChange('beds', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={propertyForm.baths}
                      onChange={(e) => handlePropertyFormChange('baths', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                    <Input
                      type="number"
                      min="0"
                      value={propertyForm.sqft}
                      onChange={(e) => handlePropertyFormChange('sqft', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                    <Input
                      type="number"
                      min="0"
                      required
                      value={propertyForm.price}
                      onChange={(e) => handlePropertyFormChange('price', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea
                    rows={4}
                    value={propertyForm.description}
                    onChange={(e) => handlePropertyFormChange('description', e.target.value)}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      placeholder="Add a feature"
                      className="flex-grow"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddFeature}
                    >
                      Add
                    </Button>
                  </div>
                  {propertyForm.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {propertyForm.features.map((feature, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                        >
                          {feature}
                          <button
                            type="button"
                            className="ml-2 inline-flex items-center"
                            onClick={() => handleRemoveFeature(feature)}
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setPropertyForm({
                        address: '',
                        neighborhood: '',
                        borough: '',
                        propertyType: '',
                        beds: 0,
                        baths: 0,
                        sqft: 0,
                        price: 0,
                        description: '',
                        features: []
                      });
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit for Review'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SellerProperties;