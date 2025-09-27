import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';

interface ForeclosureListing {
  id: string;
  address: string;
  county: string;
  auctionDate: string;
  startingBid: string;
  assessedValue?: string;
  propertyType: string;
  beds?: number;
  baths?: string;
  sqft?: number;
  yearBuilt?: number;
  description?: string;
  docketNumber?: string;
  plaintiff?: string;
  status: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const ForeclosureManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'single' | 'list'>('single');
  const [loading, setLoading] = useState(false);
  const [foreclosures, setForeclosures] = useState<ForeclosureListing[]>([]);
  const [selectedForeclosure, setSelectedForeclosure] = useState<ForeclosureListing | null>(null);
  
  // Single foreclosure form state
  const [foreclosureForm, setForeclosureForm] = useState<ForeclosureListing>({
    id: '',
    address: '',
    county: '',
    auctionDate: '',
    startingBid: '',
    assessedValue: '',
    propertyType: '',
    beds: 0,
    baths: '',
    sqft: 0,
    yearBuilt: new Date().getFullYear(),
    description: '',
    docketNumber: '',
    plaintiff: '',
    status: 'upcoming',
    isActive: true
  });
  
  // PDF file state
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  useEffect(() => {
    // Check if user is admin
    if (user && user.userType !== 'admin') {
      navigate('/');
      return;
    }
    
    // Fetch existing foreclosures
    fetchForeclosures();
  }, [user, navigate]);

  const fetchForeclosures = async () => {
    try {
      setLoading(true);
      // Fetch from the backend API
      const response = await fetch('/api/admin/foreclosures', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch foreclosure listings');
      }
      
      const data = await response.json();
      setForeclosures(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching foreclosures:', error);
      // Fallback to mock data
      const mockForeclosures: ForeclosureListing[] = [
        {
          id: 'f1',
          address: '123 Main St',
          county: 'Queens',
          auctionDate: '2024-02-15',
          startingBid: '450000',
          assessedValue: '500000',
          propertyType: 'Single Family',
          beds: 3,
          baths: '2',
          sqft: 1800,
          yearBuilt: 1995,
          description: 'Beautiful family home in great neighborhood',
          docketNumber: '12345-67890',
          plaintiff: 'Bank of America',
          status: 'upcoming',
          isActive: true,
          createdAt: '2023-01-15',
          updatedAt: '2023-01-15'
        },
        {
          id: 'f2',
          address: '456 Oak Ave',
          county: 'Brooklyn',
          auctionDate: '2024-02-20',
          startingBid: '380000',
          assessedValue: '420000',
          propertyType: 'Multi-Family',
          beds: 6,
          baths: '4',
          sqft: 3000,
          yearBuilt: 1980,
          description: 'Investment property with multiple rental units',
          docketNumber: '09876-54321',
          plaintiff: 'Chase Bank',
          status: 'upcoming',
          isActive: true,
          createdAt: '2023-02-20',
          updatedAt: '2023-02-20'
        }
      ];
      
      setForeclosures(mockForeclosures);
      setLoading(false);
    }
  };

  const handleForeclosureFormChange = (field: keyof ForeclosureListing, value: any) => {
    setForeclosureForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmitForeclosure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Submit to the backend API
      const response = await fetch('/api/admin/foreclosures', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(foreclosureForm)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit foreclosure listing');
      }
      
      const data = await response.json();
      console.log('Foreclosure listing created:', data);
      
      // Handle PDF upload if present
      if (pdfFile) {
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        
        const pdfResponse = await fetch(`/api/admin/foreclosures/${data.foreclosure.id}/pdf`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('session_token')}`
          },
          body: formData
        });
        
        if (!pdfResponse.ok) {
          throw new Error('Failed to upload PDF');
        }
        
        const pdfData = await pdfResponse.json();
        console.log('PDF uploaded:', pdfData);
      }
      
      alert('Foreclosure listing submitted successfully!');
      
      // Reset form
      setForeclosureForm({
        id: '',
        address: '',
        county: '',
        auctionDate: '',
        startingBid: '',
        assessedValue: '',
        propertyType: '',
        beds: 0,
        baths: '',
        sqft: 0,
        yearBuilt: new Date().getFullYear(),
        description: '',
        docketNumber: '',
        plaintiff: '',
        status: 'upcoming',
        isActive: true
      });
      
      setPdfFile(null);
      setSelectedForeclosure(null);
      
      // Refresh the foreclosure listings
      fetchForeclosures();
      
      setLoading(false);
    } catch (error) {
      console.error('Error submitting foreclosure:', error);
      alert('Error submitting foreclosure listing. Please try again.');
      setLoading(false);
    }
  };

  const handleUpdateForeclosure = async (id: string) => {
    try {
      setLoading(true);
      
      // Update the foreclosure listing on the backend
      const response = await fetch(`/api/admin/foreclosures/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(foreclosureForm)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update foreclosure listing');
      }
      
      const data = await response.json();
      console.log('Foreclosure listing updated:', data);
      
      // Handle PDF upload if present
      if (pdfFile) {
        const formData = new FormData();
        formData.append('pdf', pdfFile);
        
        const pdfResponse = await fetch(`/api/admin/foreclosures/${id}/pdf`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('session_token')}`
          },
          body: formData
        });
        
        if (!pdfResponse.ok) {
          throw new Error('Failed to upload PDF');
        }
        
        const pdfData = await pdfResponse.json();
        console.log('PDF uploaded:', pdfData);
      }
      
      alert('Foreclosure listing updated successfully!');
      
      // Reset form and selection
      setForeclosureForm({
        id: '',
        address: '',
        county: '',
        auctionDate: '',
        startingBid: '',
        assessedValue: '',
        propertyType: '',
        beds: 0,
        baths: '',
        sqft: 0,
        yearBuilt: new Date().getFullYear(),
        description: '',
        docketNumber: '',
        plaintiff: '',
        status: 'upcoming',
        isActive: true
      });
      
      setSelectedForeclosure(null);
      setPdfFile(null);
      
      // Refresh the foreclosure listings
      fetchForeclosures();
      
      setLoading(false);
    } catch (error) {
      console.error('Error updating foreclosure:', error);
      alert('Error updating foreclosure listing. Please try again.');
      setLoading(false);
    }
  };

  const handleDeleteForeclosure = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this foreclosure listing?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete the foreclosure listing on the backend
      const response = await fetch(`/api/admin/foreclosures/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete foreclosure listing');
      }
      
      const data = await response.json();
      console.log('Foreclosure listing deleted:', data);
      
      alert('Foreclosure listing deleted successfully!');
      
      // Refresh the foreclosure listings
      fetchForeclosures();
      
      setLoading(false);
    } catch (error) {
      console.error('Error deleting foreclosure:', error);
      alert('Error deleting foreclosure listing. Please try again.');
      setLoading(false);
    }
  };

  const handleToggleForeclosureStatus = async (id: string) => {
    try {
      setLoading(true);
      
      // Toggle the foreclosure listing status on the backend
      const response = await fetch(`/api/admin/foreclosures/${id}/toggle`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle foreclosure listing status');
      }
      
      const data = await response.json();
      console.log('Foreclosure listing status toggled:', data);
      
      alert('Foreclosure listing status updated successfully!');
      
      // Refresh the foreclosure listings
      fetchForeclosures();
      
      setLoading(false);
    } catch (error) {
      console.error('Error toggling foreclosure status:', error);
      alert('Error updating foreclosure listing status. Please try again.');
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (id: string) => {
    try {
      // Download the PDF from the server
      const response = await fetch(`/api/admin/foreclosures/${id}/pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('session_token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }
      
      const data = await response.json();
      console.log('PDF download link:', data);
      
      // In a real implementation, this would trigger the actual PDF download
      // For now, we'll just show an alert with the download link
      alert(`PDF download link: ${data.pdfUrl}`);
      
      // In a real implementation, you would do something like:
      // window.open(data.pdfUrl, '_blank');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  const handleSendNotification = async (id: string) => {
    try {
      setLoading(true);
      
      // Send notification for the foreclosure listing
      const response = await fetch(`/api/admin/foreclosures/${id}/notify`, {
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
      
      alert('Notification sent successfully to all subscribed users!');
      setLoading(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Error sending notification. Please try again.');
      setLoading(false);
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
              <h1 className="text-3xl font-bold text-gray-900">Foreclosure Management</h1>
              <p className="mt-2 text-gray-600">Create, update, and manage foreclosure listings</p>
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
              Create Foreclosure Listing
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'list'
                  ? 'border-primary-blue text-primary-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Manage Foreclosure Listings
            </button>
          </nav>
        </div>

        {/* Create Foreclosure Form */}
        {activeTab === 'single' && (
          <Card className="bg-white shadow mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {selectedForeclosure ? 'Edit Foreclosure Listing' : 'Create New Foreclosure Listing'}
              </h2>
              <form onSubmit={handleSubmitForeclosure}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <Input
                      type="text"
                      required
                      value={foreclosureForm.address}
                      onChange={(e) => handleForeclosureFormChange('address', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">County *</label>
                    <Select
                      options={[
                        { value: '', label: 'Select County' },
                        { value: 'Queens', label: 'Queens' },
                        { value: 'Brooklyn', label: 'Brooklyn' },
                        { value: 'Manhattan', label: 'Manhattan' },
                        { value: 'Bronx', label: 'Bronx' },
                        { value: 'Richmond', label: 'Richmond (Staten Island)' },
                        { value: 'Nassau', label: 'Nassau' },
                        { value: 'Suffolk', label: 'Suffolk' }
                      ]}
                      value={foreclosureForm.county}
                      onChange={(e) => handleForeclosureFormChange('county', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Auction Date *</label>
                    <Input
                      type="date"
                      required
                      value={foreclosureForm.auctionDate}
                      onChange={(e) => handleForeclosureFormChange('auctionDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Starting Bid *</label>
                    <Input
                      type="text"
                      required
                      value={foreclosureForm.startingBid}
                      onChange={(e) => handleForeclosureFormChange('startingBid', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assessed Value</label>
                    <Input
                      type="text"
                      value={foreclosureForm.assessedValue}
                      onChange={(e) => handleForeclosureFormChange('assessedValue', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Type *</label>
                    <Select
                      options={[
                        { value: '', label: 'Select Type' },
                        { value: 'Single Family', label: 'Single Family' },
                        { value: 'Multi-Family', label: 'Multi-Family' },
                        { value: 'Condo', label: 'Condo' },
                        { value: 'Townhouse', label: 'Townhouse' },
                        { value: 'Commercial', label: 'Commercial' }
                      ]}
                      value={foreclosureForm.propertyType}
                      onChange={(e) => handleForeclosureFormChange('propertyType', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                    <Input
                      type="number"
                      min="0"
                      value={foreclosureForm.beds}
                      onChange={(e) => handleForeclosureFormChange('beds', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                    <Input
                      type="text"
                      value={foreclosureForm.baths}
                      onChange={(e) => handleForeclosureFormChange('baths', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Square Feet</label>
                    <Input
                      type="number"
                      min="0"
                      value={foreclosureForm.sqft}
                      onChange={(e) => handleForeclosureFormChange('sqft', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                    <Input
                      type="number"
                      min="1800"
                      max={new Date().getFullYear()}
                      value={foreclosureForm.yearBuilt}
                      onChange={(e) => handleForeclosureFormChange('yearBuilt', parseInt(e.target.value) || new Date().getFullYear())}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Docket Number</label>
                    <Input
                      type="text"
                      value={foreclosureForm.docketNumber}
                      onChange={(e) => handleForeclosureFormChange('docketNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plaintiff</label>
                    <Input
                      type="text"
                      value={foreclosureForm.plaintiff}
                      onChange={(e) => handleForeclosureFormChange('plaintiff', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <Select
                      options={[
                        { value: 'upcoming', label: 'Upcoming' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'cancelled', label: 'Cancelled' }
                      ]}
                      value={foreclosureForm.status}
                      onChange={(e) => handleForeclosureFormChange('status', e.target.value)}
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <Textarea
                    rows={4}
                    value={foreclosureForm.description}
                    onChange={(e) => handleForeclosureFormChange('description', e.target.value)}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">PDF Document</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handlePdfUpload}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-md file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary-blue file:text-white
                        hover:file:bg-blue-700"
                    />
                  </div>
                  {pdfFile && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected file: {pdfFile.name}
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setForeclosureForm({
                        id: '',
                        address: '',
                        county: '',
                        auctionDate: '',
                        startingBid: '',
                        assessedValue: '',
                        propertyType: '',
                        beds: 0,
                        baths: '',
                        sqft: 0,
                        yearBuilt: new Date().getFullYear(),
                        description: '',
                        docketNumber: '',
                        plaintiff: '',
                        status: 'upcoming',
                        isActive: true
                      });
                      setPdfFile(null);
                      setSelectedForeclosure(null);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (selectedForeclosure ? 'Update Listing' : 'Create Listing')}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        )}

        {/* Foreclosure Listings */}
        {activeTab === 'list' && (
          <Card className="bg-white shadow">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Foreclosure Listings</h2>
                <span className="text-sm text-gray-500">{foreclosures.length} listings</span>
              </div>
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
                </div>
              ) : foreclosures.length > 0 ? (
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
                          Auction Info
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bid Info
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
                      {foreclosures.map((foreclosure) => (
                        <tr key={foreclosure.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{foreclosure.address}</div>
                            <div className="text-sm text-gray-500">{foreclosure.propertyType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{foreclosure.county}</div>
                            <div className="text-sm text-gray-500">
                              {foreclosure.beds} bed, {foreclosure.baths} bath
                              {foreclosure.sqft ? `, ${foreclosure.sqft} sqft` : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(foreclosure.auctionDate).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">Docket: {foreclosure.docketNumber || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${foreclosure.startingBid}
                            </div>
                            <div className="text-sm text-gray-500">
                              Assessed: ${foreclosure.assessedValue || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${foreclosure.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' : 
                                foreclosure.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                'bg-red-100 text-red-800'}`}>
                              {foreclosure.status.charAt(0).toUpperCase() + foreclosure.status.slice(1)}
                            </span>
                            <div className="text-sm text-gray-500 mt-1">
                              {foreclosure.isActive ? 'Active' : 'Inactive'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex flex-col space-y-2">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    setSelectedForeclosure(foreclosure);
                                    setActiveTab('single');
                                    setForeclosureForm(foreclosure);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant={foreclosure.isActive ? "outline" : "primary"}
                                  size="sm"
                                  onClick={() => handleToggleForeclosureStatus(foreclosure.id)}
                                >
                                  {foreclosure.isActive ? 'Deactivate' : 'Activate'}
                                </Button>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDownloadPdf(foreclosure.id)}
                                >
                                  PDF
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleSendNotification(foreclosure.id)}
                                >
                                  Notify
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                  onClick={() => handleDeleteForeclosure(foreclosure.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No foreclosure listings found. Create your first listing using the form above.</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ForeclosureManagement;