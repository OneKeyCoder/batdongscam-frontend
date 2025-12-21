'use client';

import React from 'react';
import { CreditCard, Calendar, Check, Clock, AlertCircle } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

export interface PaymentCardProps {
  id: number | string;
  paymentNumber: string;
  contractNumber?: string;
  propertyName?: string;
  amount: string;
  dueDate: string;
  paidDate?: string;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Processing';
  paymentType: 'Deposit' | 'Advance' | 'Installment' | 'Full Payment' | 'Monthly' | 'Penalty';
  onPay?: (id: number | string) => void;
  onViewDetails?: (id: number | string) => void;
}

const statusIcons = {
  Pending: Clock,
  Paid: Check,
  Overdue: AlertCircle,
  Processing: Clock,
};

const statusVariants: Record<PaymentCardProps['status'], 'warning' | 'success' | 'danger' | 'info'> = {
  Pending: 'warning',
  Paid: 'success',
  Overdue: 'danger',
  Processing: 'info',
};

const paymentTypeVariants: Record<PaymentCardProps['paymentType'], 'deposit' | 'advance' | 'installment' | 'fullpay' | 'monthly' | 'penalty'> = {
  Deposit: 'deposit',
  Advance: 'advance',
  Installment: 'installment',
  'Full Payment': 'fullpay',
  Monthly: 'monthly',
  Penalty: 'penalty',
};

export default function PaymentCard({
  id,
  paymentNumber,
  contractNumber,
  propertyName,
  amount,
  dueDate,
  paidDate,
  status,
  paymentType,
  onPay,
  onViewDetails,
}: PaymentCardProps) {
  const StatusIcon = statusIcons[status];

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            status === 'Paid' ? 'bg-green-100' :
            status === 'Overdue' ? 'bg-red-100' :
            'bg-yellow-100'
          }`}>
            <StatusIcon className={`w-5 h-5 ${
              status === 'Paid' ? 'text-green-600' :
              status === 'Overdue' ? 'text-red-600' :
              'text-yellow-600'
            }`} />
          </div>
          <div>
            <p className="text-xs text-gray-500">{paymentNumber}</p>
            <p className="font-bold text-gray-900">{amount}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={statusVariants[status]}>{status}</Badge>
          <Badge variant={paymentTypeVariants[paymentType]}>{paymentType}</Badge>
        </div>
      </div>

      {/* Property/Contract Info */}
      {(propertyName || contractNumber) && (
        <div className="mb-3 text-sm text-gray-600">
          {propertyName && <p className="font-medium">{propertyName}</p>}
          {contractNumber && (
            <p className="text-xs text-gray-500">Contract: {contractNumber}</p>
          )}
        </div>
      )}

      {/* Dates */}
      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
        <div className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          <span>Due: {dueDate}</span>
        </div>
        {paidDate && (
          <div className="flex items-center gap-1 text-green-600">
            <Check className="w-3.5 h-3.5" />
            <span>Paid: {paidDate}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
        <button
          onClick={() => onViewDetails?.(id)}
          className="flex-1 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-center"
        >
          View Details
        </button>
        {(status === 'Pending' || status === 'Overdue') && onPay && (
          <button
            onClick={() => onPay(id)}
            className="flex-1 py-2 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Pay Now
          </button>
        )}
      </div>
    </div>
  );
}
