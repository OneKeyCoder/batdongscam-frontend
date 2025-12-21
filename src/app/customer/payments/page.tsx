'use client';

import React, { useState } from 'react';
import { Wallet, Calendar, CreditCard, Download, Eye, Clock, Check, AlertCircle, ChevronRight, FileText } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';

type PaymentStatus = 'Pending' | 'Paid' | 'Overdue' | 'Processing';
type PaymentType = 'Deposit' | 'Advance' | 'Installment' | 'Full Payment' | 'Monthly' | 'Penalty';

interface Payment {
  id: number;
  paymentNumber: string;
  contractNumber: string;
  propertyName: string;
  amount: string;
  dueDate: string;
  paidDate: string | null;
  status: PaymentStatus;
  paymentType: PaymentType;
  installmentNumber?: number;
  totalInstallments?: number;
}

// Mock data
const mockPayments: Payment[] = [
  {
    id: 1,
    paymentNumber: 'PAY-2024-001',
    contractNumber: 'CTR-2024-001',
    propertyName: 'Modern Villa with Pool',
    amount: '$85,000',
    dueDate: '2024-02-15',
    paidDate: null,
    status: 'Pending',
    paymentType: 'Installment',
    installmentNumber: 3,
    totalInstallments: 10,
  },
  {
    id: 2,
    paymentNumber: 'PAY-2024-002',
    contractNumber: 'CTR-2024-001',
    propertyName: 'Modern Villa with Pool',
    amount: '$85,000',
    dueDate: '2024-01-15',
    paidDate: '2024-01-14',
    status: 'Paid',
    paymentType: 'Installment',
    installmentNumber: 2,
    totalInstallments: 10,
  },
  {
    id: 3,
    paymentNumber: 'PAY-2024-003',
    contractNumber: 'CTR-2024-002',
    propertyName: 'Luxury Apartment Downtown',
    amount: '$1,200',
    dueDate: '2024-02-01',
    paidDate: null,
    status: 'Pending',
    paymentType: 'Monthly',
  },
  {
    id: 4,
    paymentNumber: 'PAY-2023-050',
    contractNumber: 'CTR-2024-001',
    propertyName: 'Modern Villa with Pool',
    amount: '$85,000',
    dueDate: '2023-12-15',
    paidDate: '2023-12-15',
    status: 'Paid',
    paymentType: 'Deposit',
  },
  {
    id: 5,
    paymentNumber: 'PAY-2024-005',
    contractNumber: 'CTR-2024-001',
    propertyName: 'Modern Villa with Pool',
    amount: '$2,500',
    dueDate: '2024-01-10',
    paidDate: null,
    status: 'Overdue',
    paymentType: 'Penalty',
  },
];

const statusIcons: Record<PaymentStatus, typeof Clock> = {
  Pending: Clock,
  Paid: Check,
  Overdue: AlertCircle,
  Processing: Clock,
};

const statusVariants: Record<PaymentStatus, 'warning' | 'success' | 'danger' | 'info'> = {
  Pending: 'warning',
  Paid: 'success',
  Overdue: 'danger',
  Processing: 'info',
};

const paymentTypeVariants: Record<PaymentType, 'deposit' | 'advance' | 'installment' | 'fullpay' | 'monthly' | 'penalty'> = {
  Deposit: 'deposit',
  Advance: 'advance',
  Installment: 'installment',
  'Full Payment': 'fullpay',
  Monthly: 'monthly',
  Penalty: 'penalty',
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [payingPayment, setPayingPayment] = useState<Payment | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const filteredPayments = payments.filter(p => {
    if (filter === 'pending') return p.status === 'Pending' || p.status === 'Overdue';
    if (filter === 'paid') return p.status === 'Paid';
    return true;
  });

  // Stats
  const totalPending = payments.filter(p => p.status === 'Pending' || p.status === 'Overdue').reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.]/g, '')), 0);
  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.]/g, '')), 0);
  const overdueCount = payments.filter(p => p.status === 'Overdue').length;

  const handlePay = (payment: typeof mockPayments[0]) => {
    setPayingPayment(payment);
    setShowPayModal(true);
  };

  const confirmPayment = () => {
    if (payingPayment) {
      setPayments(payments.map(p => 
        p.id === payingPayment.id 
          ? { ...p, status: 'Paid' as const, paidDate: new Date().toISOString().split('T')[0] }
          : p
      ));
      setShowPayModal(false);
      setPayingPayment(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Wallet className="w-6 h-6 text-red-600" />
          Payments
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
              <p className="text-2xl font-bold text-orange-600 mt-1">${totalPending.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-green-600 mt-1">${totalPaid.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-red-600 mt-1">{overdueCount} payments</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === 'pending' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('paid')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            filter === 'paid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
          }`}
        >
          Paid
        </button>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Type</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Due Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.map((payment) => {
                const StatusIcon = statusIcons[payment.status];
                return (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{payment.paymentNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{payment.propertyName}</p>
                        <p className="text-xs text-gray-400">{payment.contractNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={paymentTypeVariants[payment.paymentType]}>
                        {payment.paymentType}
                      </Badge>
                      {payment.installmentNumber && (
                        <p className="text-xs text-gray-500 mt-1">
                          {payment.installmentNumber}/{payment.totalInstallments}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{payment.amount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {payment.dueDate}
                      </div>
                      {payment.paidDate && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Paid: {payment.paidDate}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariants[payment.status]}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {payment.status === 'Paid' && (
                          <button
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Download Receipt"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        {(payment.status === 'Pending' || payment.status === 'Overdue') && (
                          <button
                            onClick={() => handlePay(payment)}
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

        {/* Empty State */}
        {filteredPayments.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Wallet className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
            <p className="text-gray-500 text-sm">Try changing your filter</p>
          </div>
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
              selectedPayment.status === 'Paid' ? 'bg-green-50 border border-green-200' :
              selectedPayment.status === 'Overdue' ? 'bg-red-50 border border-red-200' :
              'bg-yellow-50 border border-yellow-200'
            }`}>
              {React.createElement(statusIcons[selectedPayment.status], {
                className: `w-5 h-5 ${
                  selectedPayment.status === 'Paid' ? 'text-green-600' :
                  selectedPayment.status === 'Overdue' ? 'text-red-600' :
                  'text-yellow-600'
                }`
              })}
              <div>
                <p className={`font-medium ${
                  selectedPayment.status === 'Paid' ? 'text-green-800' :
                  selectedPayment.status === 'Overdue' ? 'text-red-800' :
                  'text-yellow-800'
                }`}>
                  {selectedPayment.status === 'Paid' ? 'Payment Completed' :
                   selectedPayment.status === 'Overdue' ? 'Payment Overdue' :
                   'Payment Pending'}
                </p>
                {selectedPayment.paidDate && (
                  <p className="text-sm text-green-700">Paid on {selectedPayment.paidDate}</p>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Payment Number</p>
                <p className="font-medium text-gray-900">{selectedPayment.paymentNumber}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Amount</p>
                <p className="font-bold text-red-600 text-lg">{selectedPayment.amount}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="font-medium text-gray-900">{selectedPayment.dueDate}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Payment Type</p>
                <Badge variant={paymentTypeVariants[selectedPayment.paymentType]}>
                  {selectedPayment.paymentType}
                </Badge>
              </div>
            </div>

            {/* Contract Info */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">Related Contract</p>
              </div>
              <p className="text-sm text-gray-600">{selectedPayment.contractNumber}</p>
              <p className="text-sm text-gray-500">{selectedPayment.propertyName}</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              {selectedPayment.status === 'Paid' && (
                <button className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Receipt
                </button>
              )}
              {(selectedPayment.status === 'Pending' || selectedPayment.status === 'Overdue') && (
                <button
                  onClick={() => {
                    setSelectedPayment(null);
                    handlePay(selectedPayment);
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

      {/* Pay Modal (PayOS Mock) */}
      {showPayModal && payingPayment && (
        <Modal
          isOpen={showPayModal}
          onClose={() => setShowPayModal(false)}
          title="Complete Payment"
        >
          <div className="space-y-4">
            {/* Amount */}
            <div className="text-center py-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Amount to Pay</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{payingPayment.amount}</p>
            </div>

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

            {/* Summary */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment</span>
                <span className="text-gray-900">{payingPayment.paymentNumber}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Property</span>
                <span className="text-gray-900">{payingPayment.propertyName}</span>
              </div>
              <hr className="my-3 border-gray-200" />
              <div className="flex justify-between">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-red-600">{payingPayment.amount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowPayModal(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                className="flex-1 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                Proceed to Pay
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
