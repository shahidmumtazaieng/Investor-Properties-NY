import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';

interface SubscriptionRequest {
  id: string;
  investorId: string;
  investorName: string;
  investorEmail: string;
  investorPhone: string;
  planType: 'monthly' | 'yearly';
  counties: string[];
  investmentExperience: string;
  investmentBudget: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled';
  submittedAt: string;
  approvedAt?: string;
  expiryDate?: string;
  rejectionReason?: string;
}

const ForeclosureSubscriptionManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SubscriptionRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'expired' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<SubscriptionRequest | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchSubscriptionRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, searchTerm]);

  const fetchSubscriptionRequests = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        const sampleRequests: SubscriptionRequest[] = [
          {
            id: '1',
            investorId: 'inv-001',
            investorName: 'John Smith',
            investorEmail: 'john.smith@example.com',
            investorPhone: '(555) 123-4567',
            planType: 'monthly',
            counties: ['Queens', 'Brooklyn'],
            investmentExperience: '3-5 Years Experience',
            investmentBudget: '$250K - $500K',
            status: 'pending',
            submittedAt: '2024-10-15T10:30:00Z'
          },
          {
            id: '2',
            investorId: 'inv-002',
            investorName: 'Sarah Johnson',
            investorEmail: 'sarah.j@example.com',
            investorPhone: '(555) 987-6543',
            planType: 'yearly',
            counties: ['Manhattan', 'Bronx', 'Staten Island'],
            investmentExperience: '5+ Years Experience',
            investmentBudget: '$500K - $1M',
            status: 'approved',
            submittedAt: '2024-10-10T14:22:00Z',
            approvedAt: '2024-10-11T09:15:00Z',
            expiryDate: '2025-10-11T09:15:00Z'
          },
          {
            id: '3',
            investorId: 'inv-003',
            investorName: 'Robert Davis',
            investorEmail: 'robert.davis@example.com',
            investorPhone: '(555) 456-7890',
            planType: 'monthly',
            counties: ['Nassau', 'Suffolk'],
            investmentExperience: '1-2 Years Experience',
            investmentBudget: '$100K - $250K',
            status: 'rejected',
            submittedAt: '2024-10-05T16:45:00Z',
            rejectionReason: 'Insufficient investment experience for requested counties'
          },
          {
            id: '4',
            investorId: 'inv-004',
            investorName: 'Emily Wilson',
            investorEmail: 'emily.wilson@example.com',
            investorPhone: '(555) 444-3333',
            planType: 'yearly',
            counties: ['Westchester', 'Queens'],
            investmentExperience: 'First Time Bidder',
            investmentBudget: 'Under $100K',
            status: 'pending',
            submittedAt: '2024-10-18T11:20:00Z'
          }
        ];
        setRequests(sampleRequests);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching subscription requests:', error);
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let result = requests;
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(request => request.status === statusFilter);
    }
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(request => 
        request.investorName.toLowerCase().includes(term) ||
        request.investorEmail.toLowerCase().includes(term) ||
        request.counties.some(county => county.toLowerCase().includes(term))
      );
    }
    
    setFilteredRequests(result);
  };

  const handleApproveRequest = (request: SubscriptionRequest) => {
    setSelectedRequest(request);
    setShowApproveModal(true);
  };

  const handleRejectRequest = (request: SubscriptionRequest) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };

  const confirmApprove = () => {
    if (selectedRequest) {
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              status: 'approved',
              approvedAt: new Date().toISOString(),
              expiryDate: new Date(Date.now() + (selectedRequest.planType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
            } 
          : req
      ));
      setShowApproveModal(false);
      setSelectedRequest(null);
    }
  };

  const confirmReject = () => {
    if (selectedRequest && rejectionReason) {
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'rejected', rejectionReason } 
          : req
      ));
      setShowRejectModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
    }
  };

  const handleRenewSubscription = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { 
            ...req, 
            status: 'approved',
            approvedAt: new Date().toISOString(),
            expiryDate: new Date(Date.now() + (req.planType === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString()
          } 
        : req
    ));
  };

  const handleCancelSubscription = (requestId: string) => {
    setRequests(prev => prev.map(req => 
      req.id === requestId 
        ? { ...req, status: 'cancelled' } 
        : req
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      case 'expired':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Expired</span>;
      case 'cancelled':
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Cancelled</span>;
      default:
        return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Foreclosure Subscription Management</h1>
          <p className="mt-1 text-gray-600">
            Manage investor foreclosure subscription requests
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search requests..."
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
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <Card className="bg-white shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Subscription Requests</h2>
            <span className="text-sm text-gray-500">
              {filteredRequests.length} of {requests.length} requests
            </span>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.903-6.05-2.358C7.533 13.097 9.66 14 12 14s4.467-.903 6.05-2.358zM12 4.5a7.5 7.5 0 017.5 7.5" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No subscription requests</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No subscription requests match your search criteria.' 
                  : 'There are currently no subscription requests to display.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investor
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Counties
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investment Info
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-800 font-medium">
                                {request.investorName.charAt(0)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{request.investorName}</div>
                            <div className="text-sm text-gray-500">{request.investorEmail}</div>
                            <div className="text-sm text-gray-500">{request.investorPhone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{request.planType}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {request.counties.join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{request.investmentExperience}</div>
                        <div className="text-sm text-gray-500">{request.investmentBudget}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>Submitted: {formatDate(request.submittedAt)}</div>
                        {request.approvedAt && (
                          <div>Approved: {formatDate(request.approvedAt)}</div>
                        )}
                        {request.expiryDate && (
                          <div>Expires: {formatDate(request.expiryDate)}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {request.status === 'pending' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApproveRequest(request)}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectRequest(request)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {request.status === 'approved' && (
                          <div className="flex space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleRenewSubscription(request.id)}
                            >
                              Renew
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelSubscription(request.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                        {request.status === 'expired' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleRenewSubscription(request.id)}
                          >
                            Renew
                          </Button>
                        )}
                        {(request.status === 'rejected' || request.status === 'cancelled') && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleApproveRequest(request)}
                          >
                            Re-approve
                          </Button>
                        )}
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

export default ForeclosureSubscriptionManagement;
