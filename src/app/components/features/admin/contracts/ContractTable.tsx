'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import Badge from '@/app/components/ui/Badge';
import Pagination from '@/app/components/Pagination';

const contracts = Array(10).fill(null).map((_, i) => ({
  id: i + 1,
  number: "Contract's number",
  propertyName: "Property's Name",
  price: "541,00.00 $",
  status: i === 0 ? "Cancelled" : (i === 1 ? "Active" : "Completed"),
  startTime: "7:00 PM\nJanuary 2nd, 2025",
  endTime: "7:00 PM\nJanuary 2nd, 2025",
  totalAmount: "10B",
  customer: "Nguyễn Văn A",
  customerTier: "GOLD"
}));

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'Cancelled': return <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-600">Cancelled</span>;
    case 'Active': return <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-600">Active</span>;
    case 'Completed': return <span className="px-2 py-1 rounded text-xs font-bold bg-emerald-100 text-emerald-600">Completed</span>;
    default: return null;
  }
}

export default function ContractTable() {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAgents = contracts.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 font-bold text-gray-900">Contracts</th>
              <th className="px-6 py-4 font-bold text-gray-900">Status</th>
              <th className="px-6 py-4 font-bold text-gray-900">Start time</th>
              <th className="px-6 py-4 font-bold text-gray-900">End time</th>
              <th className="px-6 py-4 font-bold text-gray-900">Total amount</th>
              <th className="px-6 py-4 font-bold text-gray-900">Customer</th>
              <th className="px-6 py-4 font-bold text-gray-900 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contracts.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg shrink-0"></div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">{item.number}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{item.propertyName}</p>
                      <p className="text-xs text-red-600 font-bold mt-0.5">{item.price}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4 text-gray-900 whitespace-pre-line">{item.startTime}</td>
                <td className="px-6 py-4 text-gray-900 whitespace-pre-line">{item.endTime}</td>
                <td className="px-6 py-4 font-bold text-gray-900">{item.totalAmount}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-gray-900 text-xs">{item.customer}</span>
                    <Badge variant="yellow" className="mt-1 text-[10px] px-1.5 py-0.5">{item.customerTier}</Badge>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/contracts/${item.id}`}
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
      <Pagination
        currentPage={currentPage}
        totalItems={contracts.length}
        pageSize={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}