import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Textarea from '../ui/Textarea';

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
      const response = await fetch('/api/admin/subscription-requests', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error('Error fetching subscription requests:', error);
    } finally {
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

  const confirmApprove = async () => {
    if (selectedRequest) {
      try {
        const response = await fetch(`/api/admin/subscription-requests/${selectedRequest.id}/approve`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        const data = await response.json();
        
        if (data.success) {
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
        } else {
          alert('Failed to approve subscription request: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error approving subscription request:', error);
        alert('Network error. Please try again.');
      }
    }
  };

  const confirmReject = async () => {
    if (selectedRequest && rejectionReason) {
      try {
        const response = await fetch(`/api/admin/subscription-requests/${selectedRequest.id}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ reason: rejectionReason }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setRequests(prev => prev.map(req => 
            req.id === selectedRequest.id 
              ? { ...req, status: 'rejected', rejectionReason } 
              : req
          ));
          setShowRejectModal(false);
          setSelectedRequest(null);
          setRejectionReason('');
        } else {
          alert('Failed to reject subscription request: ' + (data.message || 'Unknown error'));
        }
      } catch (error) {
        console.error('Error rejecting subscription request:', error);
        alert('Network error. Please try again.');
      }
    }
  };

  const handleRenewSubscription = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${requestId}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
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
      } else {
        alert('Failed to renew subscription: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error renewing subscription:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleCancelSubscription = async (requestId: string) => {
    try {
      const response = await fetch(`/api/admin/subscriptions/${requestId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setRequests(prev => prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'cancelled' } 
            : req
        ));
      } else {
        alert('Failed to cancel subscription: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Network error. Please try again.');
    }
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
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
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as any)}
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

      {/* Approve Modal */}
      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Approve Subscription</h3>
                <button
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Are you sure you want to approve the subscription request for{' '}
                  <span className="font-medium">{selectedRequest.investorName}</span>?
                </p>
                <div className="mt-4 bg-blue-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-blue-800">Subscription Details</h4>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Plan: {selectedRequest.planType.charAt(0).toUpperCase() + selectedRequest.planType.slice(1)}</p>
                    <p>Counties: {selectedRequest.counties.join(', ')}</p>
                  </div>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <Button
                  variant="primary"
                  onClick={confirmApprove}
                  className="w-full"
                >
                  Confirm Approval
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowApproveModal(false);
                    setSelectedRequest(null);
                  }}
                  className="w-full mt-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Reject Subscription</h3>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Please provide a reason for rejecting the subscription request for{' '}
                  <span className="font-medium">{selectedRequest.investorName}</span>:
                </p>
                <div className="mt-4">
                  <Textarea
                    rows={4}
                    value={rejectionReason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectionReason(e.target.value)}
                    placeholder="Enter reason for rejection..."
                    required
                  />
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <Button
                  variant="outline"
                  onClick={confirmReject}
                  disabled={!rejectionReason.trim()}
                  className="w-full"
                >
                  Confirm Rejection
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedRequest(null);
                    setRejectionReason('');
                  }}
                  className="w-full mt-2"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForeclosureSubscriptionManagement;