import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface ForeclosureBid {
  id: string;
  foreclosureId: string;
  foreclosureAddress: string;
  investorId: string;
  investorName: string;
  investorType: 'common_investor' | 'institutional_investor';
  investorEmail: string;
  investorPhone: string;
  bidAmount: number;
  maxBidAmount: number;
  investmentExperience: string;
  preferredContactMethod: string;
  timeframe: string;
  additionalRequirements: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'won' | 'lost';
  submittedAt: string;
  updatedAt: string;
}

const ForeclosureBidManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bids, setBids] = useState<ForeclosureBid[]>([]);
  const [filteredBids, setFilteredBids] = useState<ForeclosureBid[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'contacted' | 'won' | 'lost'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBids();
  }, []);

  useEffect(() => {
    filterBids();
  }, [bids, statusFilter, searchTerm]);

  const fetchBids = async () => {
    try {
      const response = await fetch('/api/admin/foreclosure-bids', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.bids) {
        setBids(data.bids);
      }
    } catch (error) {
      console.error('Error fetching foreclosure bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBids = () => {
    let result = bids;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(bid => bid.status === statusFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(bid => 
        bid.foreclosureAddress.toLowerCase().includes(term) ||
        bid.investorName.toLowerCase().includes(term) ||
        bid.investorEmail.toLowerCase().includes(term)
      );
    }
    
    setFilteredBids(result);
  };

  const updateBidStatus = async (bidId: string, status: 'reviewed' | 'contacted' | 'won' | 'lost') => {
    try {
      const response = await fetch(`/api/admin/foreclosure-bids/${bidId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setBids(prev => prev.map(bid => 
          bid.id === bidId ? { ...bid, status, updatedAt: new Date().toISOString() } : bid
        ));
      } else {
        alert('Failed to update bid status');
      }
    } catch (error) {
      console.error('Error updating bid status:', error);
      alert('Network error. Please try again.');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Foreclosure Bid Management</h1>
          <p className="mt-1 text-gray-600">
            Manage foreclosure bids from investors
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search bids..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="contacted">Contacted</option>
            <option value="won">Won</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      <Card className="bg-white shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Foreclosure Bids</h2>
            <span className="text-sm text-gray-500">
              {filteredBids.length} of {bids.length} bids
            </span>
          </div>

          {filteredBids.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No bids found</h3>
              <p className="mt-1 text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No bids match your current filters.' 
                  : 'There are currently no bids to display.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Foreclosure
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bid
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBids.map((bid) => (
                    <tr key={bid.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{bid.foreclosureAddress}</div>
                        <div className="text-sm text-gray-500">
                          {bid.investorType === 'institutional_investor' ? 'Institutional' : 'Common'} Investor
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{bid.investorName}</div>
                        <div className="text-sm text-gray-500">{bid.investorEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(bid.bidAmount)}</div>
                        <div className="text-sm text-gray-500">
                          Max: {formatCurrency(bid.maxBidAmount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(bid.submittedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          bid.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          bid.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                          bid.status === 'contacted' ? 'bg-purple-100 text-purple-800' :
                          bid.status === 'won' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {bid.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBidStatus(bid.id, 'reviewed')}
                            >
                              Mark as Reviewed
                            </Button>
                          )}
                          {bid.status === 'reviewed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateBidStatus(bid.id, 'contacted')}
                            >
                              Mark as Contacted
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement view bid details functionality
                              console.log('View bid details:', bid.id);
                            }}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ForeclosureBidManagement;