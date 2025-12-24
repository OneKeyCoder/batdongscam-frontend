'use client';

import React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';

// Mock Data
const payments = Array(10).fill(null).map((_, i) => ({
    id: i + 1,
    amount: i % 2 === 0 ? "5B" : "2.5B",
    type: i % 3 === 0 ? "Installment" : (i % 3 === 1 ? "Advance" : "Deposit"),
    status: "Success",
    paidDate: "January 18th, 2025",
    payer: {
        name: "User's Name",
        role: "Customer" 
    },
    payee: {
        name: "User's Name",
        role: "Owner" 
    }
}));

const getTypeBadge = (type: string) => {
    switch(type) {
        case 'Installment': return <Badge variant="blue">{type}</Badge>;
        case 'Advance': return <Badge variant="pink">{type}</Badge>; 
        case 'Deposit': return <Badge variant="info">{type}</Badge>;
        default: return <Badge variant="default">{type}</Badge>;
    }
}

export default function AccountantPaymentTable() {
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
            {payments.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{item.amount}</td>
                <td className="px-6 py-4">
                    {getTypeBadge(item.type)}
                </td>
                <td className="px-6 py-4">
                    <Badge variant="success">{item.status}</Badge>
                </td>
                
                {/* Payer Column */}
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-200 shrink-0"></div>
                        <div>
                            <p className="font-bold text-gray-900 text-xs">{item.payer.name}</p>
                        </div>
                    </div>
                </td>

                {/* Payee Column */}
                <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-200 shrink-0"></div>
                        <div>
                            <p className="font-bold text-gray-900 text-xs">{item.payee.name}</p>
                        </div>
                    </div>
                </td>

                <td className="px-6 py-4 text-gray-900">{item.paidDate}</td>
                
                <td className="px-6 py-4 text-right">
                    {/* --- ACTION: EYE ICON LINKING TO DETAIL --- */}
                    <Link 
                        href={`/accountant/payments/${item.id}`} 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg inline-flex items-center justify-center transition-colors"
                    >
                        <Eye className="w-5 h-5" />
                    </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white text-sm text-gray-500 flex justify-between items-center">
          <span>1-10 of 97</span>
          <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center border rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100">&lt;</button>
              <button className="w-8 h-8 flex items-center justify-center border rounded-lg bg-white text-gray-600 font-medium">1/10</button>
              <button className="w-8 h-8 flex items-center justify-center border rounded-lg bg-white text-gray-600 hover:bg-gray-50">&gt;</button>
          </div>
      </div>
    </div>
  );
}