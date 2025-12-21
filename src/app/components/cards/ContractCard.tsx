'use client';

import React from 'react';
import { FileText, Calendar, DollarSign, Eye, Printer, PenLine } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

export interface ContractCardProps {
  id: number | string;
  contractNumber: string;
  propertyName: string;
  propertyImage: string;
  contractType: 'Sale' | 'Rental';
  status: 'Draft' | 'Pending' | 'Active' | 'Completed' | 'Cancelled' | 'Expired';
  startDate: string;
  endDate?: string;
  totalValue: string;
  paidAmount?: string;
  onViewDetails?: (id: number | string) => void;
  onSign?: (id: number | string) => void;
  onPrint?: (id: number | string) => void;
  showActions?: boolean;
}

const statusVariants: Record<ContractCardProps['status'], 'default' | 'warning' | 'info' | 'success' | 'danger'> = {
  Draft: 'default',
  Pending: 'warning',
  Active: 'info',
  Completed: 'success',
  Cancelled: 'danger',
  Expired: 'default',
};

export default function ContractCard({
  id,
  contractNumber,
  propertyName,
  propertyImage,
  contractType,
  status,
  startDate,
  endDate,
  totalValue,
  paidAmount,
  onViewDetails,
  onSign,
  onPrint,
  showActions = true,
}: ContractCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      <div className="flex">
        {/* Property Image */}
        <div className="w-28 shrink-0">
          <img
            src={propertyImage}
            alt={propertyName}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500">
                  {contractNumber}
                </span>
              </div>
              <h3 className="font-bold text-gray-900 text-sm line-clamp-1">
                {propertyName}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={contractType === 'Sale' ? 'sale' : 'rental'}>
                {contractType}
              </Badge>
              <Badge variant={statusVariants[status]}>{status}</Badge>
            </div>
          </div>

          {/* Contract Details */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs">
                {startDate} {endDate ? `- ${endDate}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-medium text-red-600">{totalValue}</span>
            </div>
          </div>

          {/* Progress & Actions */}
          {paidAmount && (
            <div className="mt-2">
              <div className="text-xs text-gray-500">
                Paid: <span className="font-medium text-green-600">{paidAmount}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={() => onViewDetails?.(id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                View
              </button>
              {status === 'Pending' && onSign && (
                <button
                  onClick={() => onSign(id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  Sign
                </button>
              )}
              {onPrint && (
                <button
                  onClick={() => onPrint(id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
