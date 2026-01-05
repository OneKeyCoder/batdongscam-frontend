'use client';

import React from 'react';
import { Eye, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { PaymentListItem } from '@/lib/api/services/payment.service';

interface PaymentTableProps {
  data: PaymentListItem[];
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onViewDetail: (id: string) => void;
}

export default function PaymentTable({
  data, loading, currentPage, itemsPerPage, totalItems, onPageChange, onViewDetail
}: PaymentTableProps) {

  const getStatusVariant = (val: string) => {
    const map: Record<string, 'success' | 'pending' | 'failed' | 'warning' | 'default'> = {
      'SUCCESS': 'success',
      'PAID': 'success',
      'SYSTEM_SUCCESS': 'success',

      'PENDING': 'pending',
      'SYSTEM_PENDING': 'pending',

      'FAILED': 'failed',
      'CANCELLED': 'failed',
      'SYSTEM_FAILED': 'failed',

      'OVERDUE': 'warning'
    };
    return map[val] || 'default';
  };

  const getTypeVariant = (val: string) => {
    const map: Record<string, any> = {
      'DEPOSIT': 'deposit',     
      'FULL_PAY': 'fullpay',      
      'MONTHLY': 'monthly',     
      'INSTALLMENT': 'installment', 
      'SALARY': 'salary',        
      'BONUS': 'bonus',           
      'SERVICE_FEE': 'advance',  
      'PENALTY': 'penalty',     
      'ADVANCE': 'advance',      
      'REFUND': 'refund'          
    };
    return map[val] || 'gray';
  };

  if (loading) {
    return <div className="bg-white border border-gray-200 rounded-xl p-12 flex justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Amount</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-center">Type</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-center">Status</th>
              <th className="px-6 py-4 font-bold text-gray-900">Payer</th>
              <th className="px-6 py-4 font-bold text-gray-900">Payee</th>
              <th className="px-6 py-4 font-bold text-gray-900">Date</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8">No payments found.</td></tr>
            ) : data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                {/* Amount */}
                <td className="px-6 py-4 font-bold text-gray-900">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.amount)}
                </td>

                {/* Type Badge */}
                <td className="px-6 py-4 text-center">
                  <Badge variant={getTypeVariant(item.paymentType)}>
                    {item.paymentType.replace(/_/g, ' ')}
                  </Badge>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4 text-center">
                  <Badge variant={getStatusVariant(item.status) as any}>
                    {item.status.replace('SYSTEM_', '').replace(/_/g, ' ')}
                  </Badge>
                </td>

                {/* Payer */}
                <td className="px-6 py-4">
                  {item.payerName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                        {item.payerName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 block text-xs">{item.payerName}</span>
                        <span className="text-[10px] text-gray-400">{item.payerRole || 'Unknown'}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">
                      {item.payerId ? `ID: ...${item.payerId.slice(-4)}` : 'System'}
                    </span>
                  )}
                </td>

                {/* Payee */}
                <td className="px-6 py-4">
                  {item.payeeName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs shrink-0">
                        {item.payeeName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 block text-xs">{item.payeeName}</span>
                        <span className="text-[10px] text-gray-400">{item.payeeRole || 'Unknown'}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">
                      {item.payeeId ? `ID: ...${item.payeeId.slice(-4)}` : 'System'}
                    </span>
                  )}
                </td>

                {/* Date */}
                <td className="px-6 py-4 text-gray-900 text-xs">
                  {item.paidTime ? (
                    <div>
                      <span className="text-green-600 font-bold">Paid: </span>
                      {new Date(item.paidTime).toLocaleDateString()}
                    </div>
                  ) : item.dueDate ? (
                    <div>
                      <span className="text-orange-500 font-bold">Due: </span>
                      {new Date(item.dueDate).toLocaleDateString()}
                    </div>
                  ) : (
                    <span className="text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                  )}
                </td>

                {/* Action */}
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewDetail(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={itemsPerPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}