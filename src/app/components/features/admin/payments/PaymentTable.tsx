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

  const getVariant = (val: string) => {
    const map: Record<string, 'success' | 'pending' | 'failed' | 'warning' | 'gray' | 'blue'> = {
      'SUCCESS': 'success', 'PAID': 'success',
      'PENDING': 'pending',
      'FAILED': 'failed', 'CANCELLED': 'failed',
      'OVERDUE': 'warning',
      'SALARY': 'blue', 'BONUS': 'blue',
      'INSTALLMENT': 'gray', 'DEPOSIT': 'gray', 'ADVANCE': 'gray'
    };
    return map[val] || 'gray';
  }

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
              <th className="px-6 py-4 font-bold text-gray-900">Type</th>
              <th className="px-6 py-4 font-bold text-gray-900">Status</th>
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
                <td className="px-6 py-4 font-bold text-gray-900">
                  {item.amount?.toLocaleString()} VNĐ
                </td>

                {/* Type Badge */}
                <td className="px-6 py-4">
                  <Badge variant={getVariant(item.paymentType)}>{item.paymentType}</Badge>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-4">
                  <Badge variant={getVariant(item.status)}>{item.status}</Badge>
                </td>

                <td className="px-6 py-4">
                  {item.payerName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs shrink-0">
                        {item.payerName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 block">{item.payerName}</span>
                        <span className="text-xs text-gray-400">{item.payerRole}</span>
                      </div>
                    </div>
                  ) : <span className="text-gray-400">---</span>}
                </td>

                <td className="px-6 py-4">
                  {item.payeeName ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs shrink-0">
                        {item.payeeName.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900 block">{item.payeeName}</span>
                        <span className="text-xs text-gray-400">{item.payeeRole}</span>
                      </div>
                    </div>
                  ) : <span className="text-gray-400">---</span>}
                </td>

                <td className="px-6 py-4 text-gray-900">
                  {/* Show Paid Date if success, otherwise Due Date or Created Date */}
                  {item.paidDate ? new Date(item.paidDate).toLocaleDateString() :
                    item.dueDate ? `Due: ${new Date(item.dueDate).toLocaleDateString()}` :
                      new Date(item.createdAt).toLocaleDateString()}
                </td>

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
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={itemsPerPage}
        onPageChange={onPageChange}
      />
    </div>
  );
}