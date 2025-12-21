'use client';

import React, { useState } from 'react';
import { Wallet, Calendar, Download, Eye, Clock, Check, AlertCircle, DollarSign, TrendingUp, Filter, Search, Building } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Modal from '@/app/components/ui/Modal';

type PaymentStatus = 'Pending' | 'Paid' | 'Overdue';

interface Payment {
  id: number;
  paymentNumber: string;
  contractNumber: string;
  propertyName: string;
  customerName: string;
  amount: string;
  dueDate: string;
  paidDate: string | null;
  status: PaymentStatus;
  paymentType: string;
}

// Mock data
const mockPayments: Payment[] = [
  {
    id: 1,
    paymentNumber: 'PAY-2024-001',
    contractNumber: 'CTR-2024-001',
    propertyName: 'Modern Villa with Pool',
    customerName: 'Nguyễn Văn Khách',
    amount: '$85,000',
    dueDate: '2024-02-15',
    paidDate: null,
    status: 'Pending',
    paymentType: 'Installment 3/10',
  },
  {
    id: 2,
    paymentNumber: 'PAY-2024-002',
    contractNumber: 'CTR-2024-001',
    propertyName: 'Modern Villa with Pool',
    customerName: 'Nguyễn Văn Khách',
    amount: '$85,000',
    dueDate: '2024-01-15',
    paidDate: '2024-01-14',
    status: 'Paid',
    paymentType: 'Installment 2/10',
  },
  {
    id: 3,
    paymentNumber: 'PAY-2024-003',
    contractNumber: 'CTR-2024-002',
    propertyName: 'Luxury Apartment Downtown',
    customerName: 'Lê Thị Customer',
    amount: '$1,200',
    dueDate: '2024-02-01',
    paidDate: null,
    status: 'Pending',
    paymentType: 'Monthly Rent',
  },
  {
    id: 4,
    paymentNumber: 'PAY-2024-004',
    contractNumber: 'CTR-2024-002',
    propertyName: 'Luxury Apartment Downtown',
    customerName: 'Lê Thị Customer',
    amount: '$1,200',
    dueDate: '2024-01-01',
    paidDate: '2024-01-02',
    status: 'Paid',
    paymentType: 'Monthly Rent',
  },
  {
    id: 5,
    paymentNumber: 'PAY-2024-005',
    contractNumber: 'CTR-2024-001',
    propertyName: 'Modern Villa with Pool',
    customerName: 'Nguyễn Văn Khách',
    amount: '$85,000',
    dueDate: '2023-12-15',
    paidDate: null,
    status: 'Overdue',
    paymentType: 'Installment 1/10',
  },
];

const statusVariants: Record<PaymentStatus, 'warning' | 'success' | 'danger'> = {
  Pending: 'warning',
  Paid: 'success',
  Overdue: 'danger',
};

const statusIcons: Record<PaymentStatus, typeof Clock> = {
  Pending: Clock,
  Paid: Check,
  Overdue: AlertCircle,
};

export default function OwnerPaymentsPage() {
  const [payments] = useState<Payment[]>(mockPayments);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.paymentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pending' ? (p.status === 'Pending' || p.status === 'Overdue') :
      filter === 'paid' ? p.status === 'Paid' :
      true;
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const totalReceived = payments
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.]/g, '')), 0);
  const totalPending = payments
    .filter(p => p.status === 'Pending')
    .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.]/g, '')), 0);
  const totalOverdue = payments
    .filter(p => p.status === 'Overdue')
    .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9.]/g, '')), 0);

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Received</p>
              <p className="text-2xl font-bold text-green-600 mt-1">${totalReceived.toLocaleString()}</p>
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
              <p className="text-sm text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-1">${totalOverdue.toLocaleString()}</p>
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
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors capitalize ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Payment</th>
                <th className="px-6 py-4 font-medium">Property</th>
                <th className="px-6 py-4 font-medium">Customer</th>
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
                      <p className="font-medium text-gray-900">{payment.paymentNumber}</p>
                      <p className="text-xs text-gray-500">{payment.paymentType}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{payment.propertyName}</p>
                      <p className="text-xs text-gray-500">{payment.contractNumber}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {payment.customerName}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{payment.amount}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {payment.dueDate}
                      </p>
                      {payment.paidDate && (
                        <p className="text-xs text-green-600 mt-1">Paid: {payment.paidDate}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={statusVariants[payment.status]}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {payment.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
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
            <p className="text-gray-500 text-sm">Try adjusting your search or filter</p>
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
                  {selectedPayment.status === 'Paid' ? 'Payment Received' :
                   selectedPayment.status === 'Overdue' ? 'Payment Overdue' :
                   'Payment Pending'}
                </p>
                {selectedPayment.paidDate && (
                  <p className="text-sm text-green-700">Received on {selectedPayment.paidDate}</p>
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
                <p className="font-medium text-gray-900">{selectedPayment.paymentType}</p>
              </div>
            </div>

            {/* Property & Customer Info */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-gray-400" />
                <p className="text-sm font-medium text-gray-900">Related Information</p>
              </div>
              <p className="text-sm text-gray-600">Property: {selectedPayment.propertyName}</p>
              <p className="text-sm text-gray-600 mt-1">Contract: {selectedPayment.contractNumber}</p>
              <p className="text-sm text-gray-600 mt-1">Customer: {selectedPayment.customerName}</p>
            </div>

            {/* Actions */}
            {selectedPayment.status === 'Paid' && (
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
