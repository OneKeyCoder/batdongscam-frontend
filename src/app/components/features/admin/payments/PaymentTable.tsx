'use client';

import React, { useState, useEffect } from 'react';
import { Eye, Loader2 } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';
import { PaymentListItem } from '@/lib/api/services/payment.service';
import { accountService } from '@/lib/api/services/account.service'; 

interface PaymentTableProps {
  data: PaymentListItem[];
  loading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onViewDetail: (id: string) => void;
}

interface EnrichedPayment extends PaymentListItem {
  fetchedPayerName?: string;
  fetchedPayerRole?: string;
  fetchedPayeeName?: string;
  fetchedPayeeRole?: string;
}

export default function PaymentTable({
  data, loading, currentPage, itemsPerPage, totalItems, onPageChange, onViewDetail
}: PaymentTableProps) {

  const [enrichedData, setEnrichedData] = useState<EnrichedPayment[]>([]);
  const [isHydrating, setIsHydrating] = useState(false);

  useEffect(() => {
    const hydrateUserData = async () => {
      if (!data || data.length === 0) {
        setEnrichedData([]);
        return;
      }

      setIsHydrating(true);

      const promises = data.map(async (item) => {
        const enrichedItem: EnrichedPayment = { ...item };

        try {
          if (item.payerId && !item.payerName) {
            try {
              const user = await accountService.getUserById(item.payerId);
              enrichedItem.fetchedPayerName = `${user.firstName} ${user.lastName}`;
              enrichedItem.fetchedPayerRole = user.role;
            } catch (err) {
              console.warn(`Cannot fetch payer ${item.payerId}`, err);
            }
          }

          if (item.payeeId && !item.payeeName) {
            try {
              const user = await accountService.getUserById(item.payeeId);
              
              enrichedItem.fetchedPayeeName = `${user.firstName} ${user.lastName}`;
              enrichedItem.fetchedPayeeRole = user.role;
            } catch (err) {
              console.warn(`Cannot fetch payee ${item.payeeId}`, err);
            }
          }
        } catch (error) {
          console.error("Hydration error", error);
        }

        return enrichedItem;
      });

      const results = await Promise.all(promises);
      setEnrichedData(results);
      setIsHydrating(false);
    };

    hydrateUserData();
  }, [data]);

  const getStatusVariant = (val: string) => {
    const map: Record<string, 'success' | 'pending' | 'failed' | 'warning' | 'default'> = {
      'SUCCESS': 'success', 'PAID': 'success', 'SYSTEM_SUCCESS': 'success',
      'PENDING': 'pending', 'SYSTEM_PENDING': 'pending',
      'FAILED': 'failed', 'CANCELLED': 'failed', 'SYSTEM_FAILED': 'failed',
      'OVERDUE': 'warning'
    };
    return map[val] || 'default';
  };

  const getTypeVariant = (val: string) => {
    const map: Record<string, any> = {
      'DEPOSIT': 'deposit', 'FULL_PAY': 'fullpay', 'MONTHLY': 'monthly',
      'INSTALLMENT': 'installment', 'SALARY': 'salary', 'BONUS': 'bonus',
      'SERVICE_FEE': 'advance', 'PENALTY': 'penalty', 'ADVANCE': 'advance',
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
            {enrichedData.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-8">No payments found.</td></tr>
            ) : enrichedData.map((item) => {
                const displayPayerName = item.payerName || item.fetchedPayerName;
                const displayPayerRole = item.payerRole || item.fetchedPayerRole;
                
                const displayPayeeName = item.payeeName || item.fetchedPayeeName;
                const displayPayeeRole = item.payeeRole || item.fetchedPayeeRole;

                return (
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

                {/* Payer Column */}
                <td className="px-6 py-4">
                  {isHydrating && !displayPayerName && item.payerId ? (
                      <div className="animate-pulse h-8 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                        <div className="h-3 w-20 bg-gray-200 rounded"></div>
                      </div>
                  ) : displayPayerName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                        {displayPayerName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 block text-xs">{displayPayerName}</span>
                        <span className="text-[10px] text-gray-400">{displayPayerRole || 'Unknown'}</span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic text-xs">
                      {item.payerId ? `ID: ...${item.payerId.slice(-4)}` : 'System'}
                    </span>
                  )}
                </td>

                {/* Payee Column */}
                <td className="px-6 py-4">
                  {isHydrating && !displayPayeeName && item.payeeId ? (
                      <div className="animate-pulse h-8 flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                        <div className="h-3 w-20 bg-gray-200 rounded"></div>
                      </div>
                  ) : displayPayeeName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs shrink-0">
                        {displayPayeeName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 block text-xs">{displayPayeeName}</span>
                        <span className="text-[10px] text-gray-400">{displayPayeeRole || 'Unknown'}</span>
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
            )})}
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