'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, Calendar, Download, Eye, Clock, Check, AlertCircle, Search, Building, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import { paymentService, PaymentListItem, PaymentDetailResponse } from '@/lib/api/services/payment.service';
import { propertyService, PropertyDetails } from '@/lib/api/services/property.service';
import { PropertyCard } from '@/lib/api/types';
import { useAuth } from '@/contexts/AuthContext';

type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'OVERDUE';

const statusVariants: Record<PaymentStatus, 'warning' | 'success' | 'danger' | 'info'> = {
  PENDING: 'warning',
  SUCCESS: 'success',
  OVERDUE: 'danger',
  FAILED: 'danger',
  CANCELLED: 'info',
};

const statusIcons: Record<PaymentStatus, typeof Clock> = {
  PENDING: Clock,
  SUCCESS: Check,
  OVERDUE: AlertCircle,
  FAILED: AlertCircle,
  CANCELLED: AlertCircle,
};

const statusLabels: Record<PaymentStatus, string> = {
  PENDING: 'Pending',
  SUCCESS: 'Paid',
  OVERDUE: 'Overdue',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

export default function OwnerPaymentsPage() {
  const { user } = useAuth();
  
  // Properties state
  const [properties, setProperties] = useState<PropertyCard[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [loadingProperties, setLoadingProperties] = useState(true);

  // Payments state
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetailResponse | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const pageSize = 10;

  // Fetch owner's properties first
  useEffect(() => {
    const fetchProperties = async () => {
      if (!user?.id) return;
      
      setLoadingProperties(true);
      try {
        const res = await propertyService.getOwnerProperties(user.id);
        setProperties(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedPropertyId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch properties:', err);
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchProperties();
  }, [user?.id]);

  // Fetch payments for selected property
  useEffect(() => {
    const fetchPayments = async () => {
      if (!selectedPropertyId) {
        setPayments([]);
        return;
      }
      
      setLoading(true);
      setError('');
      try {
        const res = await paymentService.getPaymentsOfProperty(selectedPropertyId, {
          page: currentPage,
          size: pageSize,
        });
        
        let filteredData = res.data || [];
        
        // Apply client-side filter
        if (filter === 'pending') {
          filteredData = filteredData.filter(p => p.status === 'PENDING' || p.status === 'OVERDUE');
        } else if (filter === 'paid') {
          filteredData = filteredData.filter(p => p.status === 'SUCCESS');
        }
        
        // Apply search
        if (searchTerm) {
          const term = searchTerm.toLowerCase();
          filteredData = filteredData.filter(p => 
            p.payerName?.toLowerCase().includes(term) ||
            p.contractNumber?.toLowerCase().includes(term) ||
            p.id.toLowerCase().includes(term)
          );
        }
        
        setPayments(filteredData);
        setTotalItems(res.paging?.total || filteredData.length);
      } catch (err: any) {
        console.error('Failed to fetch payments:', err);
        setError('Failed to load payments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [selectedPropertyId, currentPage, filter, searchTerm]);

  // Calculate stats
  const totalReceived = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = payments
    .filter(p => p.status === 'PENDING')
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOverdue = payments
    .filter(p => p.status === 'OVERDUE')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const handleViewDetail = async (paymentId: string) => {
    try {
      const detail = await paymentService.getPaymentById(paymentId);
      setSelectedPayment(detail);
    } catch (err) {
      console.error('Failed to fetch payment detail:', err);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-red-600" />
          Payment History
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Track income from your properties
        </p>
      </div>

      {/* Property Selector */}
      {loadingProperties ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading properties...
        </div>
      ) : properties.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          You don't have any properties yet. Create a property listing to see payments.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Building className="w-4 h-4 inline mr-1" />
            Select Property
          </label>
          <select
            value={selectedPropertyId}
            onChange={(e) => { setSelectedPropertyId(e.target.value); setCurrentPage(0); }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
          >
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.title} - {prop.fullAddress}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Received</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{formatAmount(totalReceived)}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">{formatAmount(totalPending)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{formatAmount(totalOverdue)}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          {(['all', 'pending', 'paid'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setCurrentPage(0); }}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : !selectedPropertyId ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Building className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a property</h3>
            <p className="text-gray-500 text-sm">Choose a property to view its payments</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Wallet className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Payment</th>
                    <th className="px-6 py-4 font-medium">Customer</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Due Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((payment) => {
                    const status = payment.status as PaymentStatus;
                    const StatusIcon = statusIcons[status] || Clock;
                    return (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{payment.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-gray-500">{payment.paymentType}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {payment.payerName || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{formatAmount(payment.amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-600 flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(payment.dueDate)}
                          </p>
                          {payment.paidDate && (
                            <p className="text-xs text-green-600 mt-1">Paid: {formatDate(payment.paidDate)}</p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusVariants[status] || 'info'}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusLabels[status] || status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetail(payment.id)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {status === 'SUCCESS' && (
                              <button
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Download Receipt"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <p className="text-sm text-gray-500">
                  Showing {currentPage * pageSize + 1} - {Math.min((currentPage + 1) * pageSize, totalItems)} of {totalItems}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <Modal
          isOpen={!!selectedPayment}
          onClose={() => setSelectedPayment(null)}
          title="Payment Details"
        >
          <div className="space-y-4">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg flex items-center gap-3 ${
              selectedPayment.status === 'SUCCESS' ? 'bg-green-50 border border-green-200' :
              selectedPayment.status === 'OVERDUE' ? 'bg-red-50 border border-red-200' :
              'bg-yellow-50 border border-yellow-200'
            }`}>
              {React.createElement(statusIcons[selectedPayment.status as PaymentStatus] || Clock, {
                className: `w-5 h-5 ${
                  selectedPayment.status === 'SUCCESS' ? 'text-green-600' :
                  selectedPayment.status === 'OVERDUE' ? 'text-red-600' :
                  'text-yellow-600'
                }`
              })}
              <div>
                <p className={`font-medium ${
                  selectedPayment.status === 'SUCCESS' ? 'text-green-800' :
                  selectedPayment.status === 'OVERDUE' ? 'text-red-800' :
                  'text-yellow-800'
                }`}>
                  {selectedPayment.status === 'SUCCESS' ? 'Payment Received' :
                   selectedPayment.status === 'OVERDUE' ? 'Payment Overdue' :
                   'Payment Pending'}
                </p>
                {selectedPayment.paidDate && (
                  <p className="text-sm text-green-700">Received on {formatDate(selectedPayment.paidDate)}</p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Payment ID</p>
                <p className="font-medium text-gray-900">{selectedPayment.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="font-bold text-red-600 text-lg">{formatAmount(selectedPayment.amount)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="font-medium text-gray-900">{formatDate(selectedPayment.dueDate)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Payment Type</p>
                <p className="font-medium text-gray-900">{selectedPayment.paymentType}</p>
              </div>
            </div>

            {/* Actions */}
            {selectedPayment.status === 'SUCCESS' && (
              <div className="pt-4 border-t">
                <button className="w-full py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
