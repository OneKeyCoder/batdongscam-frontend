'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, Calendar, CreditCard, Download, Eye, Clock, Check, AlertCircle, FileText, Loader2, Building, ExternalLink } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';
import { paymentService, PaymentListItem, PaymentDetailResponse } from '@/lib/api/services/payment.service';
import { useAuth } from '@/contexts/AuthContext';

type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'OVERDUE' | 'SYSTEM_PENDING' | 'SYSTEM_SUCCESS';

const statusIcons: Record<string, typeof Clock> = {
  PENDING: Clock,
  SYSTEM_PENDING: Clock,
  SUCCESS: Check,
  SYSTEM_SUCCESS: Check,
  OVERDUE: AlertCircle,
  FAILED: AlertCircle,
  CANCELLED: AlertCircle,
};

const statusVariants: Record<string, 'warning' | 'success' | 'danger' | 'info'> = {
  PENDING: 'warning',
  SYSTEM_PENDING: 'warning',
  SUCCESS: 'success',
  SYSTEM_SUCCESS: 'success',
  OVERDUE: 'danger',
  FAILED: 'danger',
  CANCELLED: 'info',
};

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  SYSTEM_PENDING: 'Processing',
  SUCCESS: 'Paid',
  SYSTEM_SUCCESS: 'Paid',
  OVERDUE: 'Overdue',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

// Payment stats interface
interface PaymentStats {
  totalPending: number;
  totalPaid: number;
  overdueCount: number;
}

export default function MyPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedPayment, setSelectedPayment] = useState<PaymentDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingPaymentId, setPayingPaymentId] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  
  // Stats calculated from all payments (not paginated)
  const [stats, setStats] = useState<PaymentStats>({ totalPending: 0, totalPaid: 0, overdueCount: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  const pageSize = 10;
  
  // Determine what payment types user can pay based on their role
  const isOwner = user?.role === 'PROPERTY_OWNER';
  const customerPayableTypes = ['DEPOSIT', 'MONTHLY', 'FULL_PAY', 'INSTALLMENT', 'ADVANCE'];
  const ownerPayableTypes = ['SERVICE_FEE'];

  // Fetch stats (all payments) - only once on mount
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        // Get all pending payments (OVERDUE is not a valid status, we check by dueDate)
        const pendingRes = await paymentService.getMyPayments({
          size: 1000, // Large enough to get all
          statuses: ['PENDING', 'SYSTEM_PENDING'],
        });
        const pendingPayments = pendingRes.data || [];
        const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        // Calculate overdue count based on dueDate being before today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const overdueCount = pendingPayments.filter(p => {
          if (p.dueDate) {
            const dueDate = new Date(p.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            return dueDate < today;
          }
          return false;
        }).length;

        // Get all paid payments
        const paidRes = await paymentService.getMyPayments({
          size: 1000,
          statuses: ['SUCCESS', 'SYSTEM_SUCCESS'],
        });
        const paidPayments = paidRes.data || [];
        const totalPaid = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        setStats({ totalPending, totalPaid, overdueCount });
      } catch (err) {
        console.error('Failed to fetch payment stats:', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch payments for current page
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError('');
      try {
        const statuses = filter === 'pending' 
          ? ['PENDING', 'SYSTEM_PENDING', 'OVERDUE'] 
          : filter === 'paid' 
            ? ['SUCCESS', 'SYSTEM_SUCCESS'] 
            : undefined;

        const res = await paymentService.getMyPayments({
          page: currentPage,
          size: pageSize,
          statuses,
        });
        setPayments(res.data || []);
        setTotalItems(res.paging?.total || 0);
      } catch (err: any) {
        console.error('Failed to fetch payments:', err);
        setError('Failed to load payments. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [currentPage, filter]);

  const handleViewDetail = async (paymentId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await paymentService.getPaymentById(paymentId);
      setSelectedPayment(detail);
    } catch (err) {
      console.error('Failed to fetch payment detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handlePay = (paymentId: string) => {
    setPayingPaymentId(paymentId);
    setShowPayModal(true);
  };

  const confirmPayment = async () => {
    if (!payingPaymentId) return;
    
    setProcessingPayment(true);
    try {
      const checkoutUrl = await paymentService.getPaymentLink(payingPaymentId);
      // Redirect to payment gateway
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error('Failed to get payment link:', err);
      alert('Failed to generate payment link. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-red-600" />
          My Payments
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your payment schedule and transaction history
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Pending</p>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {loadingStats ? '...' : formatAmount(stats.totalPending)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {loadingStats ? '...' : formatAmount(stats.totalPaid)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">
                {loadingStats ? '...' : `${stats.overdueCount} payments`}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-fit">
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

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Payments List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Wallet className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500 text-sm">You don't have any payments yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 font-medium">Payment</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    {isOwner && <th className="px-6 py-4 font-medium">Payer</th>}
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
                          <div>
                            <p className="font-medium text-gray-900">{payment.id.slice(0, 8).toUpperCase()}</p>
                            {payment.propertyTitle && (
                              <p className="text-xs text-gray-500 mt-0.5">{payment.propertyTitle}</p>
                            )}
                            {payment.contractNumber && (
                              <p className="text-xs text-gray-400">{payment.contractNumber}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="info">{payment.paymentType}</Badge>
                        </td>
                        {isOwner && (
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900">{payment.payerName || '-'}</p>
                            {payment.payerRole && (
                              <p className="text-xs text-gray-500">{payment.payerRole}</p>
                            )}
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900">{formatAmount(payment.amount)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {formatDate(payment.dueDate)}
                          </div>
                          {payment.paidTime && (
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Paid: {formatDate(payment.paidTime)}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusVariants[status] || 'info'}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusLabels[status] || status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewDetail(payment.id)}
                              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {(status === 'SUCCESS' || status === 'SYSTEM_SUCCESS') && (
                              <button
                                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Download Receipt"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            {(status === 'PENDING' || status === 'SYSTEM_PENDING' || status === 'OVERDUE') && 
                             // Only show Pay button for payment types the current user can pay
                             // Check based on user role
                             ((isOwner && ownerPayableTypes.includes(payment.paymentType)) ||
                              (!isOwner && customerPayableTypes.includes(payment.paymentType))) && (
                              <button
                                onClick={() => handlePay(payment.id)}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                              >
                                <CreditCard className="w-3 h-3" />
                                Pay
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
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200"
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
              selectedPayment.status === 'SUCCESS' || selectedPayment.status === 'SYSTEM_SUCCESS' ? 'bg-green-50 border border-green-200' :
              selectedPayment.status === 'OVERDUE' || selectedPayment.status === 'FAILED' ? 'bg-red-50 border border-red-200' :
              'bg-yellow-50 border border-yellow-200'
            }`}>
              {React.createElement(statusIcons[selectedPayment.status as PaymentStatus] || Clock, {
                className: `w-5 h-5 ${
                  selectedPayment.status === 'SUCCESS' || selectedPayment.status === 'SYSTEM_SUCCESS' ? 'text-green-600' :
                  selectedPayment.status === 'OVERDUE' || selectedPayment.status === 'FAILED' ? 'text-red-600' :
                  'text-yellow-600'
                }`
              })}
              <div>
                <p className={`font-medium ${
                  selectedPayment.status === 'SUCCESS' || selectedPayment.status === 'SYSTEM_SUCCESS' ? 'text-green-800' :
                  selectedPayment.status === 'OVERDUE' || selectedPayment.status === 'FAILED' ? 'text-red-800' :
                  'text-yellow-800'
                }`}>
                  {statusLabels[selectedPayment.status as PaymentStatus] || selectedPayment.status}
                </p>
                {selectedPayment.paidTime && (
                  <p className="text-sm text-green-700">Paid on {formatDate(selectedPayment.paidTime)}</p>
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
                <Badge variant="info">{selectedPayment.paymentType}</Badge>
              </div>
            </div>

            {/* Contract Info */}
            {selectedPayment.contractNumber && (
              <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <p className="text-sm font-medium text-blue-800">Related Contract</p>
                </div>
                {selectedPayment.contractId ? (
                  <Link 
                    href={`/my/contracts`}
                    onClick={() => setSelectedPayment(null)}
                    className="text-sm text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                  >
                    {selectedPayment.contractNumber}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <p className="text-sm text-gray-600">{selectedPayment.contractNumber}</p>
                )}
                {selectedPayment.contractType && (
                  <Badge variant="info" className="mt-2">{selectedPayment.contractType}</Badge>
                )}
              </div>
            )}

            {/* Property Info */}
            {selectedPayment.propertyTitle && (
              <div className="p-4 border border-green-100 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="w-4 h-4 text-green-600" />
                  <p className="text-sm font-medium text-green-800">Related Property</p>
                </div>
                {selectedPayment.propertyId ? (
                  <Link 
                    href={`/property/${selectedPayment.propertyId}`}
                    onClick={() => setSelectedPayment(null)}
                    className="text-sm text-green-700 hover:text-green-900 font-medium flex items-center gap-1"
                  >
                    {selectedPayment.propertyTitle}
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <p className="text-sm text-gray-600">{selectedPayment.propertyTitle}</p>
                )}
                {selectedPayment.propertyAddress && (
                  <p className="text-xs text-gray-500 mt-1">{selectedPayment.propertyAddress}</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              {(selectedPayment.status === 'SUCCESS' || selectedPayment.status === 'SYSTEM_SUCCESS') && (
                <button className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
              )}
              {(selectedPayment.status === 'PENDING' || selectedPayment.status === 'SYSTEM_PENDING' || selectedPayment.status === 'OVERDUE') &&
               // Check if user can pay this type
               ((isOwner && ownerPayableTypes.includes(selectedPayment.paymentType || '')) ||
                (!isOwner && customerPayableTypes.includes(selectedPayment.paymentType || ''))) && (
                <button
                  onClick={() => {
                    setSelectedPayment(null);
                    handlePay(selectedPayment.id);
                  }}
                  className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Pay Now
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Pay Modal (PayOS) */}
      {showPayModal && payingPaymentId && (
        <Modal
          isOpen={showPayModal}
          onClose={() => { setShowPayModal(false); setPayingPaymentId(null); }}
          title="Complete Payment"
        >
          <div className="space-y-4">
            {/* Payment Methods */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Select Payment Method</p>
              <div className="space-y-2">
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors">
                  <input type="radio" name="payment" defaultChecked className="text-red-600" />
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">PayOS</p>
                    <p className="text-xs text-gray-500">Pay with QR Code or Bank Transfer</p>
                  </div>
                  <img src="https://payos.vn/docs/img/logo.svg" alt="PayOS" className="h-6" />
                </label>
                <label className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-red-500 transition-colors opacity-50">
                  <input type="radio" name="payment" disabled className="text-red-600" />
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">Credit Card</p>
                    <p className="text-xs text-gray-500">Coming soon</p>
                  </div>
                  <CreditCard className="w-6 h-6 text-gray-400" />
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => { setShowPayModal(false); setPayingPaymentId(null); }}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={processingPayment}
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                disabled={processingPayment}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processingPayment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CreditCard className="w-4 h-4" />
                )}
                {processingPayment ? 'Redirecting...' : 'Proceed to Pay'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
