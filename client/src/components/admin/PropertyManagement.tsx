import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import * as XLSX from 'xlsx';

interface Property {
  id: string;
  address: string;
  neighborhood: string;
  borough: string;
  propertyType: string;
  beds: number;
  baths: string;
  sqft: number;
  units?: number;
  price: string;
  arv?: string;
  estimatedProfit?: string;
  capRate?: string;
  annualIncome?: string;
  condition: string;
  access: string;
  images: string[];
  description: string;
  status: string;
  source: string;
  isActive: boolean;
  googleSheetsRowId?: string;
  createdAt?: string;
  updatedAt?: string;
  yearBuilt?: number;
  lotSize?: number;
  parkingSpaces?: number;
}

const PropertyManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  
  // Single property form state
  const [propertyForm, setPropertyForm] = useState<Property>({
    id: '',
    address: '',
    neighborhood: '',
    borough: '',
    propertyType: '',
    beds: 0,
    baths: '',
    sqft: 0,
    units: 0,
    price: '',
    arv: '',
    estimatedProfit: '',
    capRate: '',
    annualIncome: '',
    condition: '',
    access: 'Available with Appointment',
    images: [],
    description: '',
    status: 'available',
    source: 'internal',
    isActive: true,
    yearBuilt: new Date().getFullYear(),
    lotSize: 0,
    parkingSpaces: 0,
    createdAt: '',
    updatedAt: ''
  });
  
  // Bulk import state
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [sheetProperties, setSheetProperties] = useState<Record<string, any>[]>([]);
  const [mappedProperties, setMappedProperties] = useState<Record<string, any>[]>([]);
  const [importLoading, setImportLoading] = useState(false);
  
  // Required columns mapping
  const requiredColumns = {
    address: 'Address',
    neighborhood: 'Neighborhood',
    borough: 'Borough',
    propertyType: 'Property Type',
    beds: 'Bedrooms',
    baths: 'Bathrooms',
    sqft: 'Square Feet',
    price: 'Price',
    description: 'Description',
    condition: 'Condition',
    access: 'Access'
  };

  useEffect(() => {
    // Check if user is admin
    if (user && user.userType !== 'admin') {
      navigate('/');
      return;
    }
    
    // Fetch existing properties
    fetchProperties();
  }, [user, navigate]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from the backend
      // For now, we'll use mock data
      const mockProperties: Property[] = [
        {
          id: '1',
          address: '123 Brooklyn Ave',
          neighborhood: 'Park Slope',
          borough: 'Brooklyn',
          propertyType: 'Condo',
          beds: 2,
          baths: '2',
          sqft: 1200,
          price: '750000',
          arv: '850000',
          estimatedProfit: '75000',
          images: ['/placeholder-property.jpg'],
          description: 'Beautiful condo in prime Brooklyn location with modern amenities.',
          status: 'available',
          source: 'internal',
          isActive: true,
          createdAt: '2023-01-15',
          updatedAt: '2023-01-15',
          condition: 'Good',
          access: 'Available with Appointment'
        },
        {
          id: '2',
          address: '456 Queens Blvd',
          neighborhood: 'Long Island City',
          borough: 'Queens',
          propertyType: 'Single Family',
          beds: 3,
          baths: '2.5',
          sqft: 1800,
          price: '650000',
          arv: '750000',
          estimatedProfit: '85000',
          images: ['/placeholder-property.jpg'],
          description: 'Spacious single family home with great potential for renovation.',
          status: 'available',
          source: 'internal',
          isActive: true,
          createdAt: '2023-02-20',
          updatedAt: '2023-02-20',
          condition: 'Fair',
          access: 'Available with Appointment'
        }
      ];
      
      setProperties(mockProperties);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setLoading(false);
    }
  };

  const handlePropertyFormChange = (field: keyof Property, value: any) => {
    setPropertyForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real implementation, this would upload files to a server
    // For now, we'll just add a placeholder URL
    if (e.target.files && e.target.files.length > 0) {
      const newImages = [...propertyForm.images, '/placeholder-property.jpg'];
      setPropertyForm(prev => ({
        ...prev,
        images: newImages
      }));
    }
  };

  const handleSubmitSingleProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // In a real implementation, this would POST to the backend
      console.log('Submitting property:', propertyForm);
      alert('Property submitted successfully!');
      // Reset form
      setPropertyForm({
        id: '',
        address: '',
        neighborhood: '',
        borough: '',
        propertyType: '',
        beds: 0,
        baths: '',
        sqft: 0,
        units: 0,
        price: '',
        arv: '',
        estimatedProfit: '',
        capRate: '',
        annualIncome: '',
        condition: '',
        access: 'Available with Appointment',
        images: [],
        description: '',
        status: 'available',
        source: 'internal',
        isActive: true,
        yearBuilt: new Date().getFullYear(),
        lotSize: 0,
        parkingSpaces: 0,
        createdAt: '',
        updatedAt: ''
      });
      setLoading(false);
    } catch (error) {
      console.error('Error submitting property:', error);
      setLoading(false);
    }
  };

  const handleImportFromGoogleSheets = async () => {
    try {
      setImportLoading(true);
      // In a real implementation, this would connect to Google Sheets API
      // For now, we'll use mock data
      const mockSheetData = [
        {
          address: '789 Manhattan St',
          neighborhood: 'Chelsea',
          borough: 'Manhattan',
          propertyType: 'Townhouse',
          beds: 4,
          baths: '3.5',
          sqft: 2200,
          price: '1200000',
          description: 'Luxury townhouse in the heart of Chelsea.',
          condition: 'Excellent',
          access: 'Available with Appointment'
        },
        {
          address: '321 Bronx Ave',
          neighborhood: 'Riverdale',
          borough: 'Bronx',
          propertyType: 'Multi-Family',
          beds: 6,
          baths: '4',
          sqft: 3000,
          price: '850000',
          description: 'Investment property with multiple rental units.',
          condition: 'Good',
          access: 'Available with Appointment'
        }
      ];
      
      setSheetProperties(mockSheetData);
      setImportLoading(false);
      alert('Properties imported successfully from Google Sheets!');
    } catch (error) {
      console.error('Error importing from Google Sheets:', error);
      setImportLoading(false);
    }
  };

  const handlePublishProperties = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/admin/properties/import/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ properties: mappedProperties }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`${data.properties.length} properties published successfully!`);
        setSheetProperties([]);
        setMappedProperties([]);
        setColumnMapping({});
        setFileColumns([]);
        // Refresh the properties list
        fetchProperties();
      } else {
        alert('Failed to publish properties: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error publishing properties:', error);
      alert('Error publishing properties. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (id: string) => {
    try {
      setLoading(true);
      
      // Send notification for the property listing
      const response = await fetch(`/api/admin/properties/${id}/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      
      const data = await response.json();
      console.log('Notification sent:', data);
      
      alert('Notification sent successfully to all registered users!');
      setLoading(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification. Please try again.');
      setLoading(false);
    }
  };

  // New functions for file upload and column mapping
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/properties/import/file', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success && data.properties) {
        setSheetProperties(data.properties);
        
        // Extract column names from the first property
        if (data.properties.length > 0) {
          const firstProperty = data.properties[0];
          const columns = Object.keys(firstProperty);
          setFileColumns(columns);
          
          // Set default column mapping
          const defaultMapping: Record<string, string> = {};
          Object.keys(requiredColumns).forEach(field => {
            // Try to find a matching column by name (case insensitive)
            const matchingColumn = columns.find(col => 
              col.toLowerCase().includes(field.toLowerCase()) || 
              field.toLowerCase().includes(col.toLowerCase())
            );
            if (matchingColumn) {
              defaultMapping[field] = matchingColumn;
            }
          });
          setColumnMapping(defaultMapping);
        }
      } else {
        alert('Failed to import properties: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error importing properties:', error);
      alert('Error importing properties. Please try again.');
    } finally {
      setImportLoading(false);
    }
  };

  const handleColumnMappingChange = (field: string, column: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: column
    }));
  };

  const isMappingComplete = () => {
    return Object.keys(requiredColumns).every(field => columnMapping[field]);
  };

  const applyColumnMapping = () => {
    const mapped = sheetProperties.map(row => {
      const mappedProperty: Record<string, any> = {};
      Object.keys(requiredColumns).forEach(field => {
        const column = columnMapping[field];
        if (column && (row as Record<string, any>)[column] !== undefined) {
          // Handle numeric fields
          if (field === 'beds' || field === 'sqft') {
            mappedProperty[field] = Number((row as Record<string, any>)[column]);
          } else if (field === 'baths') {
            mappedProperty[field] = String((row as Record<string, any>)[column]);
          } else {
            mappedProperty[field] = (row as Record<string, any>)[column];
          }
        }
      });
      return mappedProperty;
    });
    setMappedProperties(mapped);
  };

  const handleImportFromFile = async () => {
    // This function is now handled by the file upload process
    // The import happens when the file is selected
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
              <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
              <p className="mt-2 text-gray-600">Create, import, and manage property listings</p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button 
                variant="primary" 
                onClick={() => navigate('/admin/properties/approval')}
              >
                Property Approval
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('single')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'single'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Single Property Listing
            </button>
            <button
              onClick={() => setActiveTab('bulk')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bulk'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Bulk Import from File
            </button>
          </nav>
        </div>

        {/* Single Property Form */}
        {activeTab === 'single' && (
          <Card className="bg-white shadow mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Property Listing</h2>
              <form onSubmit={handleSubmitSingleProperty}>
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
                      type="text"
                      value={propertyForm.baths}
                      onChange={(e) => handlePropertyFormChange('baths', e.target.value)}
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
                      type="text"
                      required
                      value={propertyForm.price}
                      onChange={(e) => handlePropertyFormChange('price', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                    <Input
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={propertyForm.yearBuilt}
                      onChange={(e) => handlePropertyFormChange('yearBuilt', parseInt(e.target.value) || new Date().getFullYear())}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <Select
                      options={[
                        { value: 'Excellent', label: 'Excellent' },
                        { value: 'Good', label: 'Good' },
                        { value: 'Fair', label: 'Fair' },
                        { value: 'Poor', label: 'Poor' }
                      ]}
                      value={propertyForm.condition}
                      onChange={(e) => handlePropertyFormChange('condition', e.target.value)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Images</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-blue file:text-white
                        hover:file:bg-blue-700"
                    />
                  </div>
                  {propertyForm.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {propertyForm.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Property ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...propertyForm.images];
                              newImages.splice(index, 1);
                              setPropertyForm(prev => ({ ...prev, images: newImages }));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
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
                        id: '',
                        address: '',
                        neighborhood: '',
                        borough: '',
                        propertyType: '',
                        beds: 0,
                        baths: '',
                        sqft: 0,
                        units: 0,
                        price: '',
                        arv: '',
                        estimatedProfit: '',
                        capRate: '',
                        annualIncome: '',
                        condition: '',
                        access: 'Available with Appointment',
                        images: [],
                        description: '',
                        status: 'available',
                        source: 'internal',
                        isActive: true,
                        yearBuilt: new Date().getFullYear(),
                        lotSize: 0,
                        parkingSpaces: 0,
                        createdAt: '',
                        updatedAt: ''
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
                    {loading ? 'Creating...' : 'Create Property Listing'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Bulk Import from File */}
        {activeTab === 'bulk' && (
          <div className="space-y-6">
            <Card className="bg-white shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bulk Import Properties from File</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Excel/CSV File
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileUpload}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-blue file:text-white
                        hover:file:bg-blue-700"
                    />
                    <Button
                      variant="primary"
                      onClick={handleImportFromFile}
                      disabled={importLoading || sheetProperties.length === 0}
                    >
                      {importLoading ? 'Importing...' : 'Import'}
                    </Button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Upload an Excel (.xlsx, .xls) or CSV file with property data. 
                    The file should contain columns for: address, neighborhood, borough, propertyType, beds, baths, sqft, price, description, etc.
                  </p>
                </div>
                
                {/* Column Mapping Section */}
                {sheetProperties.length > 0 && columnMapping && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Map Columns</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Match your file columns to the required property fields:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Object.keys(requiredColumns).map((field) => (
                        <div key={field} className="flex items-center">
                          <label className="block text-sm font-medium text-gray-700 w-32">
                            {requiredColumns[field as keyof typeof requiredColumns]}:
                          </label>
                          <select
                            value={columnMapping[field] || ''}
                            onChange={(e) => handleColumnMappingChange(field, e.target.value)}
                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="">Select column</option>
                            {fileColumns.map((col) => (
                              <option key={col} value={col}>{col}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button
                        variant="secondary"
                        onClick={applyColumnMapping}
                        disabled={isMappingComplete()}
                      >
                        Apply Mapping
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {sheetProperties.length > 0 && mappedProperties.length > 0 && (
              <Card className="bg-white shadow">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Imported Properties ({mappedProperties.length})
                  </h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Address
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Specs
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {mappedProperties.map((property, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{property.address}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{property.neighborhood}</div>
                              <div className="text-sm text-gray-500">{property.borough}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {property.propertyType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {property.beds} bed, {property.baths} bath, {property.sqft} sqft
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ${property.price}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button
                      variant="primary"
                      onClick={handlePublishProperties}
                      disabled={loading}
                    >
                      {loading ? 'Publishing...' : 'Publish All Properties'}
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Existing Properties */}
        <Card className="bg-white shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Existing Property Listings</h2>
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
                          {property.beds} bed, {property.baths} bath
                          {property.sqft ? `, ${property.sqft} sqft` : ''}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${property.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${property.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {property.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedProperty(property);
                                // In a real implementation, this would open an edit modal
                                alert(`Editing property: ${property.address}`);
                              }}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant={property.isActive ? "outline" : "primary"}
                              size="sm"
                              onClick={() => {
                                // In a real implementation, this would toggle the active status
                                alert(`Toggling property status: ${property.address}`);
                              }}
                            >
                              {property.isActive ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSendNotification(property.id)}
                            >
                              Notify
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
                <p className="text-gray-500">No properties found. Create your first property listing above.</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default PropertyManagement;