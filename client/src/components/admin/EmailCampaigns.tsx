import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipients: string;
  status: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

const EmailCampaigns: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [campaign, setCampaign] = useState({
    subject: '',
    recipients: 'all',
    content: ''
  });

  // Check if user is admin
  if (user && user.userType !== 'admin') {
    navigate('/');
    return null;
  }

  useEffect(() => {
    fetchEmailCampaigns();
  }, []);

  const fetchEmailCampaigns = async () => {
    try {
      const response = await fetch('/api/admin/email-campaigns', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch email campaigns');
      }
      
      const data = await response.json();
      if (data.success) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Error fetching email campaigns:', error);
      // Fallback to mock data
      setCampaigns([
        {
          id: '1',
          name: 'Weekly Update',
          subject: 'Weekly Property Update',
          content: '<p>Check out our latest property listings...</p>',
          recipients: 'all',
          status: 'sent',
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Market Report',
          subject: 'Market Insights Report',
          content: '<p>Here are the latest market insights...</p>',
          recipients: 'investors',
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCampaign(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCampaign(prev => ({
      ...prev,
      recipients: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/email-campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...campaign,
          name: campaign.subject, // Use subject as name
          status: 'draft' // Default to draft status
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create email campaign');
      }
      
      const data = await response.json();
      if (data.success) {
        alert('Email campaign created successfully!');
        setCampaign({
          subject: '',
          recipients: 'all',
          content: ''
        });
        // Refresh the campaign list
        fetchEmailCampaigns();
      } else {
        alert('Failed to create email campaign: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating email campaign:', error);
      alert('Network error. Please try again.');
    } finally {
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
              <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
              <p className="mt-2 text-gray-600">Send newsletters and announcements to users</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-white shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Campaign</h2>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <Input
                        type="text"
                        name="subject"
                        value={campaign.subject}
                        onChange={handleInputChange}
                        placeholder="Enter email subject"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Recipients</label>
                      <Select
                        options={[
                          { value: 'all', label: 'All Users' },
                          { value: 'investors', label: 'All Investors' },
                          { value: 'sellers', label: 'All Sellers' },
                          { value: 'common_investors', label: 'Common Investors' },
                          { value: 'institutional_investors', label: 'Institutional Investors' }
                        ]}
                        value={campaign.recipients}
                        onChange={handleSelectChange}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                      <Textarea
                        name="content"
                        value={campaign.content}
                        onChange={handleInputChange}
                        placeholder="Write your email content here..."
                        rows={8}
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        variant="primary"
                        disabled={loading}
                      >
                        {loading ? 'Sending...' : 'Send Campaign'}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </Card>
          </div>
          
          <div>
            <Card className="bg-white shadow">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Templates</h2>
                <div className="space-y-3">
                  <button 
                    type="button"
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    onClick={() => setCampaign(prev => ({
                      ...prev,
                      subject: 'New Properties Available This Week',
                      content: 'Dear {{name}},\n\nWe have new properties available this week that match your investment criteria...\n\nBest regards,\nInvestor Properties NY Team'
                    }))}
                  >
                    <div className="font-medium text-gray-900">New Properties</div>
                    <div className="text-sm text-gray-500 mt-1">Weekly property update</div>
                  </button>
                  
                  <button 
                    type="button"
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    onClick={() => setCampaign(prev => ({
                      ...prev,
                      subject: 'Market Insights Report',
                      content: 'Dear {{name}},\n\nHere are the latest market insights for NYC real estate investing...\n\nBest regards,\nInvestor Properties NY Team'
                    }))}
                  >
                    <div className="font-medium text-gray-900">Market Insights</div>
                    <div className="text-sm text-gray-500 mt-1">Monthly market report</div>
                  </button>
                  
                  <button 
                    type="button"
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    onClick={() => setCampaign(prev => ({
                      ...prev,
                      subject: 'Platform Update',
                      content: 'Dear {{name}},\n\nWe have some exciting updates to our platform...\n\nBest regards,\nInvestor Properties NY Team'
                    }))}
                  >
                    <div className="font-medium text-gray-900">Platform Update</div>
                    <div className="text-sm text-gray-500 mt-1">Feature announcements</div>
                  </button>
                </div>
              </div>
            </Card>
            
            <Card className="bg-white shadow mt-6">
              <div className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Campaign History</h2>
                <div className="space-y-4">
                  {campaigns.length > 0 ? (
                    campaigns.map(campaign => (
                      <div key={campaign.id} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                        <div className="font-medium text-gray-900">{campaign.subject}</div>
                        <div className="text-sm text-gray-500">
                          Sent to {campaign.recipients} • {new Date(campaign.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Status: <span className="capitalize">{campaign.status}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-500 text-center py-4">
                      No email campaigns found
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCampaigns;