import React from 'react';
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

const payments = Array(10).fill(null).map((_, i) => ({
    id: `tx_${i}`,
    amount: i % 2 === 0 ? "5B" : "2.5B",
    type: i % 4 === 0 ? "Deposit" : i % 4 === 1 ? "Advance" : "Installment",
    status: i % 3 === 0 ? "Success" : i % 3 === 1 ? "Pending" : "Failed",
    payer: "User's Name",
    payee: i % 2 === 0 ? "User's Name" : "---",
    paidDate: "January 18th, 2025"
}));

interface PaymentTableProps {
    onViewDetail: (payment: any) => void;
}

export default function PaymentTable({ onViewDetail }: PaymentTableProps) {

  const getVariant = (val: string) => {
      const map: any = { 
          'Success': 'success', 'Pending': 'pending', 'Failed': 'failed',
          'Installment': 'installment', 'Deposit': 'deposit', 'Advance': 'advance'
      };
      return map[val] || 'default';
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
              <th className="px-6 py-4 font-bold text-gray-900">Paid date</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{item.amount}</td>
                
                {/* Type Badge */}
                <td className="px-6 py-4">
                    <Badge variant={getVariant(item.type)}>{item.type}</Badge>
                </td>
                
                {/* Status Badge */}
                <td className="px-6 py-4">
                    <Badge variant={getVariant(item.status)}>{item.status}</Badge>
                </td>

                <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                        <span className="font-medium text-gray-900">{item.payer}</span>
                    </div>
                </td>
                <td className="px-6 py-4">
                    {item.payee !== '---' ? (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                            <span className="font-medium text-gray-900">{item.payee}</span>
                        </div>
                    ) : (
                        <span className="text-gray-400">---</span>
                    )}
                </td>
                <td className="px-6 py-4 text-gray-900">{item.paidDate}</td>
                <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => onViewDetail(item)} 
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
      <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">1-10</span> of <span className="font-medium">97</span>
          </p>
          <div className="flex items-center gap-2">
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                 <button className="p-2 border border-gray-300 rounded-lg hover:bg-white text-gray-700 font-medium">
                    1/10
                </button>
                 <button className="p-2 border border-gray-300 rounded-lg hover:bg-white">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
          </div>
      </div>
    </div>
  );
}